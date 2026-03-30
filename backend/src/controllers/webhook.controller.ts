import type { Request, Response } from 'express';
import type Stripe from 'stripe';
import { z } from 'zod';
import { stripe } from '../services/billing.service';
import { env } from '../config/env';
import prisma from '../config/db';

export const handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'];
    if (!sig || typeof sig !== 'string') {
        res.status(400).json({ error: 'Missing stripe-signature header' });
        return;
    }

    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(req.body as Buffer, sig, env.STRIPE_WEBHOOK_SECRET);
    } catch {
        res.status(400).json({ error: 'Webhook signature verification failed' });
        return;
    }

    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
        }
        case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            await handleInvoicePaid(invoice);
            break;
        }
        case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            await handleInvoicePaymentFailed(invoice);
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionDeleted(subscription);
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            await handleSubscriptionUpdated(subscription);
            break;
        }
        default:
            break;
    }

    res.json({ received: true });
};

// Stripe v20: current_period_end je na SubscriptionItem, ne na Subscription
const getSubscriptionPeriodEnd = (subscription: Stripe.Subscription): Date | null => {
    const item = subscription.items.data[0];
    if (!item?.current_period_end) return null;
    return new Date(item.current_period_end * 1000);
};

// Stripe v20: subscription ID na invoicu je u parent.subscription_details.subscription
const getInvoiceSubscriptionId = (invoice: Stripe.Invoice): string | null => {
    const sub = invoice.parent?.subscription_details?.subscription;
    if (!sub) return null;
    return typeof sub === 'string' ? sub : sub.id;
};

const metadataSchema = z.object({ userId: z.string().uuid() });

const handleCheckoutCompleted = async (session: Stripe.Checkout.Session): Promise<void> => {
    const meta = metadataSchema.safeParse(session.metadata);
    if (!meta.success || !session.customer || !session.subscription) return;
    const { userId } = meta.data;
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
    const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);

    const priceId = subscription.items.data[0]?.price.id;
    const plan = priceId === env.STRIPE_MONTHLY_PRICE_ID ? 'monthly'
        : priceId === env.STRIPE_YEARLY_PRICE_ID ? 'yearly'
        : null;

    await prisma.user.update({
        where: { id: userId },
        data: {
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStatus: 'ACTIVE',
            currentPeriodEnd,
            ...(plan !== null && { plan }),
        },
        select: { id: true },
    });
};

const handleInvoicePaid = async (invoice: Stripe.Invoice): Promise<void> => {
    const subscriptionId = getInvoiceSubscriptionId(invoice);
    if (!subscriptionId) return;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);

    await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: { subscriptionStatus: 'ACTIVE', currentPeriodEnd },
    });
};

const handleInvoicePaymentFailed = async (invoice: Stripe.Invoice): Promise<void> => {
    const subscriptionId = getInvoiceSubscriptionId(invoice);
    if (!subscriptionId) return;

    await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscriptionId },
        data: { subscriptionStatus: 'PAST_DUE' },
    });
};

const handleSubscriptionDeleted = async (subscription: Stripe.Subscription): Promise<void> => {
    await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { subscriptionStatus: 'CANCELLED' },
    });
};

const handleSubscriptionUpdated = async (subscription: Stripe.Subscription): Promise<void> => {
    const currentPeriodEnd = getSubscriptionPeriodEnd(subscription);
    await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { currentPeriodEnd },
    });
};
