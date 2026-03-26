/**
 * Quests Page — Full quest board
 * Shows active daily/weekly quests with progress
 */

import React, { useState, useEffect } from 'react';
import { Target, Flame, Trophy, RefreshCw } from 'lucide-react';
import { questAPI } from '../services/api';
import { Card, Skeleton } from '../components/ui';
import QuestCard from '../components/QuestCard';
import NavBar from '../components/NavBar';

export default function Quests() {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all | daily | weekly

    useEffect(() => {
        loadQuests();
    }, []);

    const loadQuests = async () => {
        try {
            const res = await questAPI.getAll();
            setQuests(res.data.quests || []);
        } catch (err) {
            console.error('Failed to load quests:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = filter === 'all'
        ? quests
        : quests.filter(q => q.type === filter);

    const completedCount = quests.filter(q => q.completed).length;
    const totalXPAvailable = quests.reduce((sum, q) => sum + (q.completed ? 0 : q.xpReward), 0);
    const ptsEarned = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xpReward, 0);

    if (loading) return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            <header className="px-6 py-6 max-w-5xl mx-auto border-b border-white/5">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-3 w-40" />
            </header>
            <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-6">
                {/* Stats banner */}
                <div className="grid grid-cols-3 gap-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 flex flex-col items-center gap-2">
                            <Skeleton className="h-7 w-10" />
                            <Skeleton className="h-2 w-12" />
                        </div>
                    ))}
                </div>
                {/* Filter tabs */}
                <div className="flex gap-2">
                    {[1,2,3].map(i => <Skeleton key={i} className="h-9 w-20 rounded-lg" />)}
                </div>
                {/* Quest cards */}
                <div className="space-y-3">
                    {[1,2,3].map(i => (
                        <div key={i} className="bg-zinc-900/50 border border-white/5 rounded-2xl p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="flex-1 space-y-1.5">
                                    <Skeleton className="h-3.5 w-2/3" />
                                    <Skeleton className="h-2.5 w-1/2" />
                                </div>
                                <Skeleton className="h-5 w-14 rounded-full" />
                            </div>
                            <Skeleton className="h-1.5 w-full rounded-full" />
                        </div>
                    ))}
                </div>
            </main>
            <NavBar />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            {/* Header */}
            <header className="px-6 py-6 max-w-5xl mx-auto border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                            <Target size={22} className="text-blue-400" />
                            Goals
                        </h1>
                        <p className="text-xs text-zinc-500 mt-1">
                            {completedCount}/{quests.length} completed · {ptsEarned} pts earned
                        </p>
                    </div>
                    <button
                        onClick={loadQuests}
                        className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-6">
                {/* Stats Banner */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{completedCount}</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Done</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-zinc-200">{ptsEarned}</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Pts earned</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-2xl font-bold text-zinc-200">{totalXPAvailable}</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Pts remaining</div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2">
                    {[
                        { key: 'all', label: 'All', icon: null },
                        { key: 'daily', label: 'Daily', icon: '☀️' },
                        { key: 'weekly', label: 'Weekly', icon: '📅' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                filter === tab.key
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-zinc-900/50 text-zinc-400 border border-white/5 hover:bg-zinc-800/50'
                            }`}
                        >
                            {tab.icon && <span className="mr-1">{tab.icon}</span>}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Quest List */}
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Target size={48} className="mx-auto text-zinc-700 mb-4" />
                        <p className="text-zinc-500">No goals available</p>
                        <p className="text-xs text-zinc-600 mt-1">Check back tomorrow for new goals!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Active quests first, then completed */}
                        {filtered
                            .sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1))
                            .map((quest, idx) => (
                                <QuestCard key={quest.questId || idx} quest={quest} />
                            ))}
                    </div>
                )}
            </main>

            <NavBar />
        </div>
    );
}
