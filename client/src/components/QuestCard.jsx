import React from 'react';
import { Target, CheckCircle2, Dumbbell, Utensils, Flame, Trophy } from 'lucide-react';

const ICON_MAP = {
    workout: Dumbbell,
    nutrition: Utensils,
    streak: Flame,
    general: Target,
    trophy: Trophy,
};

const DIFF = {
    easy: { dot: 'bg-emerald-400', text: 'text-emerald-400', bg: 'border-white/[0.06] bg-white/[0.02]' },
    medium: { dot: 'bg-amber-400', text: 'text-amber-400', bg: 'border-white/[0.06] bg-white/[0.02]' },
    hard: { dot: 'bg-rose-400', text: 'text-rose-400', bg: 'border-white/[0.06] bg-white/[0.02]' },
};

export default function QuestCard({ quest, compact = false }) {
    const {
        title = 'Quest',
        icon = 'general',
        target = 1,
        progress = 0,
        xpReward = 0,
        completed = false,
        type = 'daily',
        difficulty = 'easy',
    } = quest || {};

    const pct = Math.min((progress / target) * 100, 100);
    const IconComp = ICON_MAP[icon] || ICON_MAP[quest?.category] || Target;
    const d = DIFF[difficulty] || DIFF.easy;

    if (compact) {
        return (
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${d.bg} transition-all duration-200 ${completed ? 'opacity-50' : 'hover:border-white/[0.12]'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${completed ? 'bg-emerald-500/15' : 'bg-white/[0.04]'}`}>
                    {completed
                        ? <CheckCircle2 size={15} className="text-emerald-400" />
                        : <IconComp size={15} className={d.text} />
                    }
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${completed ? 'line-through text-zinc-500' : 'text-white'}`}>{title}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${completed ? 'bg-emerald-400' : 'bg-blue-500'}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <span className="text-[10px] text-zinc-500 tabular-nums">{progress}/{target}</span>
                    </div>
                </div>
                <span className="text-[10px] text-zinc-400 whitespace-nowrap">+{xpReward} pts</span>
            </div>
        );
    }

    return (
        <div className={`p-4 rounded-2xl border ${d.bg} transition-all duration-200 ${completed ? 'opacity-50' : 'hover:border-white/[0.12] hover:-translate-y-0.5'}`}>
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${completed ? 'bg-emerald-500/15' : 'bg-white/[0.04]'}`}>
                        {completed
                            ? <CheckCircle2 size={18} className="text-emerald-400" />
                            : <IconComp size={18} className={d.text} />
                        }
                    </div>
                    <div>
                        <p className={`text-sm font-semibold ${completed ? 'line-through text-zinc-500' : 'text-white'}`}>{title}</p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${d.dot}`} />
                            <span className={`text-[10px] capitalize ${d.text}`}>{difficulty}</span>
                            <span className="text-zinc-700 text-[10px]">·</span>
                            <span className="text-[10px] text-zinc-500">
                                {type === 'weekly' ? 'Weekly' : 'Daily'}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-zinc-800 px-2 py-1 rounded-lg border border-white/[0.06]">
                    <Trophy size={11} className="text-zinc-400" />
                    <span className="text-[11px] text-zinc-300 font-medium">{xpReward} pts</span>
                </div>
            </div>

            {/* Progress */}
            <div className="mt-3">
                <div className="flex justify-between text-[10px] mb-1.5">
                    <span className="text-zinc-500">Progress</span>
                    <span className={`${completed ? 'text-emerald-400' : 'text-zinc-400'}`}>{progress}/{target}</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${completed ? 'bg-emerald-400' : 'bg-blue-500'}`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
            </div>

            {completed && (
                <div className="mt-2.5 flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                    <CheckCircle2 size={10} />
                    Completed
                </div>
            )}
        </div>
    );
}
