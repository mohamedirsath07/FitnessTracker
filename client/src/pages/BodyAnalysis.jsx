/**
 * BodyAnalysis Page — 3D Body Composition Analyzer
 *
 * Full-screen experience:
 * - Interactive 3D human model with real-time body fat morphing
 * - Clean control panels
 * - Calorie burn visualization
 * - Body composition metrics
 *
 * Layout: Full-screen 3D + floating overlays (desktop right + mobile bottom)
 */

import React, { useState, useCallback, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Activity, Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';

// Lazy load 3D components to keep main bundle slim
const BodyScene = React.lazy(() =>
  import('../components/body3d/BodyScene').then((m) => ({ default: m.default }))
);
const HumanModel = React.lazy(() =>
  import('../components/body3d/HumanModel').then((m) => ({ default: m.default }))
);

import {
  BodyFatController,
  CalorieBurnOverlay,
  BodyCompositionPanel,
} from '../components/body3d';

/* ──────────────────────────────────────────────
   Loading overlay — clean fade reveal
   ────────────────────────────────────────────── */
function SceneLoadingOverlay({ isLoading }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 15, 95));
    }, 200);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) setProgress(100);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#020204]"
        >
          {/* Simple spinner */}
          <div className="w-10 h-10 rounded-full border-2 border-white/[0.08] border-t-blue-500 animate-spin mb-6" />

          <p className="text-[11px] tracking-wider text-zinc-500 font-medium mb-4">
            Loading model...
          </p>

          <div className="w-48 h-[2px] rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-blue-500/60"
              style={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[9px] text-zinc-700 mt-2 tabular-nums">{Math.round(progress)}%</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
   Gender Toggle — pill switch
   ────────────────────────────────────────────── */
function GenderToggle({ gender, onChange }) {
  return (
    <div className="relative flex items-center gap-0.5 bg-white/[0.03] rounded-xl p-0.5 border border-white/[0.06]">
      <motion.div
        className="absolute top-0.5 bottom-0.5 rounded-[10px] bg-blue-500/10 border border-blue-500/20"
        layout
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          width: 'calc(50% - 2px)',
          left: gender === 'male' ? '2px' : 'calc(50%)',
        }}
      />
      {['male', 'female'].map((g) => (
        <button
          key={g}
          onClick={() => onChange(g)}
          className={`relative z-10 px-4 py-1.5 rounded-[10px] text-[10px] tracking-wider capitalize font-medium transition-colors duration-200 ${
            gender === g ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
          }`}
        >
          {g}
        </button>
      ))}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Quick Input with stepper
   ────────────────────────────────────────────── */
function QuickInput({ label, value, onChange, unit, min, max, step = 1, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2.5 group">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={12} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />}
        <span className="text-[11px] text-zinc-500 tracking-wide group-hover:text-zinc-400 transition-colors">{label}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-sm flex items-center justify-center active:scale-90"
        >
          −
        </button>
        <span className="text-sm font-semibold text-white tabular-nums w-12 text-center">
          {value}
          <span className="text-[9px] text-zinc-600 ml-0.5">{unit}</span>
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.06] text-zinc-500 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.1] transition-all text-sm flex items-center justify-center active:scale-90"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Status Badge — top-left floating indicator
   ────────────────────────────────────────────── */
function StatusBadge({ modelLoaded, bodyFat, calorieBurn }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: modelLoaded ? 1 : 0, x: modelLoaded ? 0 : -20 }}
      transition={{ delay: 1.0, type: 'spring', stiffness: 150 }}
      className="absolute top-[72px] left-4 z-20 space-y-2"
    >
      <div className="bg-black/50 backdrop-blur-2xl border border-white/[0.06] rounded-xl px-3 py-2">
        <p className="text-[8px] tracking-wider text-zinc-500 mb-0.5">Controls</p>
        <p className="text-[8px] tracking-wider text-zinc-600">Drag to rotate · Scroll to zoom</p>
      </div>

      <div className="bg-black/50 backdrop-blur-2xl border border-white/[0.06] rounded-xl px-3 py-2 space-y-1.5">
        <div className="flex gap-3">
          <div>
            <span className="text-[10px] font-medium text-white tabular-nums">{bodyFat}%</span>
            <span className="text-[7px] text-zinc-600 ml-1">Body fat</span>
          </div>
          <div>
            <span className="text-[10px] font-medium text-white tabular-nums">{calorieBurn}</span>
            <span className="text-[7px] text-zinc-600 ml-1">kcal</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ══════════════════════════════════════════════ */

