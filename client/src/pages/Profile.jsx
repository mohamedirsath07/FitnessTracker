/**
 * ============================================
 * PROFILE PAGE - User settings and body metrics
 * ============================================
 * 
 * Features:
 * - Display current height, weight vs goal weight
 * - Update body metrics and goals
 * - Show progress towards goal
 * - XP and streak stats
 */

import React, { useState, useEffect } from 'react';
import { LogOut, Save, Target, TrendingUp, TrendingDown, Scale, Ruler, User, Flame, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Card, Button, Toast } from '../components/ui';
import RankBadge, { calculateLevel } from '../components/RankBadge';
import NavBar from '../components/NavBar';

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'goals'
    
    const [formData, setFormData] = useState({
        weight: user?.weight || 70,
        height: user?.height || 170,
        goalWeight: user?.goalWeight || user?.weight || 70,
        bodyFat: user?.bodyFat || 20,
        dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
        dailyBurnGoal: user?.dailyBurnGoal || 500
    });

    // Update form when user data changes
    useEffect(() => {
        if (user) {
            setFormData({
                weight: user.weight || 70,
                height: user.height || 170,
                goalWeight: user.goalWeight || user.weight || 70,
                bodyFat: user.bodyFat || 20,
                dailyCalorieGoal: user.dailyCalorieGoal || 2000,
                dailyBurnGoal: user.dailyBurnGoal || 500
            });
        }
    }, [user]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const response = await userAPI.updateProfile({
                weight: Number(formData.weight),
                height: Number(formData.height),
                goalWeight: Number(formData.goalWeight),
                bodyFat: Number(formData.bodyFat),
                dailyCalorieGoal: Number(formData.dailyCalorieGoal),
                dailyBurnGoal: Number(formData.dailyBurnGoal)
            });
            updateUser(response.data.user);
            setNotification({ type: 'success', message: 'Profile updated!' });
        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const level = calculateLevel(user?.xp || 0);
    
    // Calculate weight progress
    const weightDiff = formData.weight - formData.goalWeight;
    const isLosingWeight = formData.goalWeight < formData.weight;
    const isGainingWeight = formData.goalWeight > formData.weight;
    const weightProgress = Math.abs(weightDiff);
    const bmi = formData.weight / Math.pow(formData.height / 100, 2);
    
    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return { label: 'Underweight', color: 'text-yellow-400' };
        if (bmi < 25) return { label: 'Normal', color: 'text-green-400' };
        if (bmi < 30) return { label: 'Overweight', color: 'text-orange-400' };
        return { label: 'Obese', color: 'text-red-400' };
    };
    
    const bmiCategory = getBMICategory(bmi);

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            <main className="max-w-xl mx-auto px-4 pt-8 space-y-6">
                {/* Profile Header */}
                <div className="text-center mb-8 relative">
                    <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 mx-auto mb-4 border-4 border-zinc-900 shadow-2xl relative z-10 flex items-center justify-center">
                        <User size={48} className="text-white/80" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-blue-500/20 blur-xl rounded-full z-0" />
                    <h2 className="text-3xl font-bold mb-1">{user?.username}</h2>
                    <p className="text-blue-400 text-xs tracking-[0.3em] uppercase bg-blue-500/10 inline-block px-3 py-1 rounded-full border border-blue-500/20">
                        Rank {level.rank} Hunter
                    </p>
                </div>

                {/* Rank Card */}
                <Card className="border-blue-500/20 bg-gradient-to-br from-blue-950/20 to-purple-950/10">
                    <RankBadge xp={user?.xp || 0} />
                </Card>

                {/* Current vs Goal Stats */}
                <Card className="border-green-500/20">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                        <Target size={16} className="text-green-400" />
                        Body Metrics
                    </h3>
                    
                    {/* Height & Weight Display */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                            <Ruler size={24} className="mx-auto mb-2 text-blue-400" />
                            <div className="text-2xl font-bold font-mono">{formData.height}</div>
                            <div className="text-xs text-zinc-500">Height (cm)</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                            <Scale size={24} className="mx-auto mb-2 text-purple-400" />
                            <div className="text-2xl font-bold font-mono">{formData.weight}</div>
                            <div className="text-xs text-zinc-500">Current Weight (kg)</div>
                        </div>
                    </div>

                    {/* Goal Weight Card */}
                    <div className="bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl p-4 border border-green-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-zinc-400">Goal Weight</span>
                            <span className="text-xl font-bold text-green-400">{formData.goalWeight} kg</span>
                        </div>
                        
                        {/* Progress indicator */}
                        <div className="flex items-center gap-3">
                            {weightDiff === 0 ? (
                                <div className="flex items-center gap-2 text-green-400">
                                    <Target size={18} />
                                    <span className="text-sm font-medium">You've reached your goal! 🎉</span>
                                </div>
                            ) : (
                                <>
                                    <div className={`flex items-center gap-1 ${isLosingWeight ? 'text-orange-400' : 'text-blue-400'}`}>
                                        {isLosingWeight ? <TrendingDown size={18} /> : <TrendingUp size={18} />}
                                    </div>
                                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div 
                                            className={`h-full ${isLosingWeight ? 'bg-orange-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min(100, 100 - (weightProgress / Math.max(weightProgress, 20) * 100))}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-zinc-400">
                                        {Math.abs(weightDiff).toFixed(1)} kg to {isLosingWeight ? 'lose' : 'gain'}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* BMI Display */}
                    <div className="mt-4 flex items-center justify-between p-3 bg-zinc-800/30 rounded-lg">
                        <span className="text-sm text-zinc-400">BMI</span>
                        <div className="text-right">
                            <span className="font-bold font-mono">{bmi.toFixed(1)}</span>
                            <span className={`ml-2 text-sm ${bmiCategory.color}`}>({bmiCategory.label})</span>
                        </div>
                    </div>
                </Card>

                {/* Edit Metrics */}
                <Card title="Update Metrics">
                    <div className="space-y-5">
                        {/* Height */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-zinc-400">Height</span>
                                <span className="text-lg font-mono font-bold">{formData.height} cm</span>
                            </div>
                            <input
                                type="range" 
                                min="140" 
                                max="220" 
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: Number(e.target.value) })}
                                className="w-full accent-blue-500"
                            />
                        </div>

                        {/* Current Weight */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-zinc-400">Current Weight</span>
                                <span className="text-lg font-mono font-bold">{formData.weight} kg</span>
                            </div>
                            <input
                                type="range" 
                                min="40" 
                                max="150" 
                                value={formData.weight}
                                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                                className="w-full accent-purple-500"
                            />
                        </div>

                        {/* Goal Weight */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-zinc-400 flex items-center gap-2">
                                    <Target size={14} className="text-green-400" /> Goal Weight
                                </span>
                                <span className="text-lg font-mono font-bold text-green-400">{formData.goalWeight} kg</span>
                            </div>
                            <input
                                type="range" 
                                min="40" 
                                max="150" 
                                value={formData.goalWeight}
                                onChange={(e) => setFormData({ ...formData, goalWeight: Number(e.target.value) })}
                                className="w-full accent-green-500"
                            />
                        </div>

                        {/* Body Fat */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-zinc-400">Body Fat</span>
                                <span className="text-lg font-mono font-bold">{formData.bodyFat}%</span>
                            </div>
                            <input
                                type="range" 
                                min="5" 
                                max="50" 
                                value={formData.bodyFat}
                                onChange={(e) => setFormData({ ...formData, bodyFat: Number(e.target.value) })}
                                className="w-full accent-orange-500"
                            />
                        </div>
                    </div>
                </Card>

                {/* Daily Goals Card */}
                <Card title="Daily Goals">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2 flex items-center gap-1">
                                <Flame size={12} className="text-orange-400" /> Calorie Goal
                            </label>
                            <input
                                type="number"
                                value={formData.dailyCalorieGoal}
                                onChange={(e) => setFormData({ ...formData, dailyCalorieGoal: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-white font-mono focus:outline-none focus:border-orange-500"
                            />
                            <span className="text-xs text-zinc-500 mt-1">kcal / day</span>
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2 flex items-center gap-1">
                                <Zap size={12} className="text-blue-400" /> Burn Goal
                            </label>
                            <input
                                type="number"
                                value={formData.dailyBurnGoal}
                                onChange={(e) => setFormData({ ...formData, dailyBurnGoal: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-white font-mono focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-xs text-zinc-500 mt-1">kcal / day</span>
                        </div>
                    </div>
                </Card>

                <Button 
                    variant="system" 
                    onClick={handleSave} 
                    disabled={saving} 
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
                >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 text-center">
                        <div className="text-3xl font-bold text-orange-400">{user?.streak || 0}</div>
                        <div className="text-xs text-zinc-500 mt-1">🔥 Day Streak</div>
                    </div>
                    <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 text-center">
                        <div className="text-3xl font-bold text-blue-400">{(user?.xp || 0).toLocaleString()}</div>
                        <div className="text-xs text-zinc-500 mt-1">Total XP ⚡</div>
                    </div>
                </div>

                <Button 
                    variant="secondary" 
                    onClick={logout} 
                    className="w-full text-red-400 border-red-900/30 hover:bg-red-900/10"
                >
                    <LogOut size={18} /> Log Out
                </Button>
            </main>
            
            <NavBar />
            {notification && <Toast message={notification.message} type={notification.type} />}
        </div>
    );
}
