import React from 'react';
import XPBar from './XPBar';

const LEVELS = [
    { rank: 'E', minXp: 0, color: '#6B7280', label: 'Novice' },
    { rank: 'D', minXp: 1000, color: '#64748B', label: 'Apprentice' },
    { rank: 'C', minXp: 2500, color: '#3B82F6', label: 'Skilled' },
    { rank: 'B', minXp: 5000, color: '#10B981', label: 'Advanced' },
    { rank: 'A', minXp: 10000, color: '#F59E0B', label: 'Elite' },
    { rank: 'S', minXp: 20000, color: '#EF4444', label: 'Champion' },
    { rank: 'NATIONAL', minXp: 50000, color: '#8B5CF6', label: 'National' },
];

export const calculateLevel = (xp) => {
    return [...LEVELS].reverse().find(l => xp >= l.minXp) || LEVELS[0];
};

export const getNextLevel = (xp) => {
    const currentIndex = LEVELS.findIndex(l => l === calculateLevel(xp));
    return LEVELS[currentIndex + 1] || null;
};

export default function RankBadge({ xp, showProgress = true, compact = false }) {
    const level = calculateLevel(xp);
    const nextLevel = getNextLevel(xp);
    const xpInCurrentLevel = xp - level.minXp;
    const xpForNextLevel = nextLevel ? nextLevel.minXp - level.minXp : 1;

    if (compact) {
        return (
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <span
                    className="text-xs font-bold"
                    style={{ color: level.color }}
                >
                    {level.rank}
                </span>
                <span className="text-[10px] text-zinc-500 font-medium">Level</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-5">
            <div className="text-[9px] tracking-wider text-zinc-600 font-medium mb-3">
                Level
            </div>

            {/* Rank Letter */}
            <div className="relative py-3">
                <div
                    className="text-6xl font-bold tracking-tight"
                    style={{ color: level.color }}
                >
                    {level.rank}
                </div>
            </div>

            {/* Rank Label */}
            <div className="text-[10px] tracking-wider font-medium mt-1 mb-4" style={{ color: level.color }}>
                {level.label}
            </div>

            {/* XP Progress */}
            {showProgress && (
                <XPBar
                    current={xpInCurrentLevel}
                    max={xpForNextLevel}
                    rank={level.rank}
                    className="w-full"
                />
            )}
        </div>
    );
}
