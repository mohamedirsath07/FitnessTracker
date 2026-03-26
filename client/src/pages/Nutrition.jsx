/**
 * ============================================
 * NUTRITION PAGE — Quick-Add Grid + Custom Entry
 * ============================================
 *
 * v1: Simplified nutrition tracking.
 * Exists to feed Goals/streak logic, not to be a calorie-counting app.
 *
 * - Quick-add grid (35 common foods, one-tap logging)
 * - Custom meal form (name + calories + optional macros)
 * - Today's log with delete
 */

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Utensils, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDataCache } from '../context/DataCacheContext';
import { mealAPI } from '../services/api';
import { Card, Button, Toast } from '../components/ui';
import NavBar from '../components/NavBar';

/* ── Quick-add food database ─────────────────────────── */
const QUICK_FOODS = [
    { emoji: '🍞', name: 'Chapati / Roti', cal: 71, p: 2.7, c: 15, f: 0.4 },
    { emoji: '🍚', name: 'Rice (1 cup)', cal: 206, p: 4.3, c: 45, f: 0.4 },
    { emoji: '🫘', name: 'Dal (1 cup)', cal: 116, p: 9, c: 20, f: 0.4 },
    { emoji: '🧀', name: 'Paneer (100g)', cal: 265, p: 18, c: 1.2, f: 21 },
    { emoji: '🍗', name: 'Chicken Breast (100g)', cal: 165, p: 31, c: 0, f: 3.6 },
    { emoji: '🥚', name: 'Egg (Boiled)', cal: 78, p: 6, c: 0.6, f: 5 },
    { emoji: '🍌', name: 'Banana', cal: 89, p: 1.1, c: 23, f: 0.3 },
    { emoji: '🍎', name: 'Apple', cal: 52, p: 0.3, c: 14, f: 0.2 },
    { emoji: '🥛', name: 'Milk (1 cup)', cal: 146, p: 8, c: 12, f: 8 },
    { emoji: '🥣', name: 'Yogurt / Curd (1 cup)', cal: 59, p: 3.5, c: 3.6, f: 3.3 },
    { emoji: '🫓', name: 'Dosa', cal: 168, p: 4, c: 29, f: 4 },
    { emoji: '🥟', name: 'Idli (1 pc)', cal: 39, p: 2, c: 8, f: 0.1 },
    { emoji: '🥟', name: 'Samosa', cal: 262, p: 4, c: 28, f: 15 },
    { emoji: '🍛', name: 'Biryani (1 cup)', cal: 250, p: 8, c: 35, f: 9 },
    { emoji: '🫓', name: 'Paratha', cal: 260, p: 5, c: 32, f: 13 },
    { emoji: '🍲', name: 'Poha (1 cup)', cal: 180, p: 4, c: 32, f: 5 },
    { emoji: '🥣', name: 'Upma (1 cup)', cal: 165, p: 4, c: 28, f: 5 },
    { emoji: '🥣', name: 'Oats (1 cup)', cal: 154, p: 5, c: 27, f: 2.6 },
    { emoji: '🥜', name: 'Almonds (30g)', cal: 174, p: 6, c: 6.5, f: 15 },
    { emoji: '🥜', name: 'Peanuts (30g)', cal: 170, p: 7.8, c: 5, f: 15 },
    { emoji: '🐟', name: 'Fish Curry (1 cup)', cal: 200, p: 22, c: 6, f: 10 },
    { emoji: '🍖', name: 'Mutton Curry (1 cup)', cal: 295, p: 25, c: 8, f: 18 },
    { emoji: '🥗', name: 'Salad (1 bowl)', cal: 45, p: 2, c: 8, f: 0.5 },
    { emoji: '🥪', name: 'Sandwich', cal: 250, p: 10, c: 30, f: 10 },
    { emoji: '🍕', name: 'Pizza Slice', cal: 285, p: 12, c: 36, f: 10 },
    { emoji: '🍔', name: 'Burger', cal: 354, p: 17, c: 29, f: 19 },
    { emoji: '🍟', name: 'French Fries (med)', cal: 365, p: 4, c: 48, f: 17 },
    { emoji: '☕', name: 'Tea / Coffee', cal: 30, p: 1, c: 4, f: 0.5 },
    { emoji: '🥤', name: 'Protein Shake', cal: 150, p: 25, c: 8, f: 3 },
    { emoji: '🍫', name: 'Chocolate Bar', cal: 230, p: 3, c: 26, f: 13 },
    { emoji: '🍪', name: 'Biscuits (4 pcs)', cal: 180, p: 2, c: 24, f: 8 },
    { emoji: '🫙', name: 'Peanut Butter (2 tbsp)', cal: 188, p: 8, c: 6, f: 16 },
    { emoji: '🍳', name: 'Egg Omelette (2 eggs)', cal: 188, p: 13, c: 1, f: 14 },
    { emoji: '🌯', name: 'Wrap / Roll', cal: 300, p: 12, c: 35, f: 12 },
    { emoji: '🧃', name: 'Juice (1 glass)', cal: 110, p: 0.5, c: 26, f: 0.3 },
];

