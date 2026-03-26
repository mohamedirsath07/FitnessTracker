import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Target, Dumbbell, Utensils, Flame, ChevronRight, CheckCircle2 } from 'lucide-react';

const ICON_MAP = {
    workout: Dumbbell,
    nutrition: Utensils,
    streak: Flame,
    general: Target,
};

const ROUTE_MAP = {
    workout: '/workout',
    workout_count: '/workout',
    nutrition: '/nutrition',
    streak: '/workout',
};

/**
 * TodaysMission — highlights the highest-XP incomplete quest as a prominent card.
 * If all quests are complete, shows a success message.
 *
 * Props:
 *   quests — active quests array from questAPI
 */
export default function TodaysMission({ quests }) {
    const navigate = useNavigate();

    if (!quests || quests.length === 0) return null;

    const allComplete = quests.every(q => q.completed);

    if (allComplete) {
        return (
            <div className="animate-mission-complete rounded-2xl border border-emerald-500/15 bg-emerald-500/[0.04] p-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0 animate-badge-pulse">
                        <CheckCircle2 size={20} className="text-emerald-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-emerald-300">All missions complete today</h3>
                        <p className="text-[11px] text-zinc-500 mt-0.5">🔥 Your streak is safe. Come back tomorrow.</p>
                    </div>
                </div>
            </div>
        );
    }

    // Prioritize daily quests (habit-building) over weekly.
    // Within each tier, pick highest XP.
    const incomplete = quests.filter(q => !q.completed);
    const dailyIncomplete = incomplete.filter(q => q.type === 'daily');
    const pool = dailyIncomplete.length > 0 ? dailyIncomplete : incomplete;
    const mission = pool.sort((a, b) => (b.xpReward || 0) - (a.xpReward || 0))[0];

    if (!mission) return null;

    const { title, icon, target = 1, progress = 0, xpReward = 0, questId = '' } = mission;
    const pct = Math.min((progress / target) * 100, 100);
    const Icon = ICON_MAP[icon] || ICON_MAP[mission.category] || Target;

    // Determine route from questId pattern.
    // streak/* and workout/* → /workout
    // nutrition/meal/log_* → /nutrition
    const route = (questId.includes('nutrition') || questId.includes('meal') || questId.includes('log_'))
        ? '/nutrition'
        : '/workout';

    return (
        <div className="animate-fade-up rounded-2xl border border-blue-500/15 bg-gradient-to-b from-blue-500/[0.06] to-transparent p-5">
            {/* Header */}
            <div className="flex items-center gap-2 mb-3">
                <Zap size={14} className="text-blue-400" />
                <span className="text-[11px] font-medium text-blue-400 uppercase tracking-wider">Today's Mission</span>
            </div>

            {/* Mission content */}
            <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={20} className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-semibold leading-snug">{title}</p>

                    {/* Progress */}
                    <div className="mt-3">
                        <div className="flex justify-between text-[10px] mb-1.5">
                            <span className="text-zinc-500">Progress</span>
                            <span className="text-zinc-400 tabular-nums">{progress}/{target}</span>
                        </div>
                        <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-700"
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                    </div>

                    {/* Footer row */}
                    <div className="flex items-center justify-between mt-3.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg">
                            +{xpReward} pts
                        </span>
                        <button
                            onClick={() => navigate(route)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors active:scale-[0.97]"
                        >
                            Complete Mission <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
