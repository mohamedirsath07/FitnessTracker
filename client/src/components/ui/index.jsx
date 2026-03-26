import React from 'react';

/* ════════════════════════════════════════
   ARC — Core UI Component Library
   
   Clean. Minimal. Professional.
   ════════════════════════════════════════ */

// ─── Button ───────────────────────────────

export function Button({
    children,
    onClick,
    variant = 'primary',
    className = '',
    type = 'button',
    disabled = false,
    size = 'md',
}) {
    const base = "relative font-medium transition-all duration-200 active:scale-[0.98] inline-flex items-center justify-center gap-2 disabled:opacity-40 disabled:pointer-events-none select-none";

    const sizes = {
        sm: 'px-3 py-1.5 text-xs rounded-lg',
        md: 'px-5 py-2.5 text-sm rounded-xl',
        lg: 'px-6 py-3 text-[15px] rounded-xl',
    };

    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700",
        secondary: "bg-white/[0.06] text-zinc-300 border border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.12]",
        ghost: "bg-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]",
        accent: "bg-blue-600 text-white hover:bg-blue-500",
        danger: "bg-red-500/10 text-red-400 border border-red-500/15 hover:bg-red-500/20",
        system: "bg-blue-500/10 text-blue-400 border border-blue-500/15 hover:bg-blue-500/15",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
}

// ─── Card ─────────────────────────────────

export function Card({ children, className = '', title, action, variant = 'surface' }) {
    const variants = {
        surface: 'bg-[var(--bg-surface)] border-white/[0.05]',
        elevated: 'bg-[var(--bg-elevated)] border-white/[0.07]',
        glass: 'bg-white/[0.03] backdrop-blur-xl border-white/[0.05]',
    };

    return (
        <div className={`border rounded-2xl p-5 ${variants[variant]} ${className}`}>
            {(title || action) && (
                <div className="flex justify-between items-center mb-4">
                    {title && <h3 className="text-[13px] font-medium text-zinc-400">{title}</h3>}
                    {action}
                </div>
            )}
            {children}
        </div>
    );
}

// ─── Input ────────────────────────────────

export function Input({
    label,
    type = "text",
    value,
    onChange,
    placeholder,
    name,
    error,
    required = false,
    className = '',
}) {
    return (
        <div className={`mb-3 ${className}`}>
            {label && (
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">
                    {label} {required && <span className="text-red-400">*</span>}
                </label>
            )}
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                className={`w-full bg-white/[0.04] border rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-all duration-200 ${
                    error ? 'border-red-500/50' : 'border-white/[0.08]'
                }`}
            />
            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        </div>
    );
}

// ─── Toast ────────────────────────────────

export function Toast({ message, type = 'info', onClose }) {
    const styles = {
        info: { bg: 'bg-zinc-900 border-white/[0.08]', dot: 'bg-blue-400', text: 'text-zinc-100' },
        success: { bg: 'bg-zinc-900 border-white/[0.08]', dot: 'bg-emerald-400', text: 'text-zinc-100' },
        error: { bg: 'bg-zinc-900 border-white/[0.08]', dot: 'bg-red-400', text: 'text-zinc-100' },
        warning: { bg: 'bg-zinc-900 border-white/[0.08]', dot: 'bg-amber-400', text: 'text-zinc-100' },
        reward: { bg: 'bg-zinc-900 border-white/[0.08]', dot: 'bg-amber-400', text: 'text-zinc-100' },
    };

    const s = styles[type] || styles.info;

    return (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 ${s.bg} ${s.text} backdrop-blur-xl border px-5 py-3 rounded-2xl shadow-2xl z-[60] animate-fade-up flex items-center gap-3 min-w-[280px] max-w-[90vw]`}>
            <div className={`w-2 h-2 rounded-full ${s.dot} shrink-0`} />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{message}</div>
            </div>
        </div>
    );
}

// ─── Spinner ──────────────────────────────

export function Spinner({ size = 'md' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
    return (
        <div className={`${sizes[size]} border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin`} />
    );
}

// ─── LoadingScreen ────────────────────────

export function LoadingScreen() {
    return (
        <div className="min-h-screen bg-[var(--bg-root)] flex items-center justify-center">
            <div className="text-center">
                <Spinner size="lg" />
                <p className="text-zinc-500 mt-4 text-xs tracking-wider font-medium">Loading...</p>
            </div>
        </div>
    );
}

// ─── StatCard ─────────────────────────────

export function StatCard({ icon, value, label, unit, goal, color = 'blue' }) {
    const palette = {
        cyan: { border: 'border-white/[0.05]', icon: 'text-blue-400 bg-blue-500/[0.06]', bar: 'bg-blue-500' },
        blue: { border: 'border-white/[0.05]', icon: 'text-blue-400 bg-blue-500/[0.06]', bar: 'bg-blue-500' },
        orange: { border: 'border-white/[0.05]', icon: 'text-orange-400 bg-orange-500/[0.06]', bar: 'bg-orange-500' },
        green: { border: 'border-white/[0.05]', icon: 'text-emerald-400 bg-emerald-500/[0.06]', bar: 'bg-emerald-500' },
        purple: { border: 'border-white/[0.05]', icon: 'text-indigo-400 bg-indigo-500/[0.06]', bar: 'bg-indigo-500' },
        amber: { border: 'border-white/[0.05]', icon: 'text-amber-400 bg-amber-500/[0.06]', bar: 'bg-amber-500' },
    };

    const p = palette[color] || palette.blue;
    const progress = goal ? Math.min((Number(value) / goal) * 100, 100) : null;

    return (
        <div className={`bg-[var(--bg-surface)] border ${p.border} rounded-2xl p-4 relative overflow-hidden flex flex-col`}>
            <div className="flex items-start justify-between mb-2">
                <div className={`p-1.5 rounded-lg ${p.icon}`}>
                    {icon}
                </div>
                {goal && (
                    <span className="text-[10px] text-zinc-600 font-medium tabular-nums">/ {goal.toLocaleString()}</span>
                )}
            </div>
            <div className="mt-auto">
                <div className="text-xl font-semibold text-zinc-50 tracking-tight tabular-nums leading-none">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                    {unit && <span className="text-[10px] text-zinc-500 font-normal ml-1">{unit}</span>}
                </div>
                <div className="text-[11px] text-zinc-500 mt-1">{label}</div>
            </div>
            {progress !== null && (
                <div className="mt-2.5 h-0.5 bg-white/[0.05] rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full animate-progress-fill ${p.bar}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Modal ────────────────────────────────

export function Modal({ children, isOpen, onClose, title }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
            <div
                className="bg-[var(--bg-elevated)] w-full max-w-md rounded-2xl border border-white/[0.08] overflow-hidden shadow-2xl animate-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {title && (
                    <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-white/[0.05] rounded-lg transition-colors text-zinc-400 hover:text-white">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                    </div>
                )}
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────

export function Skeleton({ className = '', rounded = 'rounded-lg' }) {
    return (
        <div className={`bg-white/[0.04] animate-shimmer ${rounded} ${className}`} />
    );
}
