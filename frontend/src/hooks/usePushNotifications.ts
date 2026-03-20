import { useState, useEffect } from 'react';
import { getVapidPublicKey, savePushSubscription, deletePushSubscription } from '../api/push.api';

const isSupported = (): boolean =>
    'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const arr = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; i++) arr[i] = rawData.charCodeAt(i);
    return arr.buffer;
};

interface UsePushNotifications {
    isSupported: boolean;
    permission: NotificationPermission;
    isSubscribed: boolean;
    isLoading: boolean;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
}

export const usePushNotifications = (): UsePushNotifications => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const supported = isSupported();

    useEffect(() => {
        if (!supported) {
            setIsLoading(false);
            return;
        }

        setPermission(Notification.permission);

        const checkSubscription = async (): Promise<void> => {
            const reg = await navigator.serviceWorker.register('/sw.js');
            const sub = await reg.pushManager.getSubscription();
            setIsSubscribed(Boolean(sub));
            setIsLoading(false);
        };

        void checkSubscription();
    }, [supported]);

    const subscribe = async (): Promise<void> => {
        if (!supported) return;
        setIsLoading(true);
        try {
            const perm = await Notification.requestPermission();
            setPermission(perm);
            if (perm !== 'granted') return;

            const publicKey = await getVapidPublicKey();
            const reg = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(publicKey),
            });

            await savePushSubscription(sub);
            setIsSubscribed(true);
        } catch (err: unknown) {
            console.error('[Push] Subscribe failed:', err instanceof Error ? err.message : err);
        } finally {
            setIsLoading(false);
        }
    };

    const unsubscribe = async (): Promise<void> => {
        if (!supported) return;
        setIsLoading(true);
        try {
            const reg = await navigator.serviceWorker.getRegistration('/sw.js');
            const sub = await reg?.pushManager.getSubscription();
            if (sub) {
                await deletePushSubscription(sub.endpoint);
                await sub.unsubscribe();
            }
            setIsSubscribed(false);
        } catch (err: unknown) {
            console.error('[Push] Unsubscribe failed:', err instanceof Error ? err.message : err);
        } finally {
            setIsLoading(false);
        }
    };

    return { isSupported: supported, permission, isSubscribed, isLoading, subscribe, unsubscribe };
};
