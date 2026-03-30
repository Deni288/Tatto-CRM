import { z } from 'zod';

export const artistIdParamSchema = z.object({
    id: z.string().uuid({ message: 'Invalid artist ID' }),
});

const subscriptionStatusSchema = z.enum(['TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED']);

export const adminArtistSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    isActive: z.boolean(),
    subscriptionStatus: subscriptionStatusSchema,
    plan: z.string().nullable(),
    trialEndsAt: z.string().datetime().nullable(),
    currentPeriodEnd: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
});

export type AdminArtist = z.infer<typeof adminArtistSchema>;

export const adminStatsSchema = z.object({
    overview: z.object({
        totalArtists: z.number(),
        activeArtists: z.number(),
        trialArtists: z.number(),
        pastDueArtists: z.number(),
        cancelledArtists: z.number(),
    }),
    mrr: z.object({
        estimatedMonthly: z.number(),
        currency: z.literal('EUR'),
    }),
    trial: z.object({
        endingSoon: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
            trialEndsAt: z.string().datetime(),
            daysRemaining: z.number(),
        })),
        expiredNotConverted: z.array(z.object({
            id: z.string().uuid(),
            name: z.string(),
            email: z.string().email(),
            trialEndsAt: z.string().datetime(),
            daysSinceExpiry: z.number(),
        })),
    }),
    churnRisk: z.array(z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email(),
        subscriptionStatus: subscriptionStatusSchema,
        currentPeriodEnd: z.string().datetime().nullable(),
    })),
    recentRegistrations: z.array(z.object({
        id: z.string().uuid(),
        name: z.string(),
        email: z.string().email(),
        subscriptionStatus: subscriptionStatusSchema,
        trialEndsAt: z.string().datetime().nullable(),
        createdAt: z.string().datetime(),
    })),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;
