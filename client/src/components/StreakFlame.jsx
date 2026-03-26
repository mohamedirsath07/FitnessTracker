import React from 'react';
import { Flame } from 'lucide-react';

const STREAK_TIERS = [
    { min: 0, label: '', color: 'text-zinc-600', glow: '' },
    { min: 3, label: 'Warming Up', color: 'text-orange-400', glow: 'shadow-orange-500/10' },
    { min: 7, label: 'On Fire', color: 'text-orange-500', glow: 'shadow-orange-500/20' },
    { min: 14, label: 'Blazing', color: 'text-red-500', glow: 'shadow-red-500/20' },
    { min: 30, label: 'Inferno', color: 'text-red-400', glow: 'shadow-red-400/30' },
    { min: 60, label: 'Legendary', color: 'text-amber-400', glow: 'shadow-amber-400/30' },
    { min: 100, label: 'Immortal', color: 'text-yellow-300', glow: 'shadow-yellow-300/30' },
];

function getTier(streak) {
    return [...STREAK_TIERS].reverse().find(t => streak >= t.min) || STREAK_TIERS[0];
}

export default function StreakFlame({ streak = 0, compact = false }) {
    const tier = getTier(streak);

    if (compact) {
        return (
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/15 ${tier.color}`}>
                <Flame size={11} fill="currentColor" className={streak >= 3 ? 'animate-streak-pulse' : ''} />
                <span className="text-[11px] font-bold tabular-nums">{streak}</span>
            </div>
        );
    }

    // Find next milestone
    const next = STREAK_TIERS.find(t => t.min > streak);
    const prev = [...STREAK_TIERS].reverse().find(t => t.min <= streak);
    const milestoneProgress = next && prev ? ((streak - prev.min) / (next.min - prev.min)) * 100 : 100;

    return (
        <div className={`relative flex flex-col items-center p-5 rounded-2xl bg-[#0A0A0C] border border-white/[0.06] ${tier.glow} shadow-lg`}>
            {/* Fire icon */}
            <div className="relative mb-2">
                <Flame
                    size={44}
                    className={`${tier.color} ${streak > 0 ? 'animate-streak-pulse' : ''}`}
                    fill={streak > 0 ? 'currentColor' : 'none'}
                />
                {streak >= 7 && (
                    <div className="absolute -inset-3 rounded-full blur-xl opacity-20 animate-pulse"
                        style={{ backgroundColor: streak >= 30 ? '#ef4444' : '#f97316' }}
                    />
                )}
            </div>

            {/* Count */}
            <div className="text-3xl font-bold text-white font-mono tabular-nums">{streak}</div>
            <div className="text-[9px] text-zinc-500 uppercase tracking-[0.2em] mt-0.5">Day Streak</div>

            {/* Tier label */}
            {tier.label && (
                <div className={`mt-2 text-[10px] font-semibold uppercase tracking-[0.15em] ${tier.color}`}>
                    {tier.label}
                </div>
            )}

            {/* Milestone bar */}
            {streak > 0 && next && (
                <div className="w-full mt-3">
                    <div className="flex justify-between text-[9px] text-zinc-600 mb-1 font-mono">
                        <span>{prev.min}d</span>
                        <span>{next.min}d — {next.label}</span>
                    </div>
                    <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
                            style={{ width: `${milestoneProgress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
