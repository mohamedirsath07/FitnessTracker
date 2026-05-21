import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Input } from '../components/ui';

export default function Login() {
    const navigate = useNavigate();
    const { login, googleLogin, error } = useAuth();
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

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();
            const res = await googleLogin(idToken);
            if (res.success) {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Firebase Google Sign-In Error:', error);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setVerificationNeeded(false);
        setResendMsg('');
        const result = await login(formData);
        if (result.success) {
            navigate('/dashboard');
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
                        Level Up
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

                        <div className="mt-6 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.06]"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-[var(--bg-surface)] px-2 text-zinc-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                type="button"
                                onClick={handleGoogleSignIn}
                                disabled={loading}
                                className="flex items-center justify-center gap-3 w-full py-2.5 px-4 rounded-xl border border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.06] transition-colors text-sm font-medium disabled:opacity-50"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                                </svg>
                                Continue with Google
                            </button>
                        </div>

                        <p className="text-center text-xs text-zinc-500 mt-6">
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
