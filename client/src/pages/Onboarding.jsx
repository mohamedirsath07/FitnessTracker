import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, Sparkles } from 'lucide-react';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui';

const GOALS = [
    { value: 'weight_loss', label: 'Lose body fat', description: 'Build consistent habits and a sustainable calorie deficit.' },
    { value: 'muscle_gain', label: 'Build muscle', description: 'Prioritize strength, recovery, and a higher protein target.' },
    { value: 'maintenance', label: 'Stay healthy', description: 'Maintain your current shape with balanced activity.' },
    { value: 'endurance', label: 'Improve endurance', description: 'Build cardio capacity and weekly training consistency.' },
];

const EQUIPMENT = ['Bodyweight', 'Dumbbells', 'Barbell', 'Resistance bands', 'Cardio machines'];

export default function Onboarding() {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [goal, setGoal] = useState(user?.goal || 'maintenance');
    const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'beginner');
    const [dietaryPreference, setDietaryPreference] = useState(user?.dietaryPreference || 'none');
    const [equipment, setEquipment] = useState(user?.equipment || []);
    const [targetDate, setTargetDate] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const toggleEquipment = (item) => {
        setEquipment(current => current.includes(item)
            ? current.filter(value => value !== item)
            : [...current, item]);
    };

    const submit = async (event) => {
        event.preventDefault();
        setSaving(true);
        setError('');
        try {
            const response = await userAPI.completeOnboarding({
                goal, activityLevel, dietaryPreference, equipment, targetDate: targetDate || undefined
            });
            updateUser(response.data.user);
            navigate('/', { replace: true });
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'We could not save your plan. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-white px-4 py-8">
            <main className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                    <div className="mx-auto mb-4 w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Sparkles className="text-blue-400" size={22} />
                    </div>
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-400 font-semibold">Personal setup</p>
                    <h1 className="text-3xl font-semibold mt-2">Build your Level Up plan</h1>
                    <p className="text-sm text-zinc-500 mt-2">Answer four quick questions so your dashboard can guide you from day one.</p>
                </div>

                <form onSubmit={submit} className="space-y-5">
                    <Card title="What are you working toward?">
                        <div className="grid sm:grid-cols-2 gap-3">
                            {GOALS.map(item => (
                                <button
                                    type="button"
                                    key={item.value}
                                    onClick={() => setGoal(item.value)}
                                    className={`text-left p-4 rounded-xl border transition-colors ${goal === item.value ? 'border-blue-500/50 bg-blue-500/10' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{item.label}</span>
                                        {goal === item.value && <Check size={16} className="text-blue-400" />}
                                    </div>
                                    <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{item.description}</p>
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card title="Your experience level">
                        <div className="grid grid-cols-3 gap-2">
                            {['beginner', 'intermediate', 'advanced'].map(value => (
                                <button type="button" key={value} onClick={() => setActivityLevel(value)} className={`capitalize py-3 rounded-xl border text-sm ${activityLevel === value ? 'border-blue-500/50 bg-blue-500/10 text-blue-300' : 'border-white/[0.06] text-zinc-400'}`}>
                                    {value}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card title="What equipment can you use?">
                        <div className="flex flex-wrap gap-2">
                            {EQUIPMENT.map(item => (
                                <button type="button" key={item} onClick={() => toggleEquipment(item)} className={`px-3 py-2 rounded-lg border text-xs ${equipment.includes(item) ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-300' : 'border-white/[0.06] text-zinc-400'}`}>
                                    {item}
                                </button>
                            ))}
                        </div>
                    </Card>

                    <Card title="Nutrition preference">
                        <select value={dietaryPreference} onChange={event => setDietaryPreference(event.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white">
                            <option value="none">No preference</option>
                            <option value="omnivore">Omnivore</option>
                            <option value="vegetarian">Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="pescatarian">Pescatarian</option>
                        </select>
                        <label className="block text-xs text-zinc-500 mt-4 mb-2">Target date (optional)</label>
                        <input type="date" value={targetDate} onChange={event => setTargetDate(event.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white" />
                    </Card>

                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <Button type="submit" disabled={saving} className="w-full" size="lg">
                        {saving ? 'Creating your plan...' : <>Create my plan <ArrowRight size={17} /></>}
                    </Button>
                </form>
            </main>
        </div>
    );
}
