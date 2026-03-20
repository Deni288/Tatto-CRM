import Stripe from 'stripe';
import { env } from '../config/env';
import type { SubscriptionStatus } from '@prisma/client';

export const stripe = new Stripe(env.STRIPE_SECRET_KEY);

/**
 * Single source of truth — koristi se i u backend middlewareu i kao osnova za frontend gate.
 * PAST_DUE dobiva grace period do currentPeriodEnd (Stripe retry-a plaćanje).
 */
export const isUserActive = (
    subscriptionStatus: SubscriptionStatus,
    trialEndsAt: Date | null,
    currentPeriodEnd: Date | null,
): boolean => {
    const now = new Date();

    switch (subscriptionStatus) {
        case 'ACTIVE':
            return true;
        case 'TRIAL':
            return trialEndsAt !== null && trialEndsAt > now;
        case 'PAST_DUE':
            return currentPeriodEnd !== null && currentPeriodEnd > now;
        case 'CANCELLED':
        case 'EXPIRED':
        default:
            return false;
    }
};

export const createCheckoutSession = async (
    userId: string,
    userEmail: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
): Promise<string> => {
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer_email: userEmail,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId },
        subscription_data: {
            metadata: { userId },
        },
    });

    if (!session.url) throw new Error('Stripe session URL missing');
    return session.url;
};

export const createPortalSession = async (
    stripeCustomerId: string,
    returnUrl: string,
): Promise<string> => {
    const session = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: returnUrl,
    });
    return session.url;
};
