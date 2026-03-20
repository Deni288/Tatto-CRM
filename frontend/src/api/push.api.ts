import { api } from './axiosInstance';

export const getVapidPublicKey = async (): Promise<string> => {
    const res = await api.get<{ publicKey: string }>('/push/vapid-public-key');
    return res.data.publicKey;
};

export const savePushSubscription = async (subscription: PushSubscription): Promise<void> => {
    const json = subscription.toJSON();
    await api.post('/push/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
            p256dh: json.keys?.p256dh,
            auth: json.keys?.auth,
        },
    });
};

export const deletePushSubscription = async (endpoint: string): Promise<void> => {
    await api.delete('/push/subscribe', { data: { endpoint } });
};
