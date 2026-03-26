import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Input } from '../components/ui';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await authAPI.resetPassword(token, password);
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    // No token in URL
    if (!token) {
        return (
            <div className="min-h-screen bg-[var(--bg-root)] text-white flex items-center justify-center p-6">
                <div className="w-full max-w-sm animate-fade-up">
                    <div className="bg-[var(--bg-surface)] border border-white/[0.06] p-6 rounded-2xl text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-sm text-zinc-300">Invalid reset link.</p>
                        <Link
                            to="/forgot-password"
                            className="inline-block text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                            Request a new reset link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-white flex items-center justify-center p-6">
            <div className="w-full max-w-sm animate-fade-up">
                {/* Brand */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">Arc</h1>
                    <p className="text-zinc-500 text-sm">Choose a new password</p>
                </div>

                {success ? (
                    <div className="bg-[var(--bg-surface)] border border-white/[0.06] p-6 rounded-2xl text-center space-y-4">
                        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <p className="text-sm text-zinc-300">
                            Password reset successfully.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block mt-2 py-3 px-6 rounded-xl font-medium text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors"
                        >
                            Sign in
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="bg-[var(--bg-surface)] border border-white/[0.06] p-6 rounded-2xl">
                            {error && (
                                <div className="bg-red-500/8 border border-red-500/15 text-red-400 px-3.5 py-2.5 rounded-xl mb-4 text-xs">
                                    {error}
                                </div>
                            )}

                            <Input
                                label="New Password"
                                type="password"
                                name="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-5 py-3 px-6 rounded-xl font-medium text-sm bg-blue-600 text-white hover:bg-blue-500 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        Resetting...
                                    </span>
                                ) : (
                                    'Reset password'
                                )}
                            </button>

                            <p className="text-center text-xs text-zinc-500 mt-5">
                                <Link to="/login" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                                    Back to sign in
                                </Link>
                            </p>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
