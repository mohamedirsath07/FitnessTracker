/**
 * Body Visualizer — Lightweight SVG replacement (no Three.js)
 * Saves ~1.2MB from bundle. Works on low-end phones.
 */

import React, { useMemo } from 'react';

// Body fat category helpers
const getBodyFatCategory = (bodyFat, gender = 'male') => {
    const ranges = gender === 'female' ? {
        essential: 12, athletes: 18, fitness: 25, average: 32
    } : {
        essential: 5, athletes: 12, fitness: 18, average: 25
    };

    if (bodyFat <= ranges.essential) return { label: 'Essential', color: 'text-cyan-400', hex: '#22d3ee' };
    if (bodyFat <= ranges.athletes) return { label: 'Athletic', color: 'text-blue-400', hex: '#60a5fa' };
    if (bodyFat <= ranges.fitness) return { label: 'Fitness', color: 'text-green-400', hex: '#4ade80' };
    if (bodyFat <= ranges.average) return { label: 'Average', color: 'text-amber-400', hex: '#fbbf24' };
    return { label: 'Above Average', color: 'text-red-400', hex: '#f87171' };
};

const getBodyFatColor = (bodyFat, gender = 'male') => {
    return getBodyFatCategory(bodyFat, gender).hex;
};

export default function BodyVisualizer({ weight = 70, bodyFat = 20, gender = 'male', height = 170, compact = false }) {
    const bmi = useMemo(() => weight / ((height / 100) ** 2), [weight, height]);
    const category = useMemo(() => getBodyFatCategory(bodyFat, gender), [bodyFat, gender]);

    // Scale body width based on BMI
    const widthScale = useMemo(() => {
        const base = 1.0;
        const bmiOffset = (bmi - 22) / 22;
        return Math.max(0.8, Math.min(1.4, base + bmiOffset * 0.3));
    }, [bmi]);

    return (
        <div className={`relative w-full h-full ${compact ? 'min-h-[280px]' : 'min-h-[400px]'} bg-gradient-to-b from-zinc-900 via-zinc-900 to-black rounded-xl overflow-hidden flex flex-col items-center justify-center`}>
            {/* Category Badge */}
            {!compact && (
                <div className="absolute top-3 left-3 z-10">
                    <div className="bg-black/60 backdrop-blur px-2.5 py-1 rounded text-[9px] tracking-widest uppercase text-zinc-400">
                        Body Analysis
                    </div>
                    <div className={`mt-1.5 bg-black/70 backdrop-blur px-2.5 py-1.5 rounded text-[10px] font-semibold ${category.color} border-l-2`}
                        style={{ borderColor: 'currentColor' }}>
                        {category.label}
                    </div>
                </div>
            )}

            {/* Stats Overlay */}
            <div className={`absolute ${compact ? 'top-2 right-2' : 'top-3 right-3'} z-10 flex flex-col gap-1.5`}>
                {!compact && (
                    <>
                        <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border-l-2 border-cyan-500">
                            HEIGHT: {height}cm
                        </div>
                        <div className="bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono text-cyan-400 border-l-2 border-cyan-500">
                            WEIGHT: {weight}kg
                        </div>
                    </>
                )}
                <div className={`bg-black/70 backdrop-blur px-2.5 py-1 rounded text-[10px] font-mono border-l-2 ${category.color}`}
                    style={{ borderColor: 'currentColor' }}>
                    BODY FAT: {bodyFat}%
                </div>
            </div>

            {/* Body Fat Scale */}
            {!compact && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                    <div className="flex flex-col items-center gap-1">
                        <div className="text-[8px] text-zinc-500 -rotate-90 whitespace-nowrap mb-8">FAT %</div>
                        <div className="w-2 h-32 rounded-full bg-gradient-to-b from-cyan-400 via-green-400 via-amber-400 to-red-400 relative">
                            <div
                                className="absolute -left-1 w-4 h-1 bg-white rounded-full shadow-lg shadow-white/50 transition-all duration-500"
                                style={{
                                    top: `${Math.min(Math.max((bodyFat - 5) / 40 * 100, 0), 100)}%`,
                                    transform: 'translateY(-50%)'
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* SVG Body Silhouette */}
            <div className="relative">
                <svg
                    viewBox="0 0 120 220"
                    className="w-28 h-44"
                    style={{ transform: `scaleX(${widthScale})` }}
                >
                    <defs>
                        <linearGradient id="bodyGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={category.hex} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={category.hex} stopOpacity="0.1" />
                        </linearGradient>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    {/* Head */}
                    <ellipse cx="60" cy="28" rx="18" ry="22" fill="url(#bodyGradient)" stroke={category.hex} strokeWidth="1" strokeOpacity="0.4" filter="url(#glow)" />
                    {/* Neck */}
                    <rect x="52" y="48" width="16" height="10" rx="4" fill="url(#bodyGradient)" stroke={category.hex} strokeWidth="0.5" strokeOpacity="0.3" />
                    {/* Torso */}
                    <rect x="32" y="56" width="56" height="65" rx="14" fill="url(#bodyGradient)" stroke={category.hex} strokeWidth="1" strokeOpacity="0.4" filter="url(#glow)" />
                    {/* Left Arm */}
                    <rect x="16" y="60" width="16" height="52" rx="8" fill="url(#bodyGradient)" stroke={category.hex} strokeWidth="0.5" strokeOpacity="0.3" />
                    {/* Right Arm */}
                    <rect x="88" y="60" width="16" height="52" rx="8" fill="url(#bodyGradient)" stroke={category.hex} strokeWidth="0.5" strokeOpacity="0.3" />
                    {/* Left Leg */}
                    <rect x="36" y="121" width="20" height="65" rx="9" fill="url(#bodyGradient)" stroke={category.hex} strokeWidth="0.5" strokeOpacity="0.3" />
                    {/* Right Leg */}
                    <rect x="64" y="121" width="20" height="65" rx="9" fill="url(#bodyGradient)" stroke={category.hex} strokeWidth="0.5" strokeOpacity="0.3" />
                </svg>

                {/* Pulse Glow */}
                <div className="absolute inset-0 rounded-full blur-2xl animate-pulse" style={{ backgroundColor: `${category.hex}10` }} />

                {/* Scan Line Effect */}
                <div className="absolute left-0 right-0 h-0.5 animate-scan-line" style={{ backgroundColor: `${category.hex}60` }} />
            </div>

            {/* Weight + BMI Display */}
            <div className="mt-6 text-center z-10">
                <p className="text-2xl font-bold text-white">{weight} <span className="text-sm text-zinc-400">kg</span></p>
                <p className="text-sm text-zinc-500">BMI: {bmi.toFixed(1)} · {
                    bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
                }</p>
            </div>

            <style>{`
                @keyframes scan-line {
                    0%, 100% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    50% { top: 85%; }
                }
                .animate-scan-line {
                    animation: scan-line 3s ease-in-out infinite;
                    position: absolute;
                }
            `}</style>
        </div>
    );
}

export { getBodyFatCategory, getBodyFatColor };
