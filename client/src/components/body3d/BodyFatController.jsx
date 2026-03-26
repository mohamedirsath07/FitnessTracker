/**
 * BodyFatController — Premium glassmorphism slider for body fat %
 *
 * Features:
 * - Smooth drag with gradient track matching body zones
 * - Animated percentage readout with zone glow
 * - Framer Motion spring transitions
 * - Dark luxury card with subtle gradients
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ZONES = [
  { max: 12, label: 'Essential', color: '#60a5fa', accent: '#3b82f6' },
  { max: 18, label: 'Athletic', color: '#3b82f6', accent: '#2563eb' },
  { max: 22, label: 'Fitness', color: '#22c55e', accent: '#16a34a' },
  { max: 26, label: 'Average', color: '#a1a1aa', accent: '#71717a' },
  { max: 30, label: 'Above Avg', color: '#a1a1aa', accent: '#71717a' },
];

function getZone(value) {
  return ZONES.find((z) => value <= z.max) || ZONES[ZONES.length - 1];
}

export default function BodyFatController({ value, onChange, min = 8, max = 35 }) {
  const zone = useMemo(() => getZone(value), [value]);
  const pct = ((value - min) / (max - min)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 25 }}
      className="w-full max-w-sm"
    >
      {/* Glass Card */}
      <div
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-4"
        style={{
          background: `linear-gradient(135deg, ${zone.color}06 0%, transparent 60%), rgba(10,10,12,0.8)`,
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Decorative top-right glow */}
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-[0.03] blur-2xl pointer-events-none"
          style={{ backgroundColor: zone.color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-gradient-to-b" style={{ background: `linear-gradient(to bottom, ${zone.color}, ${zone.accent})` }} />
            <span className="text-[11px] tracking-wider text-zinc-400 font-medium">
              Body Fat
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={value}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="text-2xl font-bold tabular-nums text-white"
              >
                {value}
              </motion.span>
            </AnimatePresence>
            <span className="text-sm text-zinc-500">%</span>
          </div>
        </div>

        {/* Slider Track */}
        <div className="relative h-10 flex items-center">
          {/* Background track */}
          <div className="absolute inset-x-0 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            {/* Filled portion */}
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, #3b82f6, ${zone.color})`,
                boxShadow: 'none',
              }}
              layout
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          </div>

          {/* Native range input (invisible, handles interaction) */}
          <input
            type="range"
            min={min}
            max={max}
            step={1}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
            style={{ height: '40px' }}
          />

          {/* Custom thumb */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: `calc(${pct}% - 9px)` }}
            layout
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div
              className="w-[18px] h-[18px] rounded-full border-2 border-white/90 bg-[#0a0a0c]"
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
              }}
            />
          </motion.div>
        </div>

        {/* Zone Label Badge */}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[10px] text-zinc-700 tabular-nums">{min}%</span>
          <motion.div
            layout
            className="px-3 py-0.5 rounded-full text-[10px] font-medium tracking-wider"
            style={{
              backgroundColor: 'rgba(255,255,255,0.04)',
              color: '#a1a1aa',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {zone.label}
          </motion.div>
          <span className="text-[10px] text-zinc-700 tabular-nums">{max}%</span>
        </div>

        {/* Zone scale indicators */}
        <div className="flex items-center justify-between mt-3 px-0.5">
          {ZONES.map((z, i) => {
            const isActive = zone === z;
            return (
              <div key={i} className="flex flex-col items-center gap-1">
                <motion.div
                  className="w-1.5 h-1.5 rounded-full"
                  animate={{
                    backgroundColor: isActive ? '#ffffff' : 'rgba(255,255,255,0.08)',
                    boxShadow: 'none',
                    scale: isActive ? 1.3 : 1,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <span
                  className="text-[8px] tracking-wider transition-colors duration-300"
                  style={{ color: isActive ? '#d4d4d8' : '#3f3f46' }}
                >
                  {z.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