export default function BodyAnalysis() {
  const navigate = useNavigate();

  const [bodyFat, setBodyFat] = useState(20);
  const [weight, setWeight] = useState(75);
  const [height, setHeight] = useState(175);
  const [gender, setGender] = useState('male');
  const [calorieBurn, setCalorieBurn] = useState(200);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [showPanel, setShowPanel] = useState(true);

  const handleModelLoaded = useCallback(() => {
    setModelLoaded(true);
  }, []);

  const resetDefaults = () => {
    setBodyFat(20);
    setWeight(75);
    setHeight(175);
    setCalorieBurn(200);
  };

  return (
    <div className="fixed inset-0 bg-[#020204] overflow-hidden">
      {/* ────── Top Bar ────── */}
      <motion.header
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 150, damping: 20 }}
        className="absolute top-0 inset-x-0 z-40"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#020204]/90 via-[#020204]/50 to-transparent pointer-events-none" />

        <div className="relative flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all active:scale-90"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h1 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
                Body Analysis
                <span className="text-[7px] tracking-wider text-zinc-500 bg-white/[0.04] px-1.5 py-0.5 rounded-full border border-white/[0.06]">
                  3D
                </span>
              </h1>
              <p className="text-[9px] text-zinc-600 tracking-wider">Composition breakdown</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GenderToggle gender={gender} onChange={setGender} />
            <button
              onClick={resetDefaults}
              className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all active:scale-90"
              title="Reset to defaults"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ────── 3D Viewport ────── */}
      <div className="absolute inset-0 z-[1]">
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_30%,#020204_100%)]" />
        <div className="absolute bottom-0 inset-x-0 h-56 z-10 pointer-events-none bg-gradient-to-t from-[#020204] via-[#020204]/70 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-[420px] z-10 pointer-events-none hidden lg:block bg-gradient-to-l from-[#020204]/80 via-[#020204]/30 to-transparent" />

        <SceneLoadingOverlay isLoading={!modelLoaded} />

        <Suspense fallback={null}>
          <BodyScene className="w-full h-full">
            <HumanModel
              gender={gender}
              bodyFat={bodyFat}
              calorieBurn={calorieBurn}
              onLoaded={handleModelLoaded}
            />
          </BodyScene>
        </Suspense>
      </div>

      {/* ────── Status Badge ────── */}
      <StatusBadge
        modelLoaded={modelLoaded}
        bodyFat={bodyFat}
        calorieBurn={calorieBurn}
      />

      {/* ────── Right Side Panel (Desktop) ────── */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 120, damping: 20 }}
        className="absolute z-20 right-0 top-0 bottom-0 w-[380px] hidden lg:flex flex-col justify-center pr-5 gap-3 overflow-y-auto py-20 scrollbar-none"
      >
        <BodyCompositionPanel
          weight={weight}
          bodyFat={bodyFat}
          height={height}
          gender={gender}
        />
        <BodyFatController value={bodyFat} onChange={setBodyFat} />
        <CalorieBurnOverlay calories={calorieBurn} onChange={setCalorieBurn} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c]/80 backdrop-blur-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-4 rounded-full bg-zinc-600" />
            <span className="text-[11px] tracking-wider text-zinc-400 font-medium">
              Parameters
            </span>
          </div>
          <QuickInput label="Weight" value={weight} onChange={setWeight} unit="kg" min={40} max={150} icon={Activity} />
          <div className="h-px bg-white/[0.04]" />
          <QuickInput label="Height" value={height} onChange={setHeight} unit="cm" min={140} max={220} icon={Zap} />
        </motion.div>
      </motion.div>

      {/* ────── Mobile Bottom Controls ────── */}
      <div className="lg:hidden absolute bottom-0 inset-x-0 z-20 pb-24">
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 25 }}
              className="px-4 space-y-3 max-h-[55vh] overflow-y-auto pb-2 scrollbar-none"
            >
              <BodyFatController value={bodyFat} onChange={setBodyFat} />
              <CalorieBurnOverlay calories={calorieBurn} onChange={setCalorieBurn} />

              <div className="rounded-2xl border border-white/[0.06] bg-[#0a0a0c]/80 backdrop-blur-2xl p-4">
                <QuickInput label="Weight" value={weight} onChange={setWeight} unit="kg" min={40} max={150} icon={Activity} />
                <div className="h-px bg-white/[0.04]" />
                <QuickInput label="Height" value={height} onChange={setHeight} unit="cm" min={140} max={220} icon={Zap} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-center mt-2 px-4">
          <button
            onClick={() => setShowPanel(!showPanel)}
            className="w-full max-w-sm py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-[10px] tracking-wider text-zinc-500 hover:text-white hover:bg-white/[0.06] transition-all flex items-center justify-center gap-2"
          >
            {showPanel ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            {showPanel ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>
      </div>

      <NavBar />
    </div>
  );
}
