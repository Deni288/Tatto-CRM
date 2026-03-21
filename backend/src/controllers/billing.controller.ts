import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { env } from '../config/env';
import { createCheckoutSession, createPortalSession, isUserActive } from '../services/billing.service';

const FRONTEND_URL = env.FRONTEND_URL;

export const getBillingStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            subscriptionStatus: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
            stripeCustomerId: true,
        },
    });

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    res.json({
        subscriptionStatus: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        currentPeriodEnd: user.currentPeriodEnd,
        isActive: isUserActive(user.subscriptionStatus, user.trialEndsAt, user.currentPeriodEnd),
        hasCustomer: Boolean(user.stripeCustomerId),
    });
};

export const createCheckout = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const parsed = z.object({ plan: z.enum(['monthly', 'yearly']) }).safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid plan. Use "monthly" or "yearly"' });
        return;
    }

    const priceId = parsed.data.plan === 'monthly' ? env.STRIPE_MONTHLY_PRICE_ID : env.STRIPE_YEARLY_PRICE_ID;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
    });

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const url = await createCheckoutSession(
        userId,
        user.email,
        priceId,
        `${FRONTEND_URL}/billing?success=true`,
        `${FRONTEND_URL}/billing?cancelled=true`,
    );

    res.json({ url });
};

export const createPortal = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { stripeCustomerId: true },
    });

    if (!user?.stripeCustomerId) {
        res.status(400).json({ error: 'No active subscription found' });
        return;
    }

    const url = await createPortalSession(user.stripeCustomerId, `${FRONTEND_URL}/billing`);
    res.json({ url });
};
