import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { Input } from '../components/ui';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await authAPI.forgotPassword(email);
            setSent(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-white flex items-center justify-center p-6">
            <div className="w-full max-w-sm animate-fade-up">
                {/* Brand */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">Arc</h1>
                    <p className="text-zinc-500 text-sm">Reset your password</p>
                </div>

                {sent ? (
                    <div className="bg-[var(--bg-surface)] border border-white/[0.06] p-6 rounded-2xl text-center space-y-4">
                        {/* Success state */}
                        <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                            <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-sm text-zinc-300">
                            If an account with that email exists, we've sent a password reset link.
                        </p>
                        <p className="text-xs text-zinc-500">
                            The link expires in 1 hour. Check your spam folder if you don't see it.
                        </p>
                        <Link
                            to="/login"
                            className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors font-medium"
                        >
                            Back to sign in
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

                            <p className="text-xs text-zinc-400 mb-4">
                                Enter the email address associated with your account and we'll send you a link to reset your password.
                            </p>

                            <Input
                                label="Email"
                                type="email"
                                name="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                        Sending...
                                    </span>
                                ) : (
                                    'Send reset link'
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
