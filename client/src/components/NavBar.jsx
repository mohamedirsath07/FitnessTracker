import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Dumbbell, User, Target, ScanLine } from 'lucide-react';

const NAV_ITEMS = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
    { path: '/workout', icon: Dumbbell, label: 'Workouts' },
    { path: '/body', icon: ScanLine, label: 'Body' },
    { path: '/quests', icon: Target, label: 'Goals' },
    { path: '/profile', icon: User, label: 'Profile' },
];

function isActive(pathname, path) {
    // Home: match both '/' and '/dashboard'
    if (path === '/dashboard') {
        return pathname === '/' || pathname === '/dashboard';
    }
    // Other routes: match exact or starts with path + '/'
    return pathname === path || pathname.startsWith(path + '/');
}

export default function NavBar() {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
            <div className="bg-[var(--bg-root)]/95 backdrop-blur-xl border-t border-white/[0.06] px-2 py-1.5 flex items-center justify-around max-w-lg mx-auto">
                {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                    const active = isActive(pathname, path);
                    return (
                        <button
                            key={path}
                            onClick={() => navigate(path)}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors duration-200 min-w-[48px] ${
                                active
                                    ? 'text-white'
                                    : 'text-zinc-500 hover:text-zinc-400 active:scale-95'
                            }`}
                        >
                            <Icon size={20} strokeWidth={active ? 2 : 1.6} />
                            <span className={`text-[10px] font-medium ${active ? 'text-white' : 'text-zinc-600'}`}>
                                {label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
