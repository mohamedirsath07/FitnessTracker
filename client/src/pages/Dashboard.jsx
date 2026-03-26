import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Flame, Utensils, Dumbbell, Trophy, Crown, Medal, Shield } from 'lucide-react';

import DashboardRankBadge from '../components/DashboardRankBadge';
import WeeklyChart from '../components/WeeklyChart';
import QuestCard from '../components/QuestCard';
import AnimatedCounter from '../components/AnimatedCounter';
import OnboardingHero from '../components/OnboardingHero';
import TodaysMission from '../components/TodaysMission';
import { useAuth } from '../context/AuthContext';
import { useDataCache } from '../context/DataCacheContext';
import { userAPI, questAPI, workoutAPI } from '../services/api';
import { Card, StatCard, Skeleton, Modal } from '../components/ui';
import { calculateLevel, getNextLevel } from '../components/RankBadge';
import NavBar from '../components/NavBar';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { getCached, fetchDashboard } = useDataCache();
    const cached = getCached('dashboard');
    const [stats, setStats] = useState(cached);
    const [loading, setLoading] = useState(!cached);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
    const [quests, setQuests] = useState([]);
    const [quickLogging, setQuickLogging] = useState(false);

    // ─── Celebration detection (XP increase / rank up) ───
    const prevXpRef = useRef(user?.xp || 0);
    const prevRankRef = useRef(calculateLevel(user?.xp || 0).rank);
    const [xpGlow, setXpGlow] = useState(false);
    const [rankUp, setRankUp] = useState(false);

    useEffect(() => {
        const prev = prevXpRef.current;
        const curr = user?.xp || 0;
        prevXpRef.current = curr;
        if (curr > prev && prev > 0) {
            setXpGlow(true);
            const t = setTimeout(() => setXpGlow(false), 850);
            return () => clearTimeout(t);
        }
    }, [user?.xp]);

    useEffect(() => {
        const prev = prevRankRef.current;
        const curr = calculateLevel(user?.xp || 0).rank;
        prevRankRef.current = curr;
        if (curr !== prev && prev) {
            setRankUp(true);
            const t = setTimeout(() => setRankUp(false), 1000);
            return () => clearTimeout(t);
        }
    }, [user?.xp]);

    const QUICK_LOG_PRESETS = [
        { type: 'walking', duration: 30, intensity: 'moderate', label: '30m Walk', icon: '🚶' },
        { type: 'running', duration: 20, intensity: 'high', label: '20m Run', icon: '🏃' },
        { type: 'pushups', reps: 25, sets: 3, intensity: 'moderate', label: 'Push-ups', icon: '💪' },
        { type: 'yoga', duration: 30, intensity: 'low', label: '30m Yoga', icon: '🧘' },
    ];

    const handleQuickLog = async (preset) => {
        setQuickLogging(true);
        try {
            await workoutAPI.create({
                type: preset.type,
                duration: preset.duration || 0,
                reps: preset.reps || 0,
                sets: preset.sets || 0,
                intensity: preset.intensity,
                inputType: preset.reps ? 'reps' : 'duration',
            });
            fetchDashboard().then(d => { if (d) setStats(d); });
            questAPI.getAll().then(r => setQuests(r.data.quests || [])).catch(() => {});
        } catch (err) {
            console.error('Quick log failed:', err);
        } finally {
            setQuickLogging(false);
        }
    };

    useEffect(() => {
        fetchDashboard().then(data => {
            if (data) setStats(data);
            setLoading(false);
        });
        questAPI.getAll().then(res => setQuests(res.data.quests || [])).catch(() => {});
    }, []);

    const fetchLeaderboard = async () => {
        setLoadingLeaderboard(true);
        try {
            const res = await userAPI.getLeaderboard();
            setLeaderboard(res.data.leaderboard || []);
        } catch (e) {
            console.error('Leaderboard fetch failed:', e);
        } finally {
            setLoadingLeaderboard(false);
        }
    };

    const getRankMedal = (r) => {
        if (r === 1) return <Crown size={18} className="text-amber-400" />;
        if (r === 2) return <Medal size={18} className="text-zinc-300" />;
        if (r === 3) return <Medal size={18} className="text-amber-600" />;
        return <span className="text-[11px] font-mono text-zinc-500 w-5 text-center">{r}</span>;
    };

    const RANK_COLORS = { E: 'text-zinc-400', D: 'text-zinc-400', C: 'text-blue-400', B: 'text-blue-400', A: 'text-blue-400', S: 'text-blue-400', NATIONAL: 'text-blue-400' };

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-root)] text-white pb-20">
            <header className="px-4 py-4 max-w-5xl mx-auto border-b border-white/[0.04]">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-3 w-48" />
            </header>
            <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">
                {/* XP bar */}
                <div>
                    <div className="flex justify-between mb-1.5">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-14" />
                    </div>
                    <Skeleton className="h-1 w-full rounded-full" />
                </div>
                {/* Goal cards */}
                <Card>
                    <Skeleton className="h-3 w-20 mb-3" />
                    <div className="space-y-2">
                        {[1,2,3].map(i => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04]">
                                <Skeleton className="h-9 w-9 rounded-xl" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3 w-3/4" />
                                    <Skeleton className="h-1.5 w-full rounded-full" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                {/* Quick log */}
                <Card>
                    <Skeleton className="h-3 w-16 mb-3" />
                    <div className="grid grid-cols-4 gap-2">
                        {[1,2,3,4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                    </div>
                </Card>
                {/* Rank badge + stats */}
                <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4">
                    <Skeleton className="h-40 md:w-[200px] rounded-2xl" />
                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <Skeleton className="h-24 rounded-2xl" />
                            <Skeleton className="h-24 rounded-2xl" />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            {[1,2,3].map(i => <Skeleton key={i} className="h-14 rounded-xl" />)}
                        </div>
                    </div>
                </div>
                {/* Weekly chart */}
                <Card>
                    <Skeleton className="h-3 w-24 mb-4" />
                    <Skeleton className="h-32 w-full rounded-xl" />
                </Card>
            </main>
            <NavBar />
        </div>
    );

    // Weekly data processing
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklyChartData = weekDays.map((day, index) => {
        const mealData = stats?.weekly?.meals?.find(m => new Date(m._id).getDay() === (index + 1) % 7);
        const workoutData = stats?.weekly?.workouts?.find(w => new Date(w.date).getDay() === (index + 1) % 7);
        const intake = mealData?.totalCalories || 0;
        const burned = workoutData?.totalCalories || 0;
        return { day, intake, burned, net: intake - burned, workouts: workoutData?.count || 0, duration: workoutData?.totalDuration || 0 };
    });

    const totalIntake = weeklyChartData.reduce((s, d) => s + d.intake, 0);
    const totalBurned = weeklyChartData.reduce((s, d) => s + d.burned, 0);
    const totalWorkouts = weeklyChartData.reduce((s, d) => s + d.workouts, 0);
    const netWeekly = totalIntake - totalBurned;

    const level = calculateLevel(user?.xp || 0);
    const nextLevel = getNextLevel(user?.xp || 0);
    const xpInLevel = (user?.xp || 0) - level.minXp;
    const xpForNext = nextLevel ? nextLevel.minXp - level.minXp : 1;

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-white pb-20">
            {/* ─── Header ─── */}
            <header className="px-4 py-4 flex justify-between items-center max-w-5xl mx-auto border-b border-white/[0.04] bg-[var(--bg-root)]/80 backdrop-blur-xl sticky top-0 z-40">
                <div className="min-w-0">
                    <h2 className="text-lg font-semibold tracking-tight truncate">{user?.username}</h2>
                    <div className="flex items-center gap-2 mt-1">
                        {user?.streak > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-orange-400 bg-orange-500/8 px-2 py-0.5 rounded-lg">
                                <Flame size={10} fill="currentColor" /> {user.streak}d
                            </span>
                        )}
                        <span
                            className="inline-flex items-center gap-1 text-[10px] font-medium text-sky-400 bg-sky-500/8 px-2 py-0.5 rounded-lg cursor-default"
                            title={`${user?.streakFreezes ?? 1} freeze available this week`}
                        >
                            <Shield size={10} /> {user?.streakFreezes ?? 1}
                        </span>
                        <span className="text-[10px] text-zinc-500">
                            Level {level.rank} · <AnimatedCounter value={user?.xp || 0} /> pts
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setShowLeaderboard(true); fetchLeaderboard(); }}
                        className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all active:scale-95"
                    >
                        <Trophy size={18} />
                    </button>
                    <button onClick={() => navigate('/profile')} className="focus:outline-none active:scale-95 transition-transform">
                        {user?.profilePicture ? (
                            <img src={user.profilePicture} alt="Profile" className="h-9 w-9 rounded-xl object-cover border border-white/[0.06]" />
                        ) : (
                            <div className="h-9 w-9 rounded-xl bg-blue-600 border border-white/[0.06] flex items-center justify-center text-xs font-medium">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 pt-6 space-y-6">

                {/* ─── Progress Bar ─── */}
                <div className="animate-fade-up">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] text-zinc-500 font-medium">Level {level.rank} → {nextLevel?.rank || 'Max'}</span>
                        <span className="text-[11px] text-zinc-600 tabular-nums">{xpInLevel}/{xpForNext}</span>
                    </div>
                    <div className={`h-1 bg-white/[0.06] rounded-full overflow-hidden${xpGlow ? ' animate-xp-glow' : ''}`}>
                        <div className="h-full bg-blue-500 rounded-full animate-progress-fill" style={{ width: `${Math.min((xpInLevel / xpForNext) * 100, 100)}%` }} />
                    </div>
                </div>

                {/* ─── Onboarding Hero (new users only) ─── */}
                {!user?.onboardingComplete && (
                    <OnboardingHero stats={stats} quests={quests} />
                )}

                {/* ─── Today's Mission ─── */}
                {quests.length > 0 && (
                    <TodaysMission quests={quests} />
                )}

                {/* ─── Active Goals ─── */}
                {quests.length > 0 && (() => {
                    const allComplete = quests.every(q => q.completed);
                    const missionId = !allComplete
                        ? quests.filter(q => !q.completed).sort((a, b) => (b.xpReward || 0) - (a.xpReward || 0))[0]?.questId
                        : null;
                    const remaining = quests.filter(q => q.questId !== missionId);
                    if (remaining.length === 0) return null;
                    return (
                        <div className="animate-fade-up-d1">
                            <Card>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-[13px] font-medium text-zinc-400">Active goals</h3>
                                    <span className="text-[11px] text-zinc-600 tabular-nums">{quests.filter(q => q.completed).length}/{quests.length}</span>
                                </div>
                                <div className="space-y-2">
                                    {remaining.slice(0, 3).map((quest, idx) => (
                                        <QuestCard key={quest.questId || idx} quest={quest} compact />
                                    ))}
                                </div>
                                {remaining.length > 3 && (
                                    <button onClick={() => navigate('/quests')} className="w-full mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors text-center py-1">
                                        View all goals →
                                    </button>
                                )}
                            </Card>
                        </div>
                    );
                })()}

                {/* ─── Quick Log ─── */}
                <div className="animate-fade-up-d2">
                    <Card>
                        <h3 className="text-[13px] font-medium text-zinc-400 mb-3">Quick log</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {QUICK_LOG_PRESETS.map(preset => (
                                <button
                                    key={preset.type}
                                    onClick={() => handleQuickLog(preset)}
                                    disabled={quickLogging}
                                    className="flex flex-col items-center gap-1.5 p-3 bg-white/[0.02] border border-white/[0.05] rounded-xl text-center hover:border-white/[0.1] hover:bg-white/[0.04] transition-all active:scale-[0.97] disabled:opacity-40"
                                >
                                    <span className="text-lg leading-none">{preset.icon}</span>
                                    <span className="text-[10px] font-medium text-zinc-400">{preset.label}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => navigate('/nutrition')}
                            className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors py-1.5 border-t border-white/[0.04]"
                        >
                            <Utensils size={13} /> Log Meal →
                        </button>
                    </Card>
                </div>

                {/* ─── Rank Badge + Stats ─── */}
                <div className="animate-fade-up-d3 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-4 items-start">
                    {/* Rank Badge */}
                    <div className="rounded-2xl border border-white/[0.05] bg-[var(--bg-surface)] flex items-center justify-center md:w-[200px]">
                        <DashboardRankBadge xp={user?.xp || 0} streak={user?.streak || 0} rankUp={rankUp} />
                    </div>

                    {/* Core Stats */}
                    <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3">
                            <StatCard icon={<Flame size={18} />} value={stats?.today?.caloriesBurned || 0} label="Burned" unit="kcal" goal={user?.dailyBurnGoal || 500} color="orange" />
                            <StatCard icon={<Utensils size={18} />} value={stats?.today?.caloriesConsumed || 0} label="Consumed" unit="kcal" goal={user?.dailyCalorieGoal || 2000} color="green" />
                        </div>
                        {/* Macros */}
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { name: 'Protein', value: stats?.today?.protein || 0, color: '#6366F1' },
                                { name: 'Carbs', value: stats?.today?.carbs || 0, color: '#3B82F6' },
                                { name: 'Fats', value: stats?.today?.fats || 0, color: '#F59E0B' },
                            ].map(m => (
                                <div key={m.name} className="bg-[var(--bg-surface)] rounded-xl p-3 border border-white/[0.05] relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-0.5 h-full rounded-full" style={{ backgroundColor: m.color, opacity: 0.7 }} />
                                    <div className="text-[10px] text-zinc-500 mb-1 pl-2">{m.name}</div>
                                    <div className="text-sm font-semibold pl-2 tabular-nums">{m.value}<span className="text-zinc-500 text-[10px] ml-0.5">g</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Weekly Chart (condensed) ─── */}
                <div className="animate-fade-up-d4">
                    <Card title="Weekly activity">
                        <WeeklyChart data={weeklyChartData} />
                        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/[0.04]">
                            {[
                                { label: 'Intake', value: totalIntake, color: 'text-emerald-400' },
                                { label: 'Burned', value: totalBurned, color: 'text-orange-400' },
                                { label: 'Net', value: netWeekly, color: netWeekly > 0 ? 'text-red-400' : 'text-emerald-400', prefix: netWeekly > 0 ? '+' : '' },
                                { label: 'Sessions', value: totalWorkouts, color: 'text-blue-400' },
                            ].map(s => (
                                <div key={s.label} className="text-center">
                                    <div className={`text-sm font-semibold tabular-nums ${s.color}`}>{s.prefix || ''}{s.value.toLocaleString()}</div>
                                    <div className="text-[10px] text-zinc-600 mt-0.5">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </main>

            {/* ─── Leaderboard Modal ─── */}
            <Modal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} title="Leaderboard">
                {loadingLeaderboard ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="w-7 h-7 border-2 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                    </div>
                ) : leaderboard.length === 0 ? (
                    <div className="text-center py-16 text-zinc-500">
                        <Trophy size={40} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No users yet</p>
                    </div>
                ) : (
                    <div className="space-y-1.5 max-h-[55vh] overflow-y-auto -mx-1 px-1">
                        {leaderboard.map((entry) => {
                            const isMe = entry.username === user?.username;
                            return (
                                <div
                                    key={entry.rank}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-all ${
                                        isMe ? 'bg-blue-500/[0.06] border border-blue-500/15' :
                                        'border border-transparent hover:bg-white/[0.02]'
                                    }`}
                                >
                                    <div className="w-7 flex items-center justify-center shrink-0">
                                        {getRankMedal(entry.rank)}
                                    </div>
                                    {entry.profilePicture ? (
                                        <img src={entry.profilePicture} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/[0.06]" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-[11px] font-medium shrink-0">
                                            {entry.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <span className={`text-sm font-medium truncate block ${isMe ? 'text-blue-300' : ''}`}>
                                            {entry.username}{isMe && <span className="text-[10px] ml-1 text-zinc-500">(you)</span>}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-500">
                                            <span className={`font-medium ${RANK_COLORS[entry.level?.rank] || 'text-zinc-400'}`}>
                                                Lv. {entry.level?.rank || 'E'}
                                            </span>
                                            {entry.streak > 0 && (
                                                <span className="text-orange-400">{entry.streak}d streak</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-xs font-semibold">{entry.xp.toLocaleString()}</div>
                                        <div className="text-[10px] text-zinc-500">pts</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Modal>

            <NavBar />
        </div>
    );
}
