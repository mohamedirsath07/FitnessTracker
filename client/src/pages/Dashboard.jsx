/**
 * ============================================
 * DASHBOARD PAGE - Enhanced Activity Analysis
 * ============================================
 * 
 * Features:
 * - 3D body visualization with body fat
 * - Real-time activity analysis
 * - Weekly burn vs intake trends
 * - Workout insights and recommendations
 * - Gamification rank display
 */

import React, { useState, useEffect } from 'react';
import { Flame, Utensils, Target, TrendingUp, TrendingDown, Activity, Zap, Clock, Dumbbell, Scale, Footprints } from 'lucide-react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { userAPI, progressAPI } from '../services/api';
import { Card, StatCard, LoadingScreen } from '../components/ui';
import RankBadge from '../components/RankBadge';
import BodyVisualizer from '../components/BodyVisualizer';
import NavBar from '../components/NavBar';

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user stats on mount
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await userAPI.getStats();
                setStats(response.data.stats);
            } catch (error) {
                console.error('Failed to fetch stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <LoadingScreen />;
    }

    // Build weekly activity chart data combining intake vs burn
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date();
    const dayOfWeek = today.getDay();
    
    // Process weekly data for comprehensive analysis
    const weeklyChartData = weekDays.map((day, index) => {
        // Get meal data for this day
        const mealData = stats?.weekly?.meals?.find(m => {
            const mealDay = new Date(m.date).getDay();
            const adjustedIndex = (index + 1) % 7; // Mon = 1, Sun = 0
            return mealDay === adjustedIndex;
        });

        // Get workout data for this day
        const workoutData = stats?.weekly?.workouts?.find(w => {
            const workoutDay = new Date(w.date).getDay();
            const adjustedIndex = (index + 1) % 7;
            return workoutDay === adjustedIndex;
        });

        const intake = mealData?.calories || 0;
        const burned = workoutData?.totalCalories || 0;
        const netCalories = intake - burned;

        return {
            day,
            intake,
            burned,
            net: netCalories,
            workouts: workoutData?.count || 0,
            duration: workoutData?.totalDuration || 0
        };
    });

    // Calculate analysis metrics
    const totalIntake = weeklyChartData.reduce((sum, d) => sum + d.intake, 0);
    const totalBurned = weeklyChartData.reduce((sum, d) => sum + d.burned, 0);
    const totalWorkouts = weeklyChartData.reduce((sum, d) => sum + d.workouts, 0);
    const totalDuration = weeklyChartData.reduce((sum, d) => sum + d.duration, 0);
    const avgDailyBurn = Math.round(totalBurned / 7);
    const avgDailyIntake = Math.round(totalIntake / 7);
    const netWeekly = totalIntake - totalBurned;

    // Workout type breakdown
    const workoutBreakdown = stats?.workoutBreakdown || [];

    // Activity insights based on user data
    const getActivityInsights = () => {
        const insights = [];
        
        const dailyGoal = user?.dailyBurnGoal || 500;
        const calorieGoal = user?.dailyCalorieGoal || 2000;
        const todayBurned = stats?.today?.caloriesBurned || 0;
        const todayIntake = stats?.today?.caloriesConsumed || 0;

        // Today's progress insight
        if (todayBurned >= dailyGoal) {
            insights.push({ type: 'success', icon: <Zap size={16} />, text: `🔥 Goal crushed! You burned ${todayBurned} kcal today!` });
        } else if (todayBurned > 0) {
            const remaining = dailyGoal - todayBurned;
            insights.push({ type: 'info', icon: <Target size={16} />, text: `💪 Keep going! ${remaining} kcal more to hit your daily goal` });
        } else {
            insights.push({ type: 'warning', icon: <Activity size={16} />, text: `🏃 No workout today yet. Time to get moving!` });
        }

        // Calorie balance insight
        if (todayIntake > 0 && todayBurned > 0) {
            const balance = todayIntake - todayBurned;
            if (balance > 500) {
                insights.push({ type: 'warning', icon: <TrendingUp size={16} />, text: `Calorie surplus of ${balance} kcal today. Consider a workout!` });
            } else if (balance < -300) {
                insights.push({ type: 'success', icon: <TrendingDown size={16} />, text: `Great deficit! ${Math.abs(balance)} kcal burned vs intake` });
            }
        }

        // Weekly consistency insight
        if (totalWorkouts >= 5) {
            insights.push({ type: 'success', icon: <Dumbbell size={16} />, text: `✨ Excellent! ${totalWorkouts} workouts this week. You're on fire!` });
        } else if (totalWorkouts >= 3) {
            insights.push({ type: 'info', icon: <Dumbbell size={16} />, text: `Good week with ${totalWorkouts} workouts. Try for 5 next week!` });
        }

        // Streak insight
        if (user?.streak >= 7) {
            insights.push({ type: 'success', icon: <Flame size={16} />, text: `🔥 ${user.streak} day streak! You're unstoppable!` });
        }

        return insights;
    };

    const insights = getActivityInsights();

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            {/* Header */}
            <header className="px-6 py-6 flex justify-between items-center max-w-5xl mx-auto border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">{user?.username}</h2>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1 text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                            <Flame size={10} fill="currentColor" /> {user?.streak || 0} Day Streak
                        </span>
                        <span className="bg-zinc-800 px-2 py-0.5 rounded-full border border-white/5">
                            {stats?.user?.level?.rank || 'E'} Rank
                        </span>
                    </div>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 ring-2 ring-black ring-offset-2 ring-offset-zinc-800" />
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fade-in">

                    {/* Left Column: 3D Visualizer & Rank */}
                    <div className="md:col-span-5 space-y-6">
                        {/* 3D Body Card */}
                        <Card className="h-[500px] relative overflow-hidden flex flex-col items-center justify-center bg-gradient-to-b from-zinc-900 to-black p-0 border-blue-500/20">
                            <BodyVisualizer
                                weight={user?.weight || 70}
                                bodyFat={user?.bodyFat || 20}
                                gender={user?.gender || 'male'}
                                height={user?.height || 170}
                            />
                        </Card>

                        {/* Rank Card */}
                        <Card className="border-blue-500/20 bg-blue-950/10 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent pointer-events-none" />
                            <RankBadge xp={user?.xp || 0} />
                        </Card>
                    </div>

                    {/* Right Column: Stats & Charts */}
                    <div className="md:col-span-7 space-y-6">

                        {/* Daily Overview Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <StatCard
                                icon={<Flame size={20} />}
                                value={stats?.today?.caloriesBurned || 0}
                                label="kcal burned today"
                                goal={user?.dailyBurnGoal || 500}
                                color="orange"
                            />
                            <StatCard
                                icon={<Utensils size={20} />}
                                value={stats?.today?.caloriesConsumed || 0}
                                label="kcal consumed"
                                goal={user?.dailyCalorieGoal || 2000}
                                color="green"
                            />
                        </div>

                        {/* Activity Chart - Enhanced with Intake vs Burn */}
                        <Card title="Weekly Activity Analysis" className="min-h-[320px]">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={weeklyChartData} barCategoryGap="20%">
                                        <defs>
                                            <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.3} />
                                            </linearGradient>
                                            <linearGradient id="colorBurned" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#f97316" stopOpacity={0.3} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis
                                            dataKey="day"
                                            stroke="#525252"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#525252"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(v) => `${v}`}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#09090b',
                                                borderColor: '#27272a',
                                                borderRadius: '12px',
                                                fontSize: '12px',
                                                padding: '12px'
                                            }}
                                            itemStyle={{ color: '#fff' }}
                                            formatter={(value, name) => [
                                                `${value} kcal`,
                                                name === 'intake' ? 'Calories Intake' : 'Calories Burned'
                                            ]}
                                        />
                                        <Legend 
                                            wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                                            formatter={(value) => value === 'intake' ? '🍽️ Calories Intake' : '🔥 Calories Burned'}
                                        />
                                        <Bar dataKey="intake" fill="url(#colorIntake)" radius={[4, 4, 0, 0]} name="intake" />
                                        <Bar dataKey="burned" fill="url(#colorBurned)" radius={[4, 4, 0, 0]} name="burned" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            {/* Weekly Summary Stats */}
                            <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/5">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-400">{totalIntake.toLocaleString()}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Weekly Intake</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-orange-400">{totalBurned.toLocaleString()}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Weekly Burned</div>
                                </div>
                                <div className="text-center">
                                    <div className={`text-lg font-bold ${netWeekly > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {netWeekly > 0 ? '+' : ''}{netWeekly.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Net Calories</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-blue-400">{totalWorkouts}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase">Workouts</div>
                                </div>
                            </div>
                        </Card>

                        {/* Activity Insights */}
                        {insights.length > 0 && (
                            <Card title="Activity Insights" className="border-purple-500/20 bg-gradient-to-br from-purple-950/10 to-indigo-950/5">
                                <div className="space-y-3">
                                    {insights.map((insight, idx) => (
                                        <div 
                                            key={idx}
                                            className={`flex items-center gap-3 p-3 rounded-xl ${
                                                insight.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                                                insight.type === 'warning' ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' :
                                                'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                                            }`}
                                        >
                                            {insight.icon}
                                            <span className="text-sm">{insight.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Workout Breakdown */}
                        {workoutBreakdown.length > 0 && (
                            <Card title="Workout Types This Week">
                                <div className="space-y-3">
                                    {workoutBreakdown.slice(0, 5).map((workout, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                                                    <Dumbbell size={18} className="text-orange-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium capitalize">{workout.type}</div>
                                                    <div className="text-xs text-zinc-500">{workout.count} sessions</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-orange-400 font-bold">{workout.calories} kcal</div>
                                                <div className="text-xs text-zinc-500">{workout.duration} min total</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        )}

                        {/* Macro Split */}
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { name: 'Protein', value: stats?.today?.protein || 0, color: 'bg-purple-500' },
                                { name: 'Carbs', value: stats?.today?.carbs || 0, color: 'bg-blue-500' },
                                { name: 'Fats', value: stats?.today?.fats || 0, color: 'bg-yellow-500' }
                            ].map((macro) => (
                                <div
                                    key={macro.name}
                                    className="bg-zinc-900/40 rounded-2xl p-4 border border-white/5 relative overflow-hidden group hover:bg-zinc-800/60 transition-colors"
                                >
                                    <div className={`absolute top-0 left-0 w-1 h-full ${macro.color}`} />
                                    <div className="text-[10px] text-zinc-500 uppercase mb-2 tracking-widest">
                                        {macro.name}
                                    </div>
                                    <div className="text-lg font-bold">{macro.value}g</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <NavBar />
        </div>
    );
}
