/**
 * useOfflineSync — Queues failed API calls in localStorage and auto-retries
 * Critical for Indian users on unreliable 4G connections
 */

import { useState, useEffect, useCallback, useRef } from 'react';

const QUEUE_KEY = 'fittrack_offline_queue';
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000; // 5 seconds

function getQueue() {
    try {
        return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    } catch {
        return [];
    }
}

function saveQueue(queue) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export default function useOfflineSync(apiInstance) {
    const [pendingCount, setPendingCount] = useState(() => getQueue().length);
    const [syncing, setSyncing] = useState(false);
    const timerRef = useRef(null);

    // Add a failed request to the queue
    const enqueue = useCallback((method, url, data) => {
        const queue = getQueue();
        queue.push({
            id: Date.now() + Math.random().toString(36).slice(2),
            method,
            url,
            data,
            retries: 0,
            createdAt: new Date().toISOString(),
        });
        saveQueue(queue);
        setPendingCount(queue.length);
    }, []);

    // Process the queue
    const processQueue = useCallback(async () => {
        if (!apiInstance || syncing) return;

        const queue = getQueue();
        if (queue.length === 0) return;

        setSyncing(true);
        const remaining = [];

        for (const item of queue) {
            try {
                await apiInstance({
                    method: item.method,
                    url: item.url,
                    data: item.data,
                });
                // Success — don't add back to remaining
            } catch (err) {
                if (item.retries < MAX_RETRIES) {
                    remaining.push({ ...item, retries: item.retries + 1 });
                }
                // If max retries exceeded, silently drop
            }
        }

        saveQueue(remaining);
        setPendingCount(remaining.length);
        setSyncing(false);
    }, [apiInstance, syncing]);

    // Auto-sync when coming back online
    useEffect(() => {
        const handleOnline = () => {
            // Small delay to let connection stabilize
            setTimeout(processQueue, 1000);
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [processQueue]);

    // Periodic retry every 30 seconds if items in queue
    useEffect(() => {
        if (pendingCount > 0) {
            timerRef.current = setInterval(processQueue, 30000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [pendingCount, processQueue]);

    // Try to process on mount
    useEffect(() => {
        if (navigator.onLine && getQueue().length > 0) {
            processQueue();
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Wrap an API call with offline fallback
    const withOffline = useCallback((method, url, data) => {
        return async () => {
            try {
                const res = await apiInstance({ method, url, data });
                return res;
            } catch (err) {
                if (!navigator.onLine || err?.code === 'ERR_NETWORK') {
                    enqueue(method, url, data);
                    return { data: { offline: true, queued: true } };
                }
                throw err;
            }
        };
    }, [apiInstance, enqueue]);

    return {
        pendingCount,
        syncing,
        enqueue,
        processQueue,
        withOffline,
    };
}
