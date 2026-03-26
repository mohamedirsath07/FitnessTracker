/**
 * useShareCard — Generates a shareable workout summary image via Canvas API
 * Returns a share() function that triggers Web Share API or downloads fallback
 */

import { useCallback } from 'react';

export default function useShareCard() {
    const share = useCallback(async ({ title = 'Workout Complete', stats = {}, rank = '', xp = 0 }) => {
        const W = 600, H = 340;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // Background
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.roundRect(0, 0, W, H, 16);
        ctx.fill();

        // Border
        ctx.strokeStyle = '#22d3ee40';
        ctx.lineWidth = 2;
        ctx.roundRect(4, 4, W - 8, H - 8, 12);
        ctx.stroke();

        // Title
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 28px system-ui, sans-serif';
        ctx.fillText(title, 30, 50);

        // Divider
        ctx.fillStyle = '#22d3ee30';
        ctx.fillRect(30, 65, W - 60, 1);

        // Stats
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '16px system-ui, sans-serif';
        let y = 100;
        const entries = Object.entries(stats);
        entries.forEach(([key, val]) => {
            ctx.fillStyle = '#94a3b8';
            ctx.fillText(key, 30, y);
            ctx.fillStyle = '#f1f5f9';
            ctx.font = 'bold 16px system-ui, sans-serif';
            ctx.fillText(String(val), 250, y);
            ctx.font = '16px system-ui, sans-serif';
            y += 32;
        });

        // XP + Rank
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.fillText(`+${xp} XP`, 30, H - 50);

        if (rank) {
            ctx.fillStyle = '#a78bfa';
            ctx.font = '18px system-ui, sans-serif';
            ctx.fillText(`Rank: ${rank}`, 30, H - 25);
        }

        // Watermark
        ctx.fillStyle = '#475569';
        ctx.font = '12px system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText('FitTrack India 🇮🇳', W - 20, H - 15);

        // Convert to blob and share
        return new Promise((resolve) => {
            canvas.toBlob(async (blob) => {
                if (!blob) return resolve(false);

                if (navigator.share) {
                    try {
                        const file = new File([blob], 'workout-share.png', { type: 'image/png' });
                        await navigator.share({
                            title: 'My Workout',
                            text: `${title} — ${xp} XP earned!`,
                            files: [file],
                        });
                        resolve(true);
                    } catch {
                        // User cancelled or share failed, fall back to download
                        downloadBlob(blob);
                        resolve(false);
                    }
                } else {
                    downloadBlob(blob);
                    resolve(false);
                }
            }, 'image/png');
        });
    }, []);

    return { share };
}

function downloadBlob(blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'workout-share.png';
    a.click();
    URL.revokeObjectURL(url);
}
