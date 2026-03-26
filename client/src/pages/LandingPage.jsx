import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Flame, Trophy } from 'lucide-react';

const FEATURES = [
    { icon: Target, title: 'Daily Goals', desc: 'Clear, simple goals every day', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: Flame,  title: 'Streak System', desc: "Don't break the streak (freeze included)", color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: Trophy, title: 'Rank Progression', desc: 'Unlock new ranks and features', color: 'text-amber-400', bg: 'bg-amber-500/10' },
];

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#050505] text-white">

            {/* ─── Nav ─── */}
            <nav className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
                <span className="text-sm font-bold tracking-tight">FitnessTracker</span>
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/login')} className="text-xs text-zinc-400 hover:text-white transition-colors px-3 py-1.5">
                        Login
                    </button>
                    <button onClick={() => navigate('/register')} className="text-xs font-medium bg-blue-600 hover:bg-blue-500 px-4 py-1.5 rounded-lg transition-colors">
                        Start Free
                    </button>
                </div>
            </nav>

            {/* ─── Hero ─── */}
            <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 text-center">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    Turn Workouts Into<br />
                    <span className="text-blue-400">a Streak Game.</span>
                </h1>
                <p className="text-zinc-400 text-base md:text-lg mt-5 max-w-md mx-auto leading-relaxed">
                    Complete daily goals. Earn XP. Level up your fitness.
                </p>
                <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-blue-600 hover:bg-blue-500 text-sm font-medium px-6 py-2.5 rounded-xl transition-colors active:scale-[0.98]"
                    >
                        Start Free
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-white/[0.06] border border-white/[0.08] hover:bg-white/[0.1] text-sm font-medium px-6 py-2.5 rounded-xl text-zinc-300 transition-colors active:scale-[0.98]"
                    >
                        Login
                    </button>
                </div>
            </section>

            {/* ─── How It Works ─── */}
            <section className="max-w-5xl mx-auto px-6 pb-24">
                <h2 className="text-center text-xs font-medium text-zinc-500 uppercase tracking-widest mb-8">How it works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {FEATURES.map(f => {
                        const Icon = f.icon;
                        return (
                            <div key={f.title} className="border border-white/[0.06] rounded-2xl p-6 bg-white/[0.02]">
                                <div className={`w-10 h-10 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                                    <Icon size={20} className={f.color} />
                                </div>
                                <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
                                <p className="text-xs text-zinc-500 leading-relaxed">{f.desc}</p>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ─── Screenshot ─── */}
            <section className="max-w-5xl mx-auto px-6 pb-24">
                <div className="border border-white/[0.06] rounded-2xl bg-white/[0.02] p-8 flex items-center justify-center min-h-[280px]">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                            <Target size={28} className="text-blue-400" />
                        </div>
                        <p className="text-sm text-zinc-400">Dashboard preview</p>
                        <p className="text-[11px] text-zinc-600 mt-1">Screenshot coming soon</p>
                    </div>
                </div>
            </section>

            {/* ─── Footer ─── */}
            <footer className="border-t border-white/[0.04] py-8">
                <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
                    <span className="text-xs text-zinc-500 font-medium">FitnessTracker</span>
                    <span className="text-[11px] text-zinc-600">Built with React + Node</span>
                </div>
            </footer>
        </div>
    );
}
