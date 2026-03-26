import React from 'react';

const RANK_COLORS = {
    E: '#6B7280',
    D: '#64748B',
    C: '#06B6D4',
    B: '#10B981',
    A: '#F59E0B',
    S: '#EF4444',
    NATIONAL: '#8B5CF6',
};

export default function XPBar({
    current = 0,
    max = 1000,
    rank = 'E',
    showLabel = true,
    size = 'md',
    className = '',
}) {
    const pct = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    const color = RANK_COLORS[rank] || RANK_COLORS.E;

    const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2.5' };

    return (
        <div className={`w-full ${className}`}>
            {showLabel && (
                <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] uppercase tracking-[0.1em] text-zinc-500 font-medium">EXP</span>
                    <span className="text-[11px] font-mono text-zinc-400">
                        {current.toLocaleString()} <span className="text-zinc-600">/</span> {max.toLocaleString()}
                    </span>
                </div>
            )}
            <div className={`w-full ${heights[size]} bg-white/[0.06] rounded-full overflow-hidden relative`}>
                <div
                    className="h-full rounded-full animate-progress-fill relative"
                    style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}CC, ${color})`,
                        boxShadow: `0 0 12px ${color}40`,
                    }}
                >
                    {/* Sparkle at tip */}
                    {pct > 3 && pct < 100 && (
                        <div
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
