/**
 * ============================================
 * VERIFY EMAIL PAGE
 * ============================================
 *
 * Handles two flows:
 * 1. User clicks verify link from email → verifies token via API
 * 2. User lands here after registration → shows "check your email" message
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [status, setStatus] = useState(token ? 'verifying' : 'pending'); // verifying | success | error | pending | resent
    const [message, setMessage] = useState('');
    const [resendEmail, setResendEmail] = useState('');
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (!token) return;

        const verify = async () => {
            try {
                const res = await authAPI.verifyEmail(token);
                setStatus('success');
                setMessage(res.data.message);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.message || 'Verification failed');
            }
        };

        verify();
    }, [token]);

    const handleResend = async () => {
        if (!resendEmail.trim() || resending) return;
        setResending(true);
        try {
            const res = await authAPI.resendVerification(resendEmail.trim());
            setStatus('resent');
            setMessage(res.data.message);
        } catch {
            setMessage('Failed to resend. Try again later.');
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4">
            <div className="max-w-sm w-full text-center space-y-6">
                {/* Verifying */}
                {status === 'verifying' && (
                    <>
                        <Loader2 size={48} className="mx-auto text-blue-500 animate-spin" />
                        <h1 className="text-xl font-bold text-white">Verifying your email...</h1>
                    </>
                )}

                {/* Success */}
                {status === 'success' && (
                    <>
                        <CheckCircle2 size={48} className="mx-auto text-green-500" />
                        <h1 className="text-xl font-bold text-white">Email Verified!</h1>
                        <p className="text-zinc-400 text-sm">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        >
                            Go to Login
                        </Link>
                    </>
                )}

                {/* Error */}
                {status === 'error' && (
                    <>
                        <XCircle size={48} className="mx-auto text-red-500" />
                        <h1 className="text-xl font-bold text-white">Verification Failed</h1>
                        <p className="text-zinc-400 text-sm">{message}</p>
                        <div className="space-y-3 pt-2">
                            <input
                                type="email"
                                placeholder="Enter your email to resend"
                                value={resendEmail}
                                onChange={e => setResendEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
                            />
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {resending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                        </div>
                    </>
                )}

                {/* Pending (post-registration) */}
                {status === 'pending' && (
                    <>
                        <Mail size={48} className="mx-auto text-blue-400" />
                        <h1 className="text-xl font-bold text-white">Check Your Email</h1>
                        <p className="text-zinc-400 text-sm">
                            We&apos;ve sent a verification link to your email address.
                            Click the link to activate your account.
                        </p>
                        <div className="space-y-3 pt-2">
                            <input
                                type="email"
                                placeholder="Enter your email to resend"
                                value={resendEmail}
                                onChange={e => setResendEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50"
                            />
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {resending ? 'Sending...' : 'Resend Verification Email'}
                            </button>
                        </div>
                        <Link to="/login" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                            Back to Login
                        </Link>
                    </>
                )}

                {/* Resent */}
                {status === 'resent' && (
                    <>
                        <CheckCircle2 size={48} className="mx-auto text-green-500" />
                        <h1 className="text-xl font-bold text-white">Verification Email Sent</h1>
                        <p className="text-zinc-400 text-sm">{message}</p>
                        <Link to="/login" className="text-zinc-500 hover:text-zinc-300 text-xs transition-colors">
                            Back to Login
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
