/**
 * DashboardRankBadge — Animated SVG rank display
 *
 * Replaces the 3D DashboardHero with a ~2KB SVG component.
 * - Radial progress ring showing XP toward next rank
 * - Rank letter with rank-colored glow on level-up
 * - Streak display integrated below
 * - Pure CSS animations, no external libraries
 */

import React from 'react';
import { Flame } from 'lucide-react';
import { calculateLevel, getNextLevel } from './RankBadge';

const RANK_COLORS = {
    E: '#6B7280',
    D: '#64748B',
    C: '#3B82F6',
    B: '#10B981',
    A: '#F59E0B',
    S: '#EF4444',
    NATIONAL: '#8B5CF6',
};

export default function DashboardRankBadge({ xp = 0, streak = 0, rankUp = false }) {
    const level = calculateLevel(xp);
    const nextLevel = getNextLevel(xp);
    const xpInLevel = xp - level.minXp;
    const xpForNext = nextLevel ? nextLevel.minXp - level.minXp : 1;
    const progress = Math.min(xpInLevel / xpForNext, 1);
    const color = RANK_COLORS[level.rank] || RANK_COLORS.E;

    // SVG ring math
    const size = 120;
    const strokeWidth = 3;
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - progress);

    return (
        <div className="flex flex-col items-center justify-center py-4 px-3">
            {/* Ring + Rank letter */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    viewBox={`0 0 ${size} ${size}`}
                    className="transform -rotate-90"
                >
                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="rgba(255,255,255,0.04)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Progress ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={dashOffset}
                        className="transition-[stroke-dashoffset] duration-1000 ease-out"
                        style={{ opacity: 0.8 }}
                    />
                </svg>

                {/* Rank letter centered */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className={`text-4xl font-bold tracking-tight leading-none${rankUp ? ' animate-rank-shimmer' : ''}`}
                        style={{ color }}
                    >
                        {level.rank}
                    </span>
                    <span
                        className="text-[9px] tracking-widest font-medium mt-1 uppercase"
                        style={{ color, opacity: 0.7 }}
                    >
                        {level.label}
                    </span>
                    {rankUp && (
                        <span
                            className="text-[9px] font-bold tracking-wider mt-0.5 animate-rank-label"
                            style={{ color }}
                        >
                            RANK UP!
                        </span>
                    )}
                </div>
            </div>

            {/* XP to next rank */}
            <div className="mt-3 text-center">
                <div className="text-[11px] text-zinc-500 tabular-nums">
                    <span className="text-zinc-300 font-medium">{xpInLevel.toLocaleString()}</span>
                    <span className="mx-0.5">/</span>
                    <span>{xpForNext.toLocaleString()} XP</span>
                </div>
                {nextLevel && (
                    <div className="text-[9px] text-zinc-600 mt-0.5">
                        to {nextLevel.rank} rank
                    </div>
                )}
            </div>

            {/* Streak */}
            {streak > 0 && (
                <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-lg bg-orange-500/[0.06] border border-orange-500/[0.08]">
                    <Flame size={12} className="text-orange-400" fill="currentColor" />
                    <span className="text-xs font-semibold text-orange-400 tabular-nums">{streak}</span>
                    <span className="text-[10px] text-orange-400/60">day streak</span>
                </div>
            )}
        </div>
    );
}
