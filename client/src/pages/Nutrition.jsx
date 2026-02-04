/**
 * ============================================
 * NUTRITION PAGE - Healthify-style Food Tracking
 * ============================================
 * 
 * Features:
 * - Food search with nutrition API
 * - Quantity input (grams, pieces, cups, etc.)
 * - Auto-calculate calories, protein, carbs, fats, fiber
 * - Common foods quick-add
 * - Daily nutrition summary
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Utensils, Flame, Beef, Wheat, Droplet, Leaf, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mealAPI } from '../services/api';
import { Card, Button, Input, Toast } from '../components/ui';
import NavBar from '../components/NavBar';

// Debounce hook for search
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
}

export default function Nutrition() {
    const { user } = useAuth();
    const [meals, setMeals] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    
    // Search state
    const [showAddModal, setShowAddModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [commonFoods, setCommonFoods] = useState([]);
    const [searching, setSearching] = useState(false);
    const [activeTab, setActiveTab] = useState('search'); // 'search' or 'common'
    
    // Selected food state
    const [selectedFood, setSelectedFood] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [unit, setUnit] = useState('serving');
    const [mealType, setMealType] = useState('snack');
    const [submitting, setSubmitting] = useState(false);

    const debouncedSearch = useDebounce(searchQuery, 500);

    // Fetch today's meals
    useEffect(() => {
        const fetchMeals = async () => {
            try {
                const [mealsRes, commonRes] = await Promise.all([
                    mealAPI.getToday(),
                    mealAPI.getCommon()
                ]);
                setMeals(mealsRes.data.meals);
                setSummary(mealsRes.data.summary);
                setCommonFoods(commonRes.data.foods || []);
            } catch (error) {
                console.error('Failed to fetch meals:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchMeals();
    }, []);

    // Search foods when query changes
    useEffect(() => {
        const searchFoods = async () => {
            if (debouncedSearch.length < 2) {
                setSearchResults([]);
                return;
            }
            
            setSearching(true);
            try {
                const response = await mealAPI.search(debouncedSearch);
                setSearchResults(response.data.foods || []);
            } catch (error) {
                console.error('Search failed:', error);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        };

        searchFoods();
    }, [debouncedSearch]);

    // Calculate nutrition based on quantity
    const calculateNutrition = useCallback(() => {
        if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };

        let multiplier = quantity;

        // If it's a common food with fixed serving
        if (selectedFood.id?.startsWith('common_')) {
            if (selectedFood.unit === 'grams') {
                multiplier = quantity / 100; // Per 100g
            }
            return {
                calories: Math.round(selectedFood.calories * multiplier),
                protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
                carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
                fats: Math.round(selectedFood.fats * multiplier * 10) / 10,
                fiber: Math.round((selectedFood.fiber || 0) * multiplier * 10) / 10
            };
        }

        // For API foods, calculate based on per 100g values
        const n = selectedFood.nutritionPer100g;
        if (!n) return { calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0 };

        if (unit === 'grams') {
            multiplier = quantity / 100;
        } else if (unit === 'ml') {
            multiplier = quantity / 100;
        } else if (unit === 'cups') {
            multiplier = (quantity * 240) / 100; // 1 cup ≈ 240g
        } else if (unit === 'pieces') {
            multiplier = quantity * (selectedFood.servingSize || 50) / 100;
        } else if (unit === 'serving') {
            multiplier = quantity * (selectedFood.servingSize || 100) / 100;
        } else if (unit === 'tbsp') {
            multiplier = (quantity * 15) / 100;
        }

        return {
            calories: Math.round(n.calories * multiplier),
            protein: Math.round(n.protein * multiplier * 10) / 10,
            carbs: Math.round(n.carbs * multiplier * 10) / 10,
            fats: Math.round(n.fats * multiplier * 10) / 10,
            fiber: Math.round((n.fiber || 0) * multiplier * 10) / 10
        };
    }, [selectedFood, quantity, unit]);

    const handleSelectFood = (food) => {
        setSelectedFood(food);
        setQuantity(1);
        // Set default unit based on food
        setUnit(food.suggestedUnit || food.unit || 'serving');
    };

    const handleSubmit = async () => {
        if (!selectedFood) return;

        setSubmitting(true);
        const nutrition = calculateNutrition();

        try {
            const response = await mealAPI.create({
                name: selectedFood.name + (selectedFood.brand ? ` (${selectedFood.brand})` : ''),
                mealType,
                quantity,
                unit,
                calories: nutrition.calories,
                protein: nutrition.protein,
                carbs: nutrition.carbs,
                fats: nutrition.fats,
                fiber: nutrition.fiber,
                externalId: selectedFood.id
            });

            setMeals(prev => [response.data.meal, ...prev]);
            setSummary(prev => ({
                ...prev,
                totalCalories: (prev?.totalCalories || 0) + nutrition.calories,
                totalProtein: (prev?.totalProtein || 0) + nutrition.protein,
                totalCarbs: (prev?.totalCarbs || 0) + nutrition.carbs,
                totalFats: (prev?.totalFats || 0) + nutrition.fats,
                totalFiber: (prev?.totalFiber || 0) + nutrition.fiber
            }));

            setNotification({ type: 'success', message: `${selectedFood.name} logged! +${nutrition.calories} kcal` });
            
            // Reset
            setShowAddModal(false);
            setSelectedFood(null);
            setSearchQuery('');
            setSearchResults([]);

        } catch (error) {
            setNotification({ type: 'error', message: 'Failed to log meal' });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (mealId) => {
        try {
            const meal = meals.find(m => m._id === mealId);
            await mealAPI.delete(mealId);
            setMeals(prev => prev.filter(m => m._id !== mealId));
            if (meal) {
                setSummary(prev => ({
                    ...prev,
                    totalCalories: Math.max(0, (prev?.totalCalories || 0) - meal.calories),
                    totalProtein: Math.max(0, (prev?.totalProtein || 0) - meal.protein),
                    totalCarbs: Math.max(0, (prev?.totalCarbs || 0) - meal.carbs),
                    totalFats: Math.max(0, (prev?.totalFats || 0) - meal.fats)
                }));
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
    };

    useEffect(() => {
        if (notification) {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const calorieGoal = user?.dailyCalorieGoal || 2000;
    const caloriesConsumed = summary?.totalCalories || 0;
    const calorieProgress = Math.min((caloriesConsumed / calorieGoal) * 100, 100);
    const nutrition = selectedFood ? calculateNutrition() : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            <header className="px-6 py-6 max-w-5xl mx-auto border-b border-white/5">
                <h1 className="text-2xl font-bold">Nutrition</h1>
                <p className="text-zinc-500 text-sm mt-1">Track your meals and macros</p>
            </header>

            <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
                {/* Daily Summary Card */}
                <Card className="border-green-500/20 bg-gradient-to-br from-green-950/20 to-emerald-950/10">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <div className="text-4xl font-bold font-mono">{caloriesConsumed}</div>
                            <div className="text-xs text-zinc-400">of {calorieGoal} kcal goal</div>
                        </div>
                        <div className={`text-sm px-4 py-2 rounded-full font-medium ${
                            caloriesConsumed > calorieGoal 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                        }`}>
                            {calorieGoal - caloriesConsumed > 0 
                                ? `${calorieGoal - caloriesConsumed} remaining`
                                : `${caloriesConsumed - calorieGoal} over`
                            }
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="h-3 bg-zinc-800 rounded-full overflow-hidden mb-6">
                        <div 
                            className={`h-full transition-all duration-500 ${
                                caloriesConsumed > calorieGoal ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-emerald-400'
                            }`} 
                            style={{ width: `${calorieProgress}%` }} 
                        />
                    </div>

                    {/* Macros Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                            <Beef size={18} className="mx-auto mb-1 text-purple-400" />
                            <div className="text-lg font-bold text-purple-400">{summary?.totalProtein || 0}g</div>
                            <div className="text-[10px] text-zinc-500 uppercase">Protein</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                            <Wheat size={18} className="mx-auto mb-1 text-amber-400" />
                            <div className="text-lg font-bold text-amber-400">{summary?.totalCarbs || 0}g</div>
                            <div className="text-[10px] text-zinc-500 uppercase">Carbs</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                            <Droplet size={18} className="mx-auto mb-1 text-yellow-400" />
                            <div className="text-lg font-bold text-yellow-400">{summary?.totalFats || 0}g</div>
                            <div className="text-[10px] text-zinc-500 uppercase">Fats</div>
                        </div>
                        <div className="bg-zinc-800/50 rounded-xl p-3 text-center">
                            <Leaf size={18} className="mx-auto mb-1 text-green-400" />
                            <div className="text-lg font-bold text-green-400">{summary?.totalFiber || 0}g</div>
                            <div className="text-[10px] text-zinc-500 uppercase">Fiber</div>
                        </div>
                    </div>
                </Card>

                {/* Add Food Button */}
                <Button 
                    variant="system" 
                    onClick={() => setShowAddModal(true)} 
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 border-0"
                >
                    <Plus size={20} /> Log Food
                </Button>

                {/* Today's Meals */}
                <div>
                    <h3 className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Today's Log</h3>
                    {meals.length === 0 ? (
                        <div className="text-center py-16 text-zinc-500">
                            <Utensils size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg">No meals logged today</p>
                            <p className="text-sm mt-1">Tap "Log Food" to add your first meal</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {meals.map(meal => (
                                <div 
                                    key={meal._id} 
                                    className="flex justify-between items-center p-4 bg-zinc-900/50 rounded-2xl border border-white/5 group hover:border-green-500/20 transition-all"
                                >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 flex-shrink-0">
                                            <Utensils size={20} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="font-medium truncate">{meal.name}</div>
                                            <div className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                                                <span className="capitalize">{meal.mealType}</span>
                                                <span>•</span>
                                                <span>{meal.quantity} {meal.unit}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-green-400 font-bold">{meal.calories} kcal</div>
                                            <div className="text-[10px] text-zinc-500">
                                                P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(meal._id)} 
                                            className="opacity-0 group-hover:opacity-100 text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Food Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center">
                    <div className="bg-zinc-900 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl max-h-[90vh] overflow-hidden border border-white/10">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10">
                            <h2 className="text-lg font-bold">
                                {selectedFood ? 'Add Food' : 'Search Food'}
                            </h2>
                            <button 
                                onClick={() => {
                                    setShowAddModal(false);
                                    setSelectedFood(null);
                                    setSearchQuery('');
                                }}
                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
                            {!selectedFood ? (
                                /* Search View */
                                <div className="p-4 space-y-4">
                                    {/* Search Input */}
                                    <div className="relative">
                                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                                        <input
                                            type="text"
                                            placeholder="Search for food..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-green-500"
                                            autoFocus
                                        />
                                        {searching && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                <div className="w-5 h-5 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Tabs */}
                                    <div className="flex bg-zinc-800 rounded-lg p-1">
                                        <button
                                            onClick={() => setActiveTab('search')}
                                            className={`flex-1 py-2 rounded-md text-sm transition-all ${
                                                activeTab === 'search' ? 'bg-green-500 text-white' : 'text-zinc-400'
                                            }`}
                                        >
                                            Search Results
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('common')}
                                            className={`flex-1 py-2 rounded-md text-sm transition-all ${
                                                activeTab === 'common' ? 'bg-green-500 text-white' : 'text-zinc-400'
                                            }`}
                                        >
                                            Common Foods
                                        </button>
                                    </div>

                                    {/* Results */}
                                    <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                                        {activeTab === 'search' ? (
                                            searchResults.length > 0 ? (
                                                searchResults.map(food => (
                                                    <button
                                                        key={food.id}
                                                        onClick={() => handleSelectFood(food)}
                                                        className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-left transition-all"
                                                    >
                                                        {food.image ? (
                                                            <img src={food.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-zinc-700" />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center">
                                                                <Utensils size={20} className="text-zinc-500" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{food.name}</div>
                                                            {food.brand && <div className="text-xs text-zinc-500">{food.brand}</div>}
                                                            <div className="text-xs text-green-400 mt-0.5">
                                                                {food.nutritionPer100g?.calories || 0} kcal / 100g
                                                            </div>
                                                        </div>
                                                        <ChevronDown size={20} className="text-zinc-500 -rotate-90" />
                                                    </button>
                                                ))
                                            ) : searchQuery.length >= 2 && !searching ? (
                                                <div className="text-center py-8 text-zinc-500">
                                                    <p>No results found</p>
                                                    <p className="text-sm mt-1">Try a different search term or check common foods</p>
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 text-zinc-500">
                                                    <Search size={32} className="mx-auto mb-2 opacity-30" />
                                                    <p>Search for food to see results</p>
                                                </div>
                                            )
                                        ) : (
                                            commonFoods.map(food => (
                                                <button
                                                    key={food.id}
                                                    onClick={() => handleSelectFood(food)}
                                                    className="w-full flex items-center gap-3 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-xl text-left transition-all"
                                                >
                                                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-xl">
                                                        🍽️
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="font-medium">{food.name}</div>
                                                        <div className="text-xs text-green-400">
                                                            {food.calories} kcal / {food.unit === 'grams' ? '100g' : `1 ${food.unit.slice(0, -1)}`}
                                                        </div>
                                                    </div>
                                                    <ChevronDown size={20} className="text-zinc-500 -rotate-90" />
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            ) : (
                                /* Food Detail View */
                                <div className="p-4 space-y-5">
                                    {/* Selected Food */}
                                    <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl">
                                        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center text-2xl">
                                            🍽️
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{selectedFood.name}</h3>
                                            {selectedFood.brand && <p className="text-sm text-zinc-400">{selectedFood.brand}</p>}
                                        </div>
                                    </div>

                                    {/* Quantity & Unit */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-zinc-500 uppercase mb-2">Quantity</label>
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(Math.max(1, Math.round(parseFloat(e.target.value)) || 1))}
                                                min="1"
                                                step="1"
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white text-lg font-mono focus:outline-none focus:border-green-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-zinc-500 uppercase mb-2">Unit</label>
                                            <select
                                                value={unit}
                                                onChange={(e) => setUnit(e.target.value)}
                                                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-green-500"
                                            >
                                                <option value="grams">Grams (g)</option>
                                                <option value="pieces">Pieces</option>
                                                <option value="cups">Cups</option>
                                                <option value="ml">Milliliters (ml)</option>
                                                <option value="tbsp">Tablespoons</option>
                                                <option value="serving">Serving</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Meal Type */}
                                    <div>
                                        <label className="block text-xs text-zinc-500 uppercase mb-2">Meal Type</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['breakfast', 'lunch', 'dinner', 'snack'].map(type => (
                                                <button
                                                    key={type}
                                                    onClick={() => setMealType(type)}
                                                    className={`py-2 rounded-xl text-sm capitalize transition-all ${
                                                        mealType === type
                                                            ? 'bg-green-500 text-white'
                                                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                                    }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Nutrition Preview */}
                                    {nutrition && (
                                        <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3">
                                            <h4 className="text-xs text-zinc-500 uppercase">Nutrition</h4>
                                            <div className="flex justify-between items-center">
                                                <span className="text-zinc-400 flex items-center gap-2">
                                                    <Flame size={16} className="text-orange-400" /> Calories
                                                </span>
                                                <span className="text-2xl font-bold text-orange-400">{nutrition.calories} kcal</span>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-zinc-700">
                                                <div className="text-center">
                                                    <div className="text-purple-400 font-bold">{nutrition.protein}g</div>
                                                    <div className="text-[10px] text-zinc-500">Protein</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-amber-400 font-bold">{nutrition.carbs}g</div>
                                                    <div className="text-[10px] text-zinc-500">Carbs</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-yellow-400 font-bold">{nutrition.fats}g</div>
                                                    <div className="text-[10px] text-zinc-500">Fats</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-green-400 font-bold">{nutrition.fiber}g</div>
                                                    <div className="text-[10px] text-zinc-500">Fiber</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setSelectedFood(null)}
                                            className="flex-1"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            variant="system"
                                            onClick={handleSubmit}
                                            disabled={submitting || !nutrition?.calories}
                                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                                        >
                                            {submitting ? 'Adding...' : `Add ${nutrition?.calories || 0} kcal`}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <NavBar />
            {notification && <Toast message={notification.message} type={notification.type} />}
        </div>
    );
}
