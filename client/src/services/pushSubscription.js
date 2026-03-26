/**
 * Client-side Push Subscription
 * Subscribes the browser to receive push notifications and sends
 * the subscription to the backend.
 */

export async function subscribeToPush() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;

    try {
        const registration = await navigator.serviceWorker.ready;

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        if (subscription) return subscription;

        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidKey) return null;

        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: vapidKey,
        });

        // Send subscription to backend
        const { default: api } = await import('./api');
        await api.post('/users/push-subscribe', subscription.toJSON());

        return subscription;
    } catch (err) {
        console.warn('Push subscription failed:', err);
        return null;
    }
}

export async function unsubscribeFromPush() {
    if (!('serviceWorker' in navigator)) return;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
            await subscription.unsubscribe();
        }
    } catch (err) {
        console.warn('Push unsubscribe failed:', err);
    }
}
