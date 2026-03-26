/**
 * CalorieBurnOverlay — Real-time calorie burn visualization
 *
 * Displays calorie metrics with animated heat-map style UI.
 * Features:
 * - Animated flame intensity based on burn rate
 * - Smooth counter with spring physics
 * - Heat zones color coding
 * - Glassmorphism card styling
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useSpring, useTransform } from 'framer-motion';

const HEAT_LEVELS = [
  { max: 100, label: 'Rest', color: '#3b82f6', flame: 0.2 },
  { max: 250, label: 'Light', color: '#60a5fa', flame: 0.4 },
  { max: 400, label: 'Moderate', color: '#f59e0b', flame: 0.6 },
  { max: 550, label: 'Intense', color: '#f97316', flame: 0.8 },
  { max: 9999, label: 'Maximum', color: '#ef4444', flame: 1.0 },
];

function getHeatLevel(cal) {
  return HEAT_LEVELS.find((h) => cal <= h.max) || HEAT_LEVELS[HEAT_LEVELS.length - 1];
}

/** Animated number counter using spring physics */
function AnimatedNumber({ value, className = '' }) {
  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v));
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  useEffect(() => {
    const unsub = display.on('change', (v) => setDisplayValue(v));
    return unsub;
  }, [display]);

  return <span className={className}>{displayValue}</span>;
}

/** Flame icon — SVG with animated glow */
function FlameIcon({ intensity, color }) {
  return (
    <div className="relative">
      <svg
        width="20"
        height="24"
        viewBox="0 0 24 32"
        fill="none"
        className="relative z-10"
      >
        <path
          d="M12 0C12 0 4 10 4 18C4 24 8 28 12 30C16 28 20 24 20 18C20 10 12 0 12 0Z"
          fill={color}
          opacity={0.9}
        />
        <path
          d="M12 8C12 8 8 14 8 20C8 24 10 26 12 28C14 26 16 24 16 20C16 14 12 8 12 8Z"
          fill="white"
          opacity={0.3}
        />
      </svg>
      {/* Glow behind flame */}
      <div
        className="absolute inset-0 blur-md rounded-full -z-0"
        style={{
          backgroundColor: color,
          opacity: intensity * 0.25,
          transform: `scale(${1 + intensity * 0.3})`,
        }}
      />
    </div>
  );
}

export default function CalorieBurnOverlay({ calories = 0, onChange }) {
  const heat = getHeatLevel(calories);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 25 }}
      className="w-full max-w-sm"
    >
      {/* Card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4"
        style={{
          background: `linear-gradient(135deg, ${heat.color}08 0%, transparent 60%), rgba(10,10,12,0.8)`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Animated heat gradient background */}
        <motion.div
          className="absolute inset-0 opacity-[0.03]"
          animate={{
            background: [
              `radial-gradient(circle at 30% 50%, ${heat.color} 0%, transparent 60%)`,
              `radial-gradient(circle at 70% 50%, ${heat.color} 0%, transparent 60%)`,
              `radial-gradient(circle at 30% 50%, ${heat.color} 0%, transparent 60%)`,
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FlameIcon intensity={heat.flame} color={heat.color} />
              <div>
                <p className="text-[11px] tracking-wider text-zinc-400 font-medium">
                  Calorie Burn
                </p>
                <p className="text-[9px] text-zinc-600 mt-0.5">
                  Adjust to see body heat response
                </p>
              </div>
            </div>
            <motion.div
              className="px-2 py-0.5 rounded-full text-[9px] font-medium tracking-wider"
              style={{
                backgroundColor: `${heat.color}15`,
                color: heat.color,
                border: `1px solid ${heat.color}20`,
              }}
              layout
            >
              {heat.label}
            </motion.div>
          </div>

          {/* Calorie count */}
          <div className="flex items-baseline gap-1 mb-3">
            <AnimatedNumber
              value={calories}
              className="text-3xl font-bold tabular-nums text-white"
            />
            <span className="text-sm text-zinc-500">kcal</span>
          </div>

          {/* Slider */}
          <div className="relative h-8 flex items-center">
            <div className="absolute inset-x-0 h-1 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  width: `${(calories / 700) * 100}%`,
                  background: `linear-gradient(90deg, #3b82f6, ${heat.color})`,
                  boxShadow: `0 0 10px ${heat.color}20`,
                }}
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={700}
              step={10}
              value={calories}
              onChange={(e) => onChange(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
              style={{ height: '32px' }}
            />
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `calc(${(calories / 700) * 100}% - 7px)` }}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <div
                className="w-3.5 h-3.5 rounded-full border-2 border-white/80 bg-black"
                style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}
              />
            </motion.div>
          </div>

          {/* Heat bar segments */}
          <div className="flex gap-1 mt-3">
            {HEAT_LEVELS.slice(0, -1).map((level, i) => {
              const isActive = calories >= (i === 0 ? 0 : HEAT_LEVELS[i - 1].max);
              const isCurrent = heat === level;
              return (
                <div
                  key={i}
                  className="flex-1 h-1 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor: isActive ? level.color : 'rgba(255,255,255,0.05)',
                    opacity: isCurrent ? 1 : isActive ? 0.5 : 0.3,
                    boxShadow: isCurrent ? `0 0 6px ${level.color}40` : 'none',
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
