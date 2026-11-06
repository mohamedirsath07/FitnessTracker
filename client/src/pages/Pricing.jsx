import React, { useState } from 'react';
import { Check, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paymentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Button, Card } from '../components/ui';

const FEATURES = ['Personalized onboarding plan', 'Unlimited workout and meal history', 'Advanced progress analytics', '3D body insights', 'Priority feature access'];

export default function Pricing() {
    const { isAuthenticated } = useAuth();
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const startCheckout = async (planType) => {
        if (!isAuthenticated) return;
        setLoading(true);
        setMessage('');
        try {
            const response = await paymentAPI.subscribe(planType);
            if (response.data.shortUrl) window.location.href = response.data.shortUrl;
            else setMessage('Checkout is not configured for this environment yet.');
        } catch (error) {
            setMessage(error.response?.data?.message || 'Checkout is currently unavailable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-root)] text-white px-4 py-12">
            <main className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-400 font-semibold">Level Up Pro</p>
                    <h1 className="text-4xl font-semibold mt-3">A plan that grows with you</h1>
                    <p className="text-zinc-500 mt-3">Start free. Upgrade when you want deeper coaching and analytics.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
                    <Card title="Free">
                        <p className="text-3xl font-semibold mt-2">$0 <span className="text-sm text-zinc-500 font-normal">forever</span></p>
                        <p className="text-sm text-zinc-500 mt-3">Everything you need to build the habit.</p>
                        <ul className="space-y-3 mt-6">{FEATURES.slice(0, 2).map(feature => <li key={feature} className="flex gap-2 text-sm text-zinc-300"><Check size={16} className="text-emerald-400" />{feature}</li>)}</ul>
                    </Card>
                    <Card className="border-blue-500/30 bg-blue-500/[0.04]" title={<span className="flex items-center gap-2">Pro <Crown size={15} className="text-amber-400" /></span>}>
                        <p className="text-3xl font-semibold mt-2">₹499 <span className="text-sm text-zinc-500 font-normal">/ month</span></p>
                        <p className="text-sm text-zinc-500 mt-3">Personalized guidance for serious progress.</p>
                        <ul className="space-y-3 mt-6">{FEATURES.map(feature => <li key={feature} className="flex gap-2 text-sm text-zinc-300"><Check size={16} className="text-blue-400" />{feature}</li>)}</ul>
                        {isAuthenticated ? <Button onClick={() => startCheckout('monthly')} disabled={loading} className="w-full mt-7">{loading ? 'Opening checkout...' : 'Upgrade to Pro'}</Button> : <Link to="/register"><Button className="w-full mt-7">Start free</Button></Link>}
                    </Card>
                </div>
                {message && <p className="text-center text-sm text-amber-300 mt-6">{message}</p>}
            </main>
        </div>
    );
}
