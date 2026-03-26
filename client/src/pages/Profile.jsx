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

import React, { useState, useEffect, useRef } from 'react';
import { LogOut, Save, Target, TrendingUp, TrendingDown, Scale, Ruler, User, Flame, Zap, Camera, Check, Pencil, Upload, Trash2, X, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { Card, Button, Toast } from '../components/ui';
import { calculateLevel } from '../components/RankBadge';
import NavBar from '../components/NavBar';

const DEFAULT_AVATARS = [
    { id: 1, src: '/avatars/avatar1.jpg', name: 'Avatar 1' },
    { id: 2, src: '/avatars/avatar2.jpg', name: 'Avatar 2' },
    { id: 3, src: '/avatars/avatar3.jpg', name: 'Avatar 3' },
    { id: 4, src: '/avatars/avatar4.jpg', name: 'Avatar 4' },
    { id: 5, src: '/avatars/avatar5.jpg', name: 'Avatar 5' },
    { id: 6, src: '/avatars/avatar6.jpg', name: 'Avatar 6' },
];

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'goals'
    const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
    const [showPictureModal, setShowPictureModal] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        weight: user?.weight || 70,
        height: user?.height || 170,
        goalWeight: user?.goalWeight || user?.weight || 70,
        bodyFat: user?.bodyFat || 20,
        gender: user?.gender || 'male',
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
                gender: user.gender || 'male',
                dailyCalorieGoal: user.dailyCalorieGoal || 2000,
                dailyBurnGoal: user.dailyBurnGoal || 500
            });
        }
    }, [user]);

    // Handle profile picture file selection
    const handlePictureChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setNotification({ type: 'error', message: 'Please select an image file' });
            return;
        }

        // Resize and convert to base64
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_SIZE = 150;

                // Center crop to square for consistent avatars
                const minDim = Math.min(img.width, img.height);
                const sx = (img.width - minDim) / 2;
                const sy = (img.height - minDim) / 2;

                canvas.width = MAX_SIZE;
                canvas.height = MAX_SIZE;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, MAX_SIZE, MAX_SIZE);

                // Use WebP for 30% smaller size, fallback to JPEG
                const supportsWebP = canvas.toDataURL('image/webp').startsWith('data:image/webp');
                const base64 = supportsWebP
                    ? canvas.toDataURL('image/webp', 0.7)
                    : canvas.toDataURL('image/jpeg', 0.7);
                setProfilePicture(base64);
                setShowPictureModal(false);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };

    // Handle selecting a default avatar
    const handleSelectAvatar = (avatarSrc) => {
        setProfilePicture(avatarSrc);
        setShowPictureModal(false);
    };

    // Handle deleting profile picture
    const handleDeletePicture = () => {
        setProfilePicture('');
        setShowPictureModal(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                weight: Number(formData.weight),
                height: Number(formData.height),
                goalWeight: Number(formData.goalWeight),
                bodyFat: Number(formData.bodyFat),
                gender: formData.gender,
                dailyCalorieGoal: Number(formData.dailyCalorieGoal),
                dailyBurnGoal: Number(formData.dailyBurnGoal)
            };

            // Only include profilePicture if it changed
            if (profilePicture !== (user?.profilePicture || '')) {
                payload.profilePicture = profilePicture;
            }

            const response = await userAPI.updateProfile(payload);
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
                    <div className="relative inline-block">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 border-4 border-zinc-900 shadow-2xl relative z-10 flex items-center justify-center overflow-hidden">
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <User size={48} className="text-white/80" />
                            )}
                        </div>
                        {/* Edit Button */}
                        <button
                            onClick={() => setShowPictureModal(true)}
                            className="absolute bottom-0 right-0 z-20 w-9 h-9 rounded-full bg-blue-600 border-2 border-zinc-900 flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg"
                            title="Edit profile picture"
                        >
                            <Pencil size={14} />
                        </button>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePictureChange}
                        className="hidden"
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 h-36 bg-blue-500/10 blur-xl rounded-full z-0" />
                    <h2 className="text-3xl font-bold mb-1 mt-4">{user?.username}</h2>
                    <p className="text-zinc-400 text-xs bg-white/[0.04] inline-block px-3 py-1 rounded-full border border-white/[0.06]">
                        Level {level.rank} · {(user?.xp || 0).toLocaleString()} pts
                    </p>
                </div>

                {/* Profile Picture Edit Modal */}
                {showPictureModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <div className="w-full max-w-sm bg-zinc-900 rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                                <h3 className="text-lg font-semibold text-white">Edit Profile Picture</h3>
                                <button
                                    onClick={() => setShowPictureModal(false)}
                                    className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.1] transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-5 space-y-5">
                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-colors"
                                    >
                                        <Upload size={20} />
                                        <span className="font-medium">Upload from Device</span>
                                    </button>

                                    {profilePicture && (
                                        <button
                                            onClick={handleDeletePicture}
                                            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-400 hover:bg-red-600/20 transition-colors"
                                        >
                                            <Trash2 size={20} />
                                            <span className="font-medium">Remove Picture</span>
                                        </button>
                                    )}
                                </div>

                                {/* Built-in Avatars */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Image size={14} className="text-zinc-500" />
                                        <span className="text-xs text-zinc-500 font-medium tracking-wide">Or choose an avatar</span>
                                    </div>
                                    <div className="grid grid-cols-6 gap-2">
                                        {DEFAULT_AVATARS.map((avatar) => (
                                            <button
                                                key={avatar.id}
                                                onClick={() => handleSelectAvatar(avatar.src)}
                                                className={`relative aspect-square rounded-full overflow-hidden border-2 transition-all ${
                                                    profilePicture === avatar.src
                                                        ? 'border-blue-500 ring-2 ring-blue-500/40 scale-105'
                                                        : 'border-zinc-700 hover:border-zinc-500 hover:scale-105'
                                                }`}
                                                title={avatar.name}
                                            >
                                                <img src={avatar.src} alt={avatar.name} className="w-full h-full object-cover" />
                                                {profilePicture === avatar.src && (
                                                    <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center">
                                                        <Check size={14} className="text-white" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Card */}
                <Card className="border-white/[0.06]">
                    <div className="flex items-center justify-center p-5">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-white mb-1">{level.rank}</div>
                            <div className="text-[10px] text-zinc-500">{level.label}</div>
                        </div>
                    </div>
                </Card>

                {/* Current vs Goal Stats */}
                <Card className="border-white/[0.06]">
                    <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                        <Target size={16} className="text-blue-400" />
                        Body Metrics
                    </h3>

                    {/* Height & Weight Display */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                            <Ruler size={24} className="mx-auto mb-2 text-blue-400" />
                            <div className="text-2xl font-bold">{formData.height}</div>
                            <div className="text-xs text-zinc-500">Height (cm)</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-4 text-center">
                            <Scale size={24} className="mx-auto mb-2 text-purple-400" />
                            <div className="text-2xl font-bold">{formData.weight}</div>
                            <div className="text-xs text-zinc-500">Current Weight (kg)</div>
                        </div>
                    </div>

                    {/* Goal Weight Card */}
                    <div className="bg-zinc-800/30 rounded-xl p-4 border border-white/[0.06]">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-zinc-400">Goal Weight</span>
                            <span className="text-xl font-bold text-white">{formData.goalWeight} kg</span>
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
                            <span className="font-bold">{bmi.toFixed(1)}</span>
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
                                <span className="text-lg font-bold">{formData.height} cm</span>
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
                                <span className="text-lg font-bold">{formData.weight} kg</span>
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
                                <span className="text-lg font-bold text-blue-400">{formData.goalWeight} kg</span>
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

                        {/* Gender */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-zinc-400 flex items-center gap-2">
                                    <User size={14} className="text-pink-400" /> Gender
                                </span>
                                <span className="text-lg font-bold capitalize">{formData.gender}</span>
                            </div>
                            <div className="flex gap-2">
                                {['male', 'female'].map((g) => (
                                    <button
                                        key={g}
                                        onClick={() => setFormData({ ...formData, gender: g })}
                                        className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                            formData.gender === g
                                                ? g === 'male'
                                                    ? 'bg-blue-600/30 border border-blue-500 text-blue-400'
                                                    : 'bg-pink-600/30 border border-pink-500 text-pink-400'
                                                : 'bg-zinc-800 border border-zinc-700 text-zinc-400 hover:border-zinc-500'
                                        }`}
                                    >
                                        {g === 'male' ? '♂ Male' : '♀ Female'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Body Fat */}
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-zinc-400">Body Fat</span>
                                <span className="text-lg font-bold">{formData.bodyFat}%</span>
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
                            <label className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                                <Flame size={12} className="text-orange-400" /> Calorie Goal
                            </label>
                            <input
                                type="number"
                                value={formData.dailyCalorieGoal}
                                onChange={(e) => setFormData({ ...formData, dailyCalorieGoal: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-xs text-zinc-500 mt-1">kcal / day</span>
                        </div>
                        <div>
                            <label className="text-xs text-zinc-500 mb-2 flex items-center gap-1">
                                <Zap size={12} className="text-blue-400" /> Burn Goal
                            </label>
                            <input
                                type="number"
                                value={formData.dailyBurnGoal}
                                onChange={(e) => setFormData({ ...formData, dailyBurnGoal: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                            <span className="text-xs text-zinc-500 mt-1">kcal / day</span>
                        </div>
                    </div>
                </Card>

                <Button
                    variant="system"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                >
                    <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                </Button>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 text-center">
                        <div className="text-3xl font-bold text-zinc-200">{user?.streak || 0}</div>
                        <div className="text-xs text-zinc-500 mt-1">Day streak</div>
                    </div>
                    <div className="bg-zinc-900/50 p-5 rounded-2xl border border-white/5 text-center">
                        <div className="text-3xl font-bold text-zinc-200">{(user?.xp || 0).toLocaleString()}</div>
                        <div className="text-xs text-zinc-500 mt-1">Total points</div>
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
