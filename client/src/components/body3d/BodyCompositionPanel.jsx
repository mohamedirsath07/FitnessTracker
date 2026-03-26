/**
 * BodyCompositionPanel — Premium stats panel with glassmorphism
 *
 * Displays computed body metrics alongside the 3D model:
 * - Lean mass vs fat mass breakdown with dual-ring chart
 * - BMI classification with color coding
 * - Metabolic rate estimate (Mifflin-St Jeor)
 * - Animated entries with stagger
 * - Dark luxury card with subtle gradients
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/* ──────────────────────────────────────────────
   Metric computation helpers
   ────────────────────────────────────────────── */

function computeMetrics(weight, bodyFat, height, gender) {
  const fatMass = weight * (bodyFat / 100);
  const leanMass = weight - fatMass;
  const bmi = weight / ((height / 100) ** 2);

  // Mifflin-St Jeor BMR estimation
  const bmr =
    gender === 'female'
      ? 10 * weight + 6.25 * height - 5 * 25 - 161
      : 10 * weight + 6.25 * height - 5 * 25 + 5;

  const bmiCategory =
    bmi < 18.5 ? 'Underweight' :
    bmi < 25 ? 'Normal' :
    bmi < 30 ? 'Overweight' : 'Obese';

  const bmiColor =
    bmi < 18.5 ? '#60a5fa' :
    bmi < 25 ? '#4ade80' :
    bmi < 30 ? '#fbbf24' : '#f87171';

  return { fatMass, leanMass, bmi, bmr, bmiCategory, bmiColor };
}

/** Circular progress ring with glow */
function CompositionRing({ percentage, color, size = 64, strokeWidth = 4 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - percentage / 100);

  return (
    <svg width={size} height={size} className="-rotate-90">
      {/* Background ring */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.04)"
        strokeWidth={strokeWidth}
      />
      {/* Track ticks for premium feel */}
      {Array.from({ length: 40 }, (_, i) => {
        const angle = (i / 40) * 360;
        const rad = (angle * Math.PI) / 180;
        const x1 = size / 2 + (radius - 1) * Math.cos(rad);
        const y1 = size / 2 + (radius - 1) * Math.sin(rad);
        const x2 = size / 2 + (radius + 1) * Math.cos(rad);
        const y2 = size / 2 + (radius + 1) * Math.sin(rad);
        return (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={0.5}
          />
        );
      })}
      {/* Filled ring */}
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
        style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
      />
    </svg>
  );
}

/** Individual stat metric row */
function MetricRow({ label, value, unit, color, delay = 0, icon }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, type: 'spring', stiffness: 200, damping: 25 }}
      className="flex items-center justify-between py-2.5 border-b border-white/[0.03] last:border-0 group"
    >
      <div className="flex items-center gap-2">
        {icon && (
          <div
            className="w-1 h-4 rounded-full"
            style={{ background: `linear-gradient(to bottom, ${color || '#fff'}80, transparent)` }}
          />
        )}
        <span className="text-[11px] text-zinc-500 tracking-wide group-hover:text-zinc-400 transition-colors">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-semibold tabular-nums" style={{ color: color || '#fafafa' }}>
          {value}
        </span>
        {unit && <span className="text-[10px] text-zinc-600">{unit}</span>}
      </div>
    </motion.div>
  );
}

export default function BodyCompositionPanel({
  weight = 70,
  bodyFat = 20,
  height = 170,
  gender = 'male',
}) {
  const m = useMemo(
    () => computeMetrics(weight, bodyFat, height, gender),
    [weight, bodyFat, height, gender]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 25 }}
      className="w-full max-w-sm"
    >
      {/* Glass card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0c]/80 backdrop-blur-2xl p-5">
        {/* Decorative gradient */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-[radial-gradient(circle,rgba(59,130,246,0.03)_0%,transparent_70%)] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[radial-gradient(circle,rgba(161,161,170,0.02)_0%,transparent_70%)] translate-y-1/2 -translate-x-1/4" />

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 rounded-full bg-blue-500" />
          <h3 className="text-[11px] tracking-wider text-zinc-400 font-medium">
            Body Composition
          </h3>
        </div>

        {/* Ring + Large stat */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative">
            <CompositionRing percentage={100 - bodyFat} color="#3b82f6" size={76} strokeWidth={5} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.span
                key={bodyFat}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-lg font-bold text-white tabular-nums"
              >
                {bodyFat}
              </motion.span>
              <span className="text-[7px] text-zinc-600 -mt-0.5 tracking-widest uppercase">Fat %</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[10px] text-zinc-400">Lean {(100 - bodyFat).toFixed(0)}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[10px] text-zinc-400">Fat {bodyFat}%</span>
              </div>
            </div>
            {/* Horizontal bar */}
            <div className="h-2.5 rounded-full bg-white/[0.04] overflow-hidden flex border border-white/[0.04]">
              <motion.div
                className="h-full rounded-l-full"
                style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
                initial={{ width: 0 }}
                animate={{ width: `${100 - bodyFat}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
              />
              <motion.div
                className="h-full rounded-r-full"
                style={{ background: 'linear-gradient(90deg, #d97706, #f59e0b)' }}
                initial={{ width: 0 }}
                animate={{ width: `${bodyFat}%` }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
              />
            </div>
            {/* Mass values under bar */}
            <div className="flex justify-between mt-1.5">
              <span className="text-[9px] text-blue-400/70 tabular-nums">{m.leanMass.toFixed(1)} kg</span>
              <span className="text-[9px] text-amber-500/70 tabular-nums">{m.fatMass.toFixed(1)} kg</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-1" />

        {/* Metrics grid */}
        <div className="space-y-0">
          <MetricRow label="Lean Mass" value={m.leanMass.toFixed(1)} unit="kg" color="#3b82f6" delay={0.3} icon />
          <MetricRow label="Fat Mass" value={m.fatMass.toFixed(1)} unit="kg" color="#fbbf24" delay={0.35} icon />
          <MetricRow label="BMI" value={m.bmi.toFixed(1)} unit={m.bmiCategory} color={m.bmiColor} delay={0.4} icon />
          <MetricRow label="BMR" value={Math.round(m.bmr)} unit="kcal/day" color="#a78bfa" delay={0.45} icon />
          <MetricRow label="Weight" value={weight} unit="kg" delay={0.5} />
          <MetricRow label="Height" value={height} unit="cm" delay={0.55} />
        </div>
      </div>
    </motion.div>
  );
}