/* ── Meal-type auto-detect based on current hour ─────── */
function defaultMealType() {
    const h = new Date().getHours();
    if (h < 11) return 'breakfast';
    if (h < 15) return 'lunch';
    if (h < 19) return 'dinner';
    return 'snack';
}

export default function Nutrition() {
    const { user } = useAuth();
    const { getCached, fetchNutrition, invalidate } = useDataCache();
    const cached = getCached('nutrition');

    const [meals, setMeals] = useState(cached?.meals || []);
    const [summary, setSummary] = useState(cached?.summary || null);
    const [loading, setLoading] = useState(!cached);
    const [notification, setNotification] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    /* Meal-type tab state — user picks once, all quick-adds use it */
    const [quickMealType, setQuickMealType] = useState(defaultMealType);

    /* Custom form state */
    const [showCustom, setShowCustom] = useState(false);
    const [custom, setCustom] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: defaultMealType() });

    useEffect(() => {
        fetchNutrition().then(data => {
            if (data) { setMeals(data.meals); setSummary(data.summary); }
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(t);
        }
    }, [notification]);

    /* ── Handlers ──────────────────────────────────────── */

    const logMeal = async (name, calories, protein, carbs, fat, mealType) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await mealAPI.create({
                name,
                calories: Math.round(calories),
                protein: Math.round(protein || 0),
                carbs: Math.round(carbs || 0),
                fats: Math.round(fat || 0),
                mealType: mealType || defaultMealType(),
            });
            setMeals(prev => [res.data.meal, ...prev]);
            setSummary(prev => ({
                ...prev,
                totalCalories: (prev?.totalCalories || 0) + Math.round(calories),
                totalProtein: (prev?.totalProtein || 0) + Math.round(protein || 0),
                totalCarbs: (prev?.totalCarbs || 0) + Math.round(carbs || 0),
                totalFats: (prev?.totalFats || 0) + Math.round(fat || 0),
            }));
            invalidate('nutrition');
            invalidate('dashboard');
            setNotification({ type: 'success', message: `${name} logged! +${Math.round(calories)} kcal` });
        } catch {
            setNotification({ type: 'error', message: 'Failed to log meal' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleQuickAdd = (food) => {
        logMeal(food.name, food.cal, food.p, food.c, food.f, quickMealType);
    };

    const handleCustomSubmit = (e) => {
        e.preventDefault();
        const cal = parseInt(custom.calories, 10);
        if (!custom.name.trim() || !cal || cal <= 0) return;
        logMeal(custom.name.trim(), cal, +custom.protein || 0, +custom.carbs || 0, +custom.fat || 0, custom.mealType);
        setCustom({ name: '', calories: '', protein: '', carbs: '', fat: '', mealType: defaultMealType() });
        setShowCustom(false);
    };

    const handleDelete = async (mealId) => {
        try {
            const meal = meals.find(m => m._id === mealId);
            await mealAPI.delete(mealId);
            setMeals(prev => prev.filter(m => m._id !== mealId));
            invalidate('nutrition');
            invalidate('dashboard');
            if (meal) {
                setSummary(prev => ({
                    ...prev,
                    totalCalories: Math.max(0, (prev?.totalCalories || 0) - meal.calories),
                    totalProtein: Math.max(0, (prev?.totalProtein || 0) - meal.protein),
                    totalCarbs: Math.max(0, (prev?.totalCarbs || 0) - meal.carbs),
                    totalFats: Math.max(0, (prev?.totalFats || 0) - meal.fats),
                }));
            }
        } catch {
            setNotification({ type: 'error', message: 'Failed to delete meal' });
        }
    };

    /* ── Derived ───────────────────────────────────────── */
    const calorieGoal = user?.dailyCalorieGoal || 2000;
    const consumed = summary?.totalCalories || 0;
    const remaining = calorieGoal - consumed;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    /* ── Render ─────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            {/* Header */}
            <header className="px-6 py-6 max-w-5xl mx-auto border-b border-white/5">
                <h1 className="text-2xl font-bold">Nutrition</h1>
                <p className="text-zinc-500 text-sm mt-1">Quick log your meals</p>
            </header>

            <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
                {/* ── Calorie summary bar ──────────────── */}
                <Card className="border-white/[0.06]">
                    <div className="flex justify-between items-center mb-3">
                        <div>
                            <span className="text-3xl font-bold">{consumed}</span>
                            <span className="text-zinc-500 text-sm ml-1">/ {calorieGoal} kcal</span>
                        </div>
                        <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                            remaining > 0
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                            {remaining > 0 ? `${remaining} left` : `${Math.abs(remaining)} over`}
                        </span>
                    </div>
                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ${consumed > calorieGoal ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min((consumed / calorieGoal) * 100, 100)}%` }}
                        />
                    </div>
                    {/* Macro row */}
                    <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs">
                        <div className="bg-zinc-800/50 rounded-lg p-2">
                            <div className="text-purple-400 font-bold text-sm">{summary?.totalProtein || 0}g</div>
                            <div className="text-zinc-500">Protein</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2">
                            <div className="text-amber-400 font-bold text-sm">{summary?.totalCarbs || 0}g</div>
                            <div className="text-zinc-500">Carbs</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-lg p-2">
                            <div className="text-yellow-400 font-bold text-sm">{summary?.totalFats || 0}g</div>
                            <div className="text-zinc-500">Fat</div>
                        </div>
                    </div>
                </Card>

                {/* ── Quick-add grid ───────────────────── */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs text-zinc-500">Quick add</h3>
                        {/* Meal-type strip — set once, all quick-adds use it */}
                        <div className="flex gap-1">
                            {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setQuickMealType(type)}
                                    className={`text-[10px] font-medium px-2 py-1 rounded-lg capitalize transition-all ${
                                        quickMealType === type
                                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                            : 'text-zinc-500 hover:text-zinc-300 border border-transparent'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {QUICK_FOODS.map((food, i) => (
                            <button
                                key={i}
                                onClick={() => handleQuickAdd(food)}
                                disabled={submitting}
                                className="flex items-center gap-2.5 p-3 bg-zinc-900/60 border border-white/5 rounded-xl text-left hover:border-blue-500/30 hover:bg-zinc-800/60 transition-all active:scale-[0.97] disabled:opacity-50"
                            >
                                <span className="text-lg flex-shrink-0">{food.emoji}</span>
                                <div className="min-w-0">
                                    <div className="text-sm font-medium truncate">{food.name}</div>
                                    <div className="text-[11px] text-zinc-500">{food.cal} kcal</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* ── Custom meal form ─────────────────── */}
                <section>
                    <button
                        onClick={() => setShowCustom(!showCustom)}
                        className="flex items-center justify-between w-full text-xs text-zinc-400 hover:text-zinc-300 transition-colors py-2"
                    >
                        <span className="flex items-center gap-1.5"><Plus size={14} /> Custom entry</span>
                        {showCustom ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>

                    {showCustom && (
                        <form onSubmit={handleCustomSubmit} className="space-y-3 pb-2">
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    placeholder="Food name *"
                                    value={custom.name}
                                    onChange={e => setCustom(v => ({ ...v, name: e.target.value }))}
                                    className="col-span-2 bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
                                    required
                                />
                                <input
                                    type="number"
                                    placeholder="Calories *"
                                    value={custom.calories}
                                    onChange={e => setCustom(v => ({ ...v, calories: e.target.value }))}
                                    className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
                                    min="1"
                                    required
                                />
                                <select
                                    value={custom.mealType}
                                    onChange={e => setCustom(v => ({ ...v, mealType: e.target.value }))}
                                    className="bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="breakfast">Breakfast</option>
                                    <option value="lunch">Lunch</option>
                                    <option value="dinner">Dinner</option>
                                    <option value="snack">Snack</option>
                                </select>
                            </div>
                            {/* Optional macros */}
                            <div className="grid grid-cols-3 gap-3">
                                <input type="number" placeholder="Protein (g)" value={custom.protein} onChange={e => setCustom(v => ({ ...v, protein: e.target.value }))} min="0" className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50" />
                                <input type="number" placeholder="Carbs (g)" value={custom.carbs} onChange={e => setCustom(v => ({ ...v, carbs: e.target.value }))} min="0" className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50" />
                                <input type="number" placeholder="Fat (g)" value={custom.fat} onChange={e => setCustom(v => ({ ...v, fat: e.target.value }))} min="0" className="bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50" />
                            </div>
                            <Button type="submit" variant="system" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-500 border-0 text-white text-sm">
                                {submitting ? 'Adding...' : 'Log Meal'}
                            </Button>
                        </form>
                    )}
                </section>

                {/* ── Today's log ──────────────────────── */}
                <section>
                    <h3 className="text-xs text-zinc-500 mb-3">Today&apos;s log ({meals.length})</h3>
                    {meals.length === 0 ? (
                        <div className="text-center py-12 text-zinc-600">
                            <Utensils size={36} className="mx-auto mb-3 opacity-30" />
                            <p>No meals logged today</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {meals.map(meal => (
                                <div
                                    key={meal._id}
                                    className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-xl border border-white/5 group hover:border-white/10 transition-all"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="text-sm font-medium truncate">{meal.name}</div>
                                        <div className="text-[11px] text-zinc-500 flex gap-2 mt-0.5">
                                            <span className="capitalize">{meal.mealType}</span>
                                            {meal.protein > 0 && <span>P:{meal.protein}g</span>}
                                            {meal.carbs > 0 && <span>C:{meal.carbs}g</span>}
                                            {meal.fats > 0 && <span>F:{meal.fats}g</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium text-zinc-300">{meal.calories} kcal</span>
                                        <button
                                            onClick={() => handleDelete(meal._id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>

            <NavBar />
            {notification && <Toast message={notification.message} type={notification.type} />}
        </div>
    );
}
