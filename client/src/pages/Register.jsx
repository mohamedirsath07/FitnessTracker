import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import { Scale, Ruler, User, Target, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const BodyFatVisual = ({ percentage, gender, isSelected, onClick, label, description, category }) => {
    const getBodyShape = () => {
        const isMale = gender === 'male';
        const getWidth = () => {
            if (percentage <= 12) return isMale ? 28 : 26;
            if (percentage <= 18) return isMale ? 32 : 30;
            if (percentage <= 24) return isMale ? 38 : 36;
            if (percentage <= 30) return isMale ? 44 : 42;
            return isMale ? 52 : 50;
        };
        const width = getWidth();
        const color = isSelected ? '#3B82F6' : '#52525b';
        const fillOpacity = isSelected ? 0.3 : 0.1;

        if (isMale) {
            return (
                <svg viewBox="0 0 80 120" className="w-full h-full">
                    <ellipse cx="40" cy="12" rx="10" ry="11" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
                    <rect x="36" y="22" width="8" height="6" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1" />
                    <path d={`M${40 - width / 2} 28 Q${40 - width / 2 - 4} 50 ${40 - width / 2 + 2} 75 L${40 + width / 2 - 2} 75 Q${40 + width / 2 + 4} 50 ${40 + width / 2} 28 Z`} fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
                    <path d={`M${40 - width / 2} 30 Q${40 - width / 2 - 12} 45 ${40 - width / 2 - 8} 65`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                    <path d={`M${40 + width / 2} 30 Q${40 + width / 2 + 12} 45 ${40 + width / 2 + 8} 65`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" />
                    <path d={`M${40 - width / 4} 75 L${40 - width / 4 - 3} 115`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
                    <path d={`M${40 + width / 4} 75 L${40 + width / 4 + 3} 115`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />
                    {percentage <= 15 && (
                        <>
                            <line x1="40" y1="40" x2="40" y2="65" stroke={color} strokeWidth="0.5" opacity="0.5" />
                            <line x1="35" y1="45" x2="45" y2="45" stroke={color} strokeWidth="0.5" opacity="0.5" />
                            <line x1="35" y1="52" x2="45" y2="52" stroke={color} strokeWidth="0.5" opacity="0.5" />
                            <line x1="35" y1="59" x2="45" y2="59" stroke={color} strokeWidth="0.5" opacity="0.5" />
                        </>
                    )}
                </svg>
            );
        }
        return (
            <svg viewBox="0 0 80 120" className="w-full h-full">
                <ellipse cx="40" cy="12" rx="9" ry="10" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
                <rect x="37" y="21" width="6" height="5" fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1" />
                <path d={`M${40 - width / 2 + 4} 26 Q${40 - width / 2 - 2} 35 ${40 - width / 2} 45 Q${40 - width / 2 + 6} 55 ${40 - width / 2 + 2} 65 Q${40 - width / 2 - 2} 72 ${40 - width / 2 + 4} 78 L${40 + width / 2 - 4} 78 Q${40 + width / 2 + 2} 72 ${40 + width / 2 - 2} 65 Q${40 + width / 2 - 6} 55 ${40 + width / 2} 45 Q${40 + width / 2 + 2} 35 ${40 + width / 2 - 4} 26 Z`} fill={color} fillOpacity={fillOpacity} stroke={color} strokeWidth="1.5" />
                <path d={`M${40 - width / 2 + 4} 28 Q${40 - width / 2 - 10} 42 ${40 - width / 2 - 6} 60`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
                <path d={`M${40 + width / 2 - 4} 28 Q${40 + width / 2 + 10} 42 ${40 + width / 2 + 6} 60`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
                <path d={`M${40 - width / 4 + 2} 78 L${40 - width / 4 - 1} 115`} fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
                <path d={`M${40 + width / 4 - 2} 78 L${40 + width / 4 + 1} 115`} fill="none" stroke={color} strokeWidth="5.5" strokeLinecap="round" />
            </svg>
        );
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative flex flex-col items-center p-3 rounded-xl border transition-all duration-200 ${isSelected
                ? 'border-blue-500/40 bg-blue-500/8'
                : 'border-white/[0.06] bg-[var(--bg-surface)] hover:border-white/[0.12]'
            }`}
        >
            {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                </div>
            )}
            <div className="w-14 h-20 mb-1.5">{getBodyShape()}</div>
            <div className="text-sm font-semibold text-zinc-200">{label}</div>
            <div className={`text-[10px] ${isSelected ? 'text-blue-400' : 'text-zinc-500'}`}>{category}</div>
            <div className="text-[9px] text-zinc-600 mt-0.5 text-center leading-tight">{description}</div>
        </button>
    );
};

const DEFAULT_AVATARS = [
    { id: 1, src: '/avatars/avatar1.jpg', name: 'Avatar 1' },
    { id: 2, src: '/avatars/avatar2.jpg', name: 'Avatar 2' },
    { id: 3, src: '/avatars/avatar3.jpg', name: 'Avatar 3' },
    { id: 4, src: '/avatars/avatar4.jpg', name: 'Avatar 4' },
    { id: 5, src: '/avatars/avatar5.jpg', name: 'Avatar 5' },
    { id: 6, src: '/avatars/avatar6.jpg', name: 'Avatar 6' },
];

export default function Register() {
    const navigate = useNavigate();
    const { register, error } = useAuth();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        height: 170,
        weight: 70,
        age: 25,
        gender: 'male',
        bodyFat: 20,
        goal: 'maintenance',
        profilePicture: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!formData.username || formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        }
        if (!formData.email || !formData.email.includes('@')) {
            newErrors.email = 'Please enter a valid email';
        }
        if (!formData.password || formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (validateStep1()) {
            setStep(2);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            username: formData.username,
            email: formData.email,
            password: formData.password,
            height: Number(formData.height),
            weight: Number(formData.weight),
            age: Number(formData.age),
            gender: formData.gender,
            bodyFat: Number(formData.bodyFat),
            goal: formData.goal
        };

        if (formData.profilePicture) {
            payload.profilePicture = formData.profilePicture;
        }

        const result = await register(payload);

        if (result.success) {
            if (result.needsVerification) {
                navigate('/verify-email');
            } else {
                navigate('/dashboard');
            }
        }
        setLoading(false);
    };

    // Body fat ranges with visual references - different for male/female
    const getBodyFatRanges = () => {
        if (formData.gender === 'female') {
            return [
                { value: 14, label: '10-15%', category: 'Essential', description: 'Competition ready, very defined' },
                { value: 18, label: '16-20%', category: 'Athletic', description: 'Athletes, visible muscle tone' },
                { value: 24, label: '21-25%', category: 'Fitness', description: 'Fit & healthy, light definition' },
                { value: 28, label: '26-30%', category: 'Average', description: 'Healthy, soft appearance' },
                { value: 34, label: '31-35%', category: 'Above Avg', description: 'Some excess body fat' },
                { value: 40, label: '36%+', category: 'High', description: 'Higher body fat levels' },
            ];
        }
        return [
            { value: 8, label: '6-10%', category: 'Essential', description: 'Competition ready, veins visible' },
            { value: 12, label: '10-14%', category: 'Athletic', description: 'Six-pack visible, very lean' },
            { value: 18, label: '15-19%', category: 'Fitness', description: 'Fit, some ab definition' },
            { value: 23, label: '20-24%', category: 'Average', description: 'Healthy, soft around middle' },
            { value: 28, label: '25-29%', category: 'Above Avg', description: 'Some excess body fat' },
            { value: 35, label: '30%+', category: 'High', description: 'Higher body fat levels' },
        ];
    };

    const bodyFatRanges = getBodyFatRanges();

    // Get current category color
    const getCategoryInfo = () => {
        const bf = formData.bodyFat;
        const ranges = formData.gender === 'female'
            ? { essential: 15, athletic: 20, fitness: 25, average: 30 }
            : { essential: 10, athletic: 14, fitness: 19, average: 24 };

        if (bf <= ranges.essential) return { name: 'Essential', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        if (bf <= ranges.athletic) return { name: 'Athletic', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' };
        if (bf <= ranges.fitness) return { name: 'Fitness', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
        if (bf <= ranges.average) return { name: 'Average', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' };
        return { name: 'Above Average', color: 'text-zinc-400', bg: 'bg-zinc-500/10', border: 'border-zinc-500/20' };
    };

    const category = getCategoryInfo();

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-semibold tracking-tight mb-2">
                        Create your account
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Step {step} of 2 — {step === 1 ? 'Account details' : 'Body profile'}
                    </p>

                    {/* Progress Indicator */}
                    <div className="flex gap-2 justify-center mt-4">
                        <div className={`h-1 w-16 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                        <div className={`h-1 w-16 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-zinc-700'}`} />
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    {step === 1 ? (
                        /* Step 1: Account Info */
                        <div className="max-w-md mx-auto bg-[var(--bg-surface)] border border-white/[0.06] p-6 rounded-2xl">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Username"
                                name="username"
                                placeholder="Your username"
                                value={formData.username}
                                onChange={handleChange}
                                error={errors.username}
                                required
                            />
                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                error={errors.email}
                                required
                            />
                            <Input
                                label="Password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                error={errors.password}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                error={errors.confirmPassword}
                                required
                            />

                            <Button
                                type="button"
                                onClick={handleNext}
                                className="w-full mt-4"
                            >
                                Continue <ChevronRight size={16} />
                            </Button>

                            <p className="text-center text-sm text-zinc-500 mt-6">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    ) : (
                        /* Step 2: Body Profile */
                        <div className="bg-[var(--bg-surface)] border border-white/[0.06] p-6 rounded-2xl">
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-4 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Avatar Selection */}
                            <div className="mb-6">
                                <label className="text-xs text-zinc-400 font-medium mb-3 block">
                                    Profile picture (optional)
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                    {DEFAULT_AVATARS.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, profilePicture: avatar.src }))}
                                            className={`relative group rounded-xl overflow-hidden border-2 transition-all duration-200 aspect-square ${formData.profilePicture === avatar.src
                                                    ? 'border-blue-500 ring-1 ring-blue-500/30'
                                                    : 'border-zinc-800 hover:border-zinc-600'
                                                }`}
                                        >
                                            <img
                                                src={avatar.src}
                                                alt={avatar.name}
                                                className="w-full h-full object-cover"
                                            />
                                            {formData.profilePicture === avatar.src && (
                                                <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                                    <Check size={12} className="text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>

                            </div>

                            {/* Basic Info Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block font-medium">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        name="height"
                                        value={formData.height}
                                        onChange={handleChange}
                                        min="100"
                                        max="250"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block font-medium">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="number"
                                        name="weight"
                                        value={formData.weight}
                                        onChange={handleChange}
                                        min="30"
                                        max="300"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-400 mb-1 font-medium">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        min="13"
                                        max="100"
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-zinc-400 mb-1 block font-medium">
                                        Gender
                                    </label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/40"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Body Fat Visual Selector */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-xs text-zinc-400 font-medium">
                                        Body fat estimate
                                    </label>
                                    <span className={`text-sm px-3 py-1 rounded-full ${category.bg} ${category.color} ${category.border} border font-medium`}>
                                        {category.name} • {formData.bodyFat}%
                                    </span>
                                </div>

                                {/* Visual Body Fat Grid */}
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                    {bodyFatRanges.map((range) => (
                                        <BodyFatVisual
                                            key={range.value}
                                            percentage={range.value}
                                            gender={formData.gender}
                                            isSelected={formData.bodyFat === range.value}
                                            onClick={() => setFormData(prev => ({ ...prev, bodyFat: range.value }))}
                                            label={range.label}
                                            description={range.description}
                                            category={range.category}
                                        />
                                    ))}
                                </div>

                                <p className="text-xs text-zinc-600 text-center mt-3">
                                    Choose the body type closest to your current physique
                                </p>
                            </div>

                            {/* Fitness Goal */}
                            <div className="mb-6">
                                <label className="text-xs text-zinc-400 mb-2 block font-medium">
                                    Fitness goal
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                    {[
                                        { value: 'weight_loss', label: 'Weight Loss', desc: 'Burn fat' },
                                        { value: 'muscle_gain', label: 'Muscle Gain', desc: 'Build mass' },
                                        { value: 'maintenance', label: 'Maintenance', desc: 'Stay fit' },
                                        { value: 'endurance', label: 'Endurance', desc: 'Cardio focus' }
                                    ].map((goal) => (
                                        <button
                                            key={goal.value}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, goal: goal.value }))}
                                            className={`p-3 rounded-xl border text-center transition-all ${formData.goal === goal.value
                                                ? 'border-blue-500/40 bg-blue-500/8 text-white'
                                                : 'border-white/[0.06] bg-[var(--bg-surface)] text-zinc-400 hover:border-white/[0.12]'
                                                }`}
                                        >
                                            <div className="text-sm font-medium">{goal.label}</div>
                                            <div className="text-[10px] opacity-60">{goal.desc}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setStep(1)}
                                    className="flex-1"
                                >
                                    <ChevronLeft size={18} /> Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    {loading ? 'Creating account...' : 'Create account'}
                                </Button>
                            </div>

                            <p className="text-center text-sm text-zinc-500 mt-4">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
