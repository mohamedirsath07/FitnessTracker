/**
 * ============================================
 * WORKOUT PAGE
 * ============================================
 * 
 * Supports two types of workouts:
 * - Time-based: running, swimming, cycling (input: duration in minutes)
 * - Count-based: pushups, squats, pullups (input: reps and sets)
 */

import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight, Trophy, Clock, Flame, Hash, Timer, Dumbbell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { workoutAPI } from '../services/api';
import { Card, Button, Input, Toast } from '../components/ui';
import NavBar from '../components/NavBar';

export default function Workout() {
    const { user, updateUser } = useAuth();
    const [workoutTypes, setWorkoutTypes] = useState([]);
    const [recentWorkouts, setRecentWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [activeTab, setActiveTab] = useState('time'); // 'time' or 'count'
    
    // Form state
    const [duration, setDuration] = useState(30);
    const [reps, setReps] = useState(20);
    const [sets, setSets] = useState(3);
    const [intensity, setIntensity] = useState('moderate');
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    // Fetch workout types and recent workouts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [typesRes, workoutsRes] = await Promise.all([
                    workoutAPI.getTypes(),
                    workoutAPI.getAll({ limit: 5 })
                ]);
                setWorkoutTypes(typesRes.data.types);
                setRecentWorkouts(workoutsRes.data.workouts);
            } catch (error) {
                console.error('Failed to fetch workout data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter workouts by type
    const timeBasedWorkouts = workoutTypes.filter(w => w.inputType === 'time');
    const countBasedWorkouts = workoutTypes.filter(w => w.inputType === 'count');

    const handleSelectWorkout = (type) => {
        setSelectedType(type);
        setShowForm(true);
        // Reset form values
        if (type.inputType === 'time') {
            setDuration(30);
        } else {
            setReps(20);
            setSets(3);
        }
        setIntensity('moderate');
    };

    const calculateEstimatedCalories = () => {
        if (!selectedType) return 0;
        
        const intensityMod = intensity === 'high' ? 1.2 : intensity === 'low' ? 0.8 : 1;
        const userWeight = user?.weight || 70;
        
        if (selectedType.inputType === 'time') {
            return Math.round(selectedType.caloriesPer30Min * (duration / 30) * intensityMod);
        } else {
            const totalReps = reps * sets;
            const caloriesPerRep = selectedType.caloriesPerRep || 0.3;
            return Math.round(caloriesPerRep * totalReps * intensityMod * (userWeight / 70));
        }
    };

    const handleSubmitWorkout = async () => {
        if (!selectedType) return;

        setSubmitting(true);
        try {
            const workoutData = {
                type: selectedType.type,
                intensity
            };

            if (selectedType.inputType === 'time') {
                workoutData.duration = Number(duration);
            } else {
                workoutData.reps = Number(reps);
                workoutData.sets = Number(sets);
            }

            const response = await workoutAPI.create(workoutData);

            // Update user XP
            if (response.data.user) {
                updateUser({
                    xp: response.data.user.xp,
                    streak: response.data.user.streak
                });
            }

            // Add to recent workouts
            setRecentWorkouts(prev => [response.data.workout, ...prev.slice(0, 4)]);

            // Show success notification
            setNotification({
                type: 'success',
                message: `Workout logged! +${response.data.workout.xpEarned} XP earned`
            });

            // Reset form
            setShowForm(false);
            setSelectedType(null);

        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to log workout'
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Clear notification after 3s
    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            {/* Header */}
            <header className="px-6 py-6 max-w-5xl mx-auto border-b border-white/5">
                <h1 className="text-2xl font-bold">Daily Quests</h1>
                <p className="text-zinc-500 text-sm mt-1">Complete workouts to earn XP and maintain your streak</p>
            </header>

            <main className="max-w-xl mx-auto px-4 md:px-6 pt-6 space-y-6 animate-fade-in">

                {/* Workout Form Modal */}
                {showForm && selectedType && (
                    <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-purple-950/10">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-4xl h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10">
                                {selectedType.icon || '🏅'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">{selectedType.label}</h3>
                                <p className="text-zinc-400 text-sm flex items-center gap-2">
                                    {selectedType.inputType === 'time' ? (
                                        <><Timer size={14} /> Duration-based</>
                                    ) : (
                                        <><Hash size={14} /> Rep-based</>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            {selectedType.inputType === 'time' ? (
                                /* Time-based input */
                                <div>
                                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                                        Duration: {duration} minutes
                                    </label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="180"
                                        step="5"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        className="w-full accent-blue-500"
                                    />
                                    <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                        <span>5 min</span>
                                        <span>180 min</span>
                                    </div>
                                    
                                    {/* Quick duration buttons */}
                                    <div className="flex gap-2 mt-3">
                                        {[15, 30, 45, 60].map(d => (
                                            <button
                                                key={d}
                                                onClick={() => setDuration(d)}
                                                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                                                    duration == d 
                                                        ? 'bg-blue-500 text-white' 
                                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                }`}
                                            >
                                                {d}m
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                /* Count-based input */
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                                            Reps per set: {reps}
                                        </label>
                                        <input
                                            type="range"
                                            min="5"
                                            max="100"
                                            step="5"
                                            value={reps}
                                            onChange={(e) => setReps(e.target.value)}
                                            className="w-full accent-green-500"
                                        />
                                        <div className="flex gap-2 mt-2">
                                            {[10, 15, 20, 25, 50].map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setReps(r)}
                                                    className={`flex-1 py-1.5 rounded-lg text-xs transition-all ${
                                                        reps == r 
                                                            ? 'bg-green-500 text-white' 
                                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                    }`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                                            Number of sets: {sets}
                                        </label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setSets(s)}
                                                    className={`flex-1 py-2 rounded-xl text-sm transition-all ${
                                                        sets == s 
                                                            ? 'bg-purple-500 text-white' 
                                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                    }`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="text-center py-2 bg-zinc-800/50 rounded-xl">
                                        <span className="text-zinc-400 text-sm">Total: </span>
                                        <span className="text-white font-bold">{reps * sets} reps</span>
                                    </div>
                                </div>
                            )}

                            {/* Intensity selector */}
                            <div>
                                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-2">
                                    Intensity
                                </label>
                                <div className="flex gap-2">
                                    {[
                                        { level: 'low', label: 'Easy', bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/50' },
                                        { level: 'moderate', label: 'Normal', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/50' },
                                        { level: 'high', label: 'Hard', bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/50' }
                                    ].map(({ level, label, bg, text, border }) => (
                                        <button
                                            key={level}
                                            onClick={() => setIntensity(level)}
                                            className={`flex-1 py-2.5 px-4 rounded-xl transition-all ${
                                                intensity === level
                                                    ? `${bg} ${text} border ${border}`
                                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-transparent'
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Estimated stats */}
                            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400 flex items-center gap-2">
                                        <Flame size={14} className="text-orange-400" /> Calories
                                    </span>
                                    <span className="text-orange-400 font-mono font-bold">
                                        ~{calculateEstimatedCalories()} kcal
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-zinc-400 flex items-center gap-2">
                                        <Zap size={14} className="text-blue-400" /> XP Reward
                                    </span>
                                    <span className="text-blue-400 font-mono font-bold">
                                        ~{Math.max(5, Math.round(calculateEstimatedCalories() / 2))} XP
                                    </span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowForm(false);
                                        setSelectedType(null);
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="system"
                                    onClick={handleSubmitWorkout}
                                    disabled={submitting}
                                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                                >
                                    {submitting ? 'Logging...' : '✓ Complete Quest'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Workout Types */}
                {!showForm && (
                    <>
                        {/* Tab Switcher */}
                        <div className="flex bg-zinc-900/50 rounded-xl p-1 border border-white/5">
                            <button
                                onClick={() => setActiveTab('time')}
                                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                                    activeTab === 'time'
                                        ? 'bg-blue-500 text-white'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <Timer size={18} />
                                <span>Time-Based</span>
                            </button>
                            <button
                                onClick={() => setActiveTab('count')}
                                className={`flex-1 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                                    activeTab === 'count'
                                        ? 'bg-green-500 text-white'
                                        : 'text-zinc-400 hover:text-white'
                                }`}
                            >
                                <Dumbbell size={18} />
                                <span>Rep-Based</span>
                            </button>
                        </div>

                        {/* Workout list */}
                        <div className="space-y-3">
                            {(activeTab === 'time' ? timeBasedWorkouts : countBasedWorkouts).map((type) => (
                                <button
                                    key={type.type}
                                    onClick={() => handleSelectWorkout(type)}
                                    className="w-full bg-zinc-900/60 hover:bg-zinc-800 backdrop-blur border border-white/5 hover:border-blue-500/30 p-5 rounded-2xl flex items-center justify-between group transition-all duration-300"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform border border-white/5">
                                            {type.icon || '🏅'}
                                        </div>
                                        <div className="text-left">
                                            <div className="font-semibold text-lg">
                                                {type.label}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-1 flex items-center gap-2">
                                                <Flame size={10} className="text-orange-400" />
                                                {type.inputType === 'time' 
                                                    ? `~${type.caloriesPer30Min} kcal / 30 min`
                                                    : `~${type.caloriesPer10Reps} kcal / 10 reps`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                        <ChevronRight size={16} />
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Info card */}
                        <div className="text-center py-4 text-zinc-500 text-sm">
                            {activeTab === 'time' 
                                ? '⏱️ Log workouts by duration (minutes)'
                                : '💪 Log workouts by reps and sets'
                            }
                        </div>
                    </>
                )}

                {/* Streak Bonus Card */}
                <div className="mt-4 p-6 rounded-3xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/10 text-center">
                    <Trophy className="mx-auto text-yellow-500 mb-2" size={32} />
                    <h3 className="font-bold text-lg">
                        {user?.streak > 0 ? 'Streak Bonus Active' : 'Start Your Streak'}
                    </h3>
                    <p className="text-sm text-zinc-400 mt-1">
                        {user?.streak > 0
                            ? `🔥 You're on a ${user.streak}-day streak! Keep it going!`
                            : 'Complete a workout to start building your streak'}
                    </p>
                </div>

                {/* Recent Workouts */}
                {recentWorkouts.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Recent Activity</h3>
                        <div className="space-y-2">
                            {recentWorkouts.map(workout => (
                                <div
                                    key={workout.id || workout._id}
                                    className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-xl border border-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">
                                            {workoutTypes.find(t => t.type === workout.type)?.icon || '🏅'}
                                        </span>
                                        <div>
                                            <div className="font-medium">
                                                {workoutTypes.find(t => t.type === workout.type)?.label || workout.type}
                                            </div>
                                            <div className="text-xs text-zinc-500">
                                                {workout.inputType === 'count' || workout.reps > 0
                                                    ? `${workout.reps * (workout.sets || 1)} reps`
                                                    : `${workout.duration} min`
                                                } • {new Date(workout.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-orange-400 text-sm font-mono">{workout.caloriesBurned} kcal</div>
                                        <div className="text-blue-400 text-xs">+{workout.xpEarned} XP</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <NavBar />

            {/* Notification Toast */}
            {notification && (
                <Toast message={notification.message} type={notification.type} />
            )}
        </div>
    );
}
