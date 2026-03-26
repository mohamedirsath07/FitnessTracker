import React from 'react';
import { Dumbbell, Utensils, Target, ChevronRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MILESTONES = [
    { id: 'workout', icon: Dumbbell, label: 'Log your first workout', route: '/workout', color: 'blue' },
    { id: 'meal',    icon: Utensils, label: 'Log a meal',             route: '/nutrition', color: 'emerald' },
    { id: 'quest',   icon: Target,   label: 'Complete a quest',       route: '/quests', color: 'amber' },
];

const COLOR_MAP = {
    blue:    { bg: 'bg-blue-500/10',    text: 'text-blue-400',    ring: 'ring-blue-500/20',    check: 'bg-blue-500' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', ring: 'ring-emerald-500/20', check: 'bg-emerald-500' },
    amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   ring: 'ring-amber-500/20',   check: 'bg-amber-500' },
};

/**
 * OnboardingHero — shown on Dashboard for new users (onboardingComplete === false).
 *
 * Props:
 *   stats  — dashboard stats object (today.caloriesBurned, today.caloriesConsumed)
 *   quests — active quests array
 */
export default function OnboardingHero({ stats, quests }) {
    const navigate = useNavigate();

    const completed = {
        workout: (stats?.today?.caloriesBurned || 0) > 0,
        meal:    (stats?.today?.caloriesConsumed || 0) > 0,
        quest:   quests?.some(q => q.completed) || false,
    };

    const doneCount = Object.values(completed).filter(Boolean).length;

    return (
        <div className="animate-fade-up rounded-2xl border border-white/[0.06] bg-gradient-to-b from-blue-500/[0.04] to-transparent p-5">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-1">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Sparkles size={16} className="text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold">Welcome — let's get started</h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">{doneCount}/3 starter goals complete</p>
                </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden mt-4 mb-5">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-700"
                    style={{ width: `${(doneCount / 3) * 100}%` }}
                />
            </div>

            {/* Milestones */}
            <div className="space-y-2.5">
                {MILESTONES.map(m => {
                    const done = completed[m.id];
                    const c = COLOR_MAP[m.color];
                    const Icon = m.icon;

                    return (
                        <button
                            key={m.id}
                            onClick={() => !done && navigate(m.route)}
                            disabled={done}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                done
                                    ? 'border-white/[0.04] bg-white/[0.02] opacity-60'
                                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] active:scale-[0.98]'
                            }`}
                        >
                            {/* Icon / check */}
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${done ? c.check : c.bg}`}>
                                {done ? (
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d="M3 7l3 3 5-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : (
                                    <Icon size={16} className={c.text} />
                                )}
                            </div>

                            {/* Label */}
                            <span className={`text-[13px] font-medium flex-1 text-left ${done ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
                                {m.label}
                            </span>

                            {/* Arrow */}
                            {!done && <ChevronRight size={14} className="text-zinc-600 shrink-0" />}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
