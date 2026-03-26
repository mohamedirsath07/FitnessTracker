/**
 * useQuests — Hook for fetching and managing quest state
 */

import { useState, useEffect, useCallback } from 'react';
import { questAPI } from '../services/api';

export default function useQuests() {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchQuests = useCallback(async () => {
        try {
            setError(null);
            const res = await questAPI.getAll();
            setQuests(res.data.quests || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load quests');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQuests();
    }, [fetchQuests]);

    const activeQuests = quests.filter(q => !q.completed);
    const completedQuests = quests.filter(q => q.completed);
    const dailyQuests = quests.filter(q => q.type === 'daily');
    const weeklyQuests = quests.filter(q => q.type === 'weekly');
    const completedCount = completedQuests.length;
    const totalXPEarned = completedQuests.reduce((sum, q) => sum + q.xpReward, 0);
    const totalXPAvailable = activeQuests.reduce((sum, q) => sum + q.xpReward, 0);

    return {
        quests,
        activeQuests,
        completedQuests,
        dailyQuests,
        weeklyQuests,
        completedCount,
        totalXPEarned,
        totalXPAvailable,
        loading,
        error,
        refetch: fetchQuests,
    };
}
