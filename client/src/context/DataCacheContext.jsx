/**
 * ============================================
 * DATA CACHE CONTEXT
 * ============================================
 * 
 * Caches API responses so pages render instantly on revisit.
 * Uses a ref-based cache to avoid stale closure issues.
 * Invalidation marks data as stale but keeps it for instant rendering.
 */

import { createContext, useContext, useRef, useCallback } from 'react';
import { userAPI, workoutAPI, mealAPI } from '../services/api';

const DataCacheContext = createContext(null);

export function DataCacheProvider({ children }) {
    const cache = useRef({
        dashboard: { data: null, stale: true },
        workout: { data: null, stale: true },
        nutrition: { data: null, stale: true },
    });
    const fetching = useRef({});

    const fetchDashboard = useCallback(async () => {
        // Return cached data if fresh
        if (cache.current.dashboard.data && !cache.current.dashboard.stale) {
            return cache.current.dashboard.data;
        }
        if (fetching.current.dashboard) return cache.current.dashboard.data;
        
        fetching.current.dashboard = true;
        try {
            const response = await userAPI.getStats();
            const data = response.data.stats;
            cache.current.dashboard = { data, stale: false };
            return data;
        } catch (error) {
            console.error('Failed to fetch dashboard stats:', error);
            return cache.current.dashboard.data;
        } finally {
            fetching.current.dashboard = false;
        }
    }, []);

    const fetchWorkout = useCallback(async () => {
        if (cache.current.workout.data && !cache.current.workout.stale) {
            return cache.current.workout.data;
        }
        if (fetching.current.workout) return cache.current.workout.data;
        
        fetching.current.workout = true;
        try {
            const [typesRes, workoutsRes] = await Promise.all([
                workoutAPI.getTypes(),
                workoutAPI.getAll({ limit: 5 })
            ]);
            const data = { types: typesRes.data.types, recent: workoutsRes.data.workouts };
            cache.current.workout = { data, stale: false };
            return data;
        } catch (error) {
            console.error('Failed to fetch workout data:', error);
            return cache.current.workout.data;
        } finally {
            fetching.current.workout = false;
        }
    }, []);

    const fetchNutrition = useCallback(async () => {
        if (cache.current.nutrition.data && !cache.current.nutrition.stale) {
            return cache.current.nutrition.data;
        }
        if (fetching.current.nutrition) return cache.current.nutrition.data;
        
        fetching.current.nutrition = true;
        try {
            const mealsRes = await mealAPI.getToday();
            const data = {
                meals: mealsRes.data.meals,
                summary: mealsRes.data.summary,
            };
            cache.current.nutrition = { data, stale: false };
            return data;
        } catch (error) {
            console.error('Failed to fetch nutrition data:', error);
            return cache.current.nutrition.data;
        } finally {
            fetching.current.nutrition = false;
        }
    }, []);

    // Get cached data instantly (no async, no fetch)
    const getCached = useCallback((key) => cache.current[key]?.data, []);

    // Mark stale — keeps old data for instant render, refreshes on next fetch
    const invalidate = useCallback((key) => {
        if (cache.current[key]) cache.current[key].stale = true;
    }, []);
    const invalidateAll = useCallback(() => {
        Object.keys(cache.current).forEach(k => { cache.current[k].stale = true; });
    }, []);

    const value = {
        getCached,
        fetchDashboard,
        fetchWorkout,
        fetchNutrition,
        invalidate,
        invalidateAll,
    };

    return (
        <DataCacheContext.Provider value={value}>
            {children}
        </DataCacheContext.Provider>
    );
}

export function useDataCache() {
    const context = useContext(DataCacheContext);
    if (!context) {
        throw new Error('useDataCache must be used within a DataCacheProvider');
    }
    return context;
}
