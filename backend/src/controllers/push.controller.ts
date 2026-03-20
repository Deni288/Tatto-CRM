import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { env } from '../config/env';

const SubscribeSchema = z.object({
    endpoint: z.string().url(),
    keys: z.object({
        p256dh: z.string().min(1),
        auth: z.string().min(1),
    }),
});

export const getVapidPublicKey = (_req: Request, res: Response): void => {
    res.json({ publicKey: env.VAPID_PUBLIC_KEY });
};

export const subscribe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const parsed = SubscribeSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid subscription data', details: parsed.error.issues });
        return;
    }

    const { endpoint, keys } = parsed.data;

    await prisma.pushSubscription.upsert({
        where: { endpoint },
        update: { p256dh: keys.p256dh, auth: keys.auth, userId },
        create: { userId, endpoint, p256dh: keys.p256dh, auth: keys.auth },
    });

    res.status(201).json({ message: 'Subscribed' });
};

export const unsubscribe = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const { endpoint } = req.body as { endpoint: unknown };
    if (typeof endpoint !== 'string') {
        res.status(400).json({ error: 'endpoint is required' });
        return;
    }

    await prisma.pushSubscription.deleteMany({
        where: { endpoint, userId },
    });

    res.json({ message: 'Unsubscribed' });
};
