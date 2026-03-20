import webPush from 'web-push';
import { env } from '../config/env';
import prisma from '../config/db';

webPush.setVapidDetails(
    env.VAPID_CONTACT_EMAIL,
    env.VAPID_PUBLIC_KEY,
    env.VAPID_PRIVATE_KEY,
);

export interface PushPayload {
    title: string;
    body: string;
    url: string;
}

export const sendPushToArtist = async (artistId: string, payload: PushPayload): Promise<void> => {
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: artistId },
        select: { id: true, endpoint: true, p256dh: true, auth: true },
    });

    if (subscriptions.length === 0) return;

    const results = await Promise.allSettled(
        subscriptions.map((sub) =>
            webPush.sendNotification(
                { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
                JSON.stringify(payload),
            ).catch(async (err: unknown) => {
                // 410 Gone — subscription više nije valjana, briši iz baze
                if (err instanceof webPush.WebPushError && err.statusCode === 410) {
                    await prisma.pushSubscription.delete({ where: { id: sub.id } });
                }
                throw err;
            }),
        ),
    );

    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed > 0) {
        console.error(`[Push] ${failed}/${subscriptions.length} notifications failed`);
    }
};
