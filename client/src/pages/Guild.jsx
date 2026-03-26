/**
 * Guild Page — Create, join, and view your guild
 */

import React, { useState, useEffect } from 'react';
import { Users, Crown, Copy, LogOut, Trophy, Plus, Check, AlertCircle } from 'lucide-react';
import { guildAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, Button, LoadingScreen } from '../components/ui';
import NavBar from '../components/NavBar';

export default function Guild() {
    const { user } = useAuth();
    const [guild, setGuild] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('my-guild'); // my-guild | leaderboard | join
    const [joinCode, setJoinCode] = useState('');
    const [guildName, setGuildName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [guildRes, lbRes] = await Promise.all([
                guildAPI.getMine(),
                guildAPI.getLeaderboard(),
            ]);
            setGuild(guildRes.data.guild);
            setLeaderboard(lbRes.data.guilds || []);
        } catch (err) {
            console.error('Failed to load guild data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!guildName.trim() || guildName.length < 2) {
            setError('Guild name must be at least 2 characters');
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            const res = await guildAPI.create({ name: guildName.trim() });
            setGuild(res.data.guild);
            setSuccess('Guild created!');
            setTab('my-guild');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create guild');
        } finally {
            setActionLoading(false);
        }
    };

    const handleJoin = async () => {
        if (!joinCode.trim()) {
            setError('Enter a join code');
            return;
        }
        setActionLoading(true);
        setError('');
        try {
            await guildAPI.join(joinCode.trim());
            setSuccess('Joined guild!');
            await loadData();
            setTab('my-guild');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to join guild');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLeave = async () => {
        if (!confirm('Are you sure you want to leave this guild?')) return;
        setActionLoading(true);
        try {
            await guildAPI.leave();
            setGuild(null);
            setSuccess('Left guild');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to leave');
        } finally {
            setActionLoading(false);
        }
    };

    const copyCode = () => {
        if (guild?.code) {
            navigator.clipboard.writeText(guild.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="min-h-screen bg-[#050505] text-white pb-28">
            {/* Header */}
            <header className="px-6 py-6 max-w-5xl mx-auto border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-40">
                <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <Users size={22} className="text-blue-400" />
                    Teams
                </h1>
                <p className="text-xs text-zinc-500 mt-1">Team up with friends</p>
            </header>

            <main className="max-w-5xl mx-auto px-4 md:px-6 pt-6 space-y-6">
                {/* Feedback */}
                {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        <AlertCircle size={16} />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
                        <Check size={16} />
                        {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2">
                    {[
                        { key: 'my-guild', label: guild ? 'My Guild' : 'Create' },
                        { key: 'leaderboard', label: 'Rankings' },
                        { key: 'join', label: 'Join' },
                    ].map(t => (
                        <button
                            key={t.key}
                            onClick={() => { setTab(t.key); setError(''); setSuccess(''); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                                tab === t.key
                                    ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                    : 'bg-zinc-900/50 text-zinc-400 border border-white/5 hover:bg-zinc-800/50'
                            }`}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* My Guild / Create */}
                {tab === 'my-guild' && (
                    guild ? (
                        <div className="space-y-4">
                            {/* Guild Info */}
                            <Card className="border-white/[0.06]">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h2 className="text-lg font-bold">{guild.name}</h2>
                                        <p className="text-xs text-zinc-500">{guild.members?.length || 0} members</p>
                                    </div>
                                    <button
                                        onClick={copyCode}
                                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 border border-white/10 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
                                    >
                                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                        <span className="font-mono tracking-wider">{guild.code}</span>
                                    </button>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-black/30 rounded-xl p-3 text-center">
                                        <div className="text-lg font-bold text-zinc-200">{guild.weeklyXP?.toLocaleString() || 0}</div>
                                        <div className="text-[10px] text-zinc-500">Weekly pts</div>
                                    </div>
                                    <div className="bg-black/30 rounded-xl p-3 text-center">
                                        <div className="text-lg font-bold text-zinc-200">{guild.totalXP?.toLocaleString() || 0}</div>
                                        <div className="text-[10px] text-zinc-500">Total pts</div>
                                    </div>
                                </div>

                                {/* Members */}
                                <div className="space-y-2">
                                    <h3 className="text-xs text-zinc-500 mb-2">Members</h3>
                                    {(guild.members || []).map((m, idx) => {
                                        const member = m.user || m;
                                        const isLeader = guild.leader?._id === member._id || guild.leader === member._id;
                                        return (
                                            <div key={idx} className="flex items-center gap-3 p-2 rounded-lg bg-black/20">
                                                {member.profilePicture ? (
                                                    <img src={member.profilePicture} alt="" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold">
                                                        {(member.username || '?').charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-medium truncate">{member.username}</span>
                                                        {isLeader && <Crown size={12} className="text-amber-400" />}
                                                    </div>
                                                    <span className="text-xs text-zinc-500">{member.xp?.toLocaleString() || 0} pts</span>
                                                </div>
                                                <div className="text-xs text-zinc-400">
                                                    {member.streak > 0 && <span className="text-orange-400">🔥{member.streak}</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Leave */}
                                <button
                                    onClick={handleLeave}
                                    disabled={actionLoading}
                                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm hover:bg-red-500/20 transition-colors"
                                >
                                    <LogOut size={14} />
                                    Leave Guild
                                </button>
                            </Card>
                        </div>
                    ) : (
                        /* Create Guild */
                        <Card className="border-white/[0.06]">
                            <h2 className="text-lg font-bold mb-4">Create a Guild</h2>
                            <p className="text-sm text-zinc-400 mb-4">Start a group and invite friends with a join code.</p>
                            <input
                                type="text"
                                value={guildName}
                                onChange={e => setGuildName(e.target.value)}
                                placeholder="Guild name..."
                                maxLength={30}
                                className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 mb-4"
                            />
                            <button
                                onClick={handleCreate}
                                disabled={actionLoading || !guildName.trim()}
                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
                            >
                                <Plus size={16} />
                                {actionLoading ? 'Creating...' : 'Create Guild'}
                            </button>
                        </Card>
                    )
                )}

                {/* Join Tab */}
                {tab === 'join' && (
                    <Card className="border-white/[0.06]">
                        <h2 className="text-lg font-bold mb-4">Join a Guild</h2>
                        <p className="text-sm text-zinc-400 mb-4">Enter the 6-character code from a friend.</p>
                        <input
                            type="text"
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            placeholder="ABCDEF"
                            maxLength={6}
                            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white text-center font-mono text-2xl tracking-[0.5em] placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 mb-4"
                        />
                        <button
                            onClick={handleJoin}
                            disabled={actionLoading || joinCode.length < 6}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
                        >
                            {actionLoading ? 'Joining...' : 'Join Guild'}
                        </button>
                    </Card>
                )}

                {/* Leaderboard Tab */}
                {tab === 'leaderboard' && (
                    <Card title="Guild Rankings" className="border-white/[0.06]">
                        {leaderboard.length === 0 ? (
                            <div className="text-center py-12 text-zinc-500">
                                <Trophy size={48} className="mx-auto mb-4 opacity-30" />
                                <p>No guilds yet. Be the first!</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {leaderboard.map((g, idx) => (
                                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl ${
                                        idx < 3 ? 'bg-zinc-900/50 border border-white/[0.08]' : 'bg-zinc-900/30 border border-white/5'
                                    }`}>
                                        <div className="w-8 text-center">
                                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : (
                                                <span className="text-sm text-zinc-500 font-mono">{idx + 1}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium truncate">{g.name}</p>
                                            <p className="text-xs text-zinc-500">{g.memberCount} members</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-zinc-200">{g.weeklyXP?.toLocaleString() || 0}</div>
                                            <div className="text-[10px] text-zinc-500">Weekly pts</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}
            </main>

            <NavBar />
        </div>
    );
}
