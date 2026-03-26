import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Input } from '../components/ui';

export default function Login() {
    const navigate = useNavigate();
    const { login, error } = useAuth();
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [verificationNeeded, setVerificationNeeded] = useState(false);
    const [verificationEmail, setVerificationEmail] = useState('');
    const [resending, setResending] = useState(false);
    const [resendMsg, setResendMsg] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setVerificationNeeded(false);
        setResendMsg('');
        const result = await login(formData);
        if (result.success) {
            navigate('/dashboard');
        } else if (result.needsVerification) {
            setVerificationNeeded(true);
            setVerificationEmail(result.email || '');
        }
        setLoading(false);
    };

    const handleResend = async () => {
        if (resending) return;
        setResending(true);
        try {
            const res = await authAPI.resendVerification(verificationEmail || formData.identifier);
            setResendMsg(res.data.message);
        } catch {
            setResendMsg('Failed to resend. Try again later.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-white flex items-center justify-center p-6">
            <div className="w-full max-w-sm animate-fade-up">
                {/* Brand */}
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-semibold tracking-tight mb-2">
                        Arc
                    </h1>
                    <p className="text-zinc-500 text-sm">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="bg-[var(--bg-surface)] border border-white/[0.06] p-6 rounded-2xl">
                        {error && !verificationNeeded && (
                            <div className="bg-red-500/8 border border-red-500/15 text-red-400 px-3.5 py-2.5 rounded-xl mb-4 text-xs">
                                {error}
                            </div>
                        )}

                        {verificationNeeded && (
                            <div className="bg-amber-500/8 border border-amber-500/15 text-amber-400 px-3.5 py-2.5 rounded-xl mb-4 text-xs space-y-2">
                                <p>Please verify your email before logging in.</p>
                                <button
                                    type="button"
                                    onClick={handleResend}
                                    disabled={resending}
                                    className="underline hover:text-amber-300 transition-colors disabled:opacity-50"
                                >
                                    {resending ? 'Sending...' : 'Resend verification email'}
                                </button>
                                {resendMsg && <p className="text-green-400">{resendMsg}</p>}
                            </div>
                        )}

                        <Input
                            label="Email or Username"
                            name="identifier"
                            placeholder="you@example.com"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
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
                                    Signing in...
                                </span>
                            ) : (
                                'Sign in'
                            )}
                        </button>

                        <p className="text-center text-xs text-zinc-500 mt-4">
                            <Link to="/forgot-password" className="text-zinc-400 hover:text-zinc-300 transition-colors">
                                Forgot password?
                            </Link>
                        </p>

                        <p className="text-center text-xs text-zinc-500 mt-3">
                            Don&apos;t have an account?{' '}
                            <Link to="/register" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                                Create account
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}
