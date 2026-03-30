import { Request, Response } from 'express';
import prisma from '../config/db';
import { artistIdParamSchema } from '../schemas/admin.schema';

const MONTHLY_PRICE = 22;
const YEARLY_PRICE = 18;
const UNKNOWN_PRICE = 20; // avg estimate when plan not stored

export const getArtists = async (_req: Request, res: Response): Promise<void> => {
    const artists = await prisma.user.findMany({
        where: { role: 'ARTIST' },
        select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            subscriptionStatus: true,
            plan: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    res.json({ data: artists });
};

export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
    const artists = await prisma.user.findMany({
        where: { role: 'ARTIST' },
        select: {
            id: true,
            name: true,
            email: true,
            subscriptionStatus: true,
            plan: true,
            trialEndsAt: true,
            currentPeriodEnd: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const activeArtists = artists.filter((a) => a.subscriptionStatus === 'ACTIVE');
    const trialArtists = artists.filter((a) => a.subscriptionStatus === 'TRIAL');

    // MRR estimation
    const estimatedMonthly =
        activeArtists.filter((a) => a.plan === 'monthly').length * MONTHLY_PRICE +
        activeArtists.filter((a) => a.plan === 'yearly').length * YEARLY_PRICE +
        activeArtists.filter((a) => !a.plan).length * UNKNOWN_PRICE;

    // Trial ending within 7 days
    const endingSoon = trialArtists
        .filter((a) => a.trialEndsAt && a.trialEndsAt > now && a.trialEndsAt <= sevenDaysFromNow)
        .map((a) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            trialEndsAt: a.trialEndsAt!.toISOString(),
            daysRemaining: Math.ceil((a.trialEndsAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        }));

    // Trial expired, not converted
    const expiredNotConverted = trialArtists
        .filter((a) => a.trialEndsAt && a.trialEndsAt < now)
        .map((a) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            trialEndsAt: a.trialEndsAt!.toISOString(),
            daysSinceExpiry: Math.floor((now.getTime() - a.trialEndsAt!.getTime()) / (1000 * 60 * 60 * 24)),
        }));

    // Churn risk: PAST_DUE
    const churnRisk = artists
        .filter((a) => a.subscriptionStatus === 'PAST_DUE')
        .map((a) => ({
            id: a.id,
            name: a.name,
            email: a.email,
            subscriptionStatus: a.subscriptionStatus,
            currentPeriodEnd: a.currentPeriodEnd?.toISOString() ?? null,
        }));

    // Recent 10 registrations
    const recentRegistrations = artists.slice(0, 10).map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        subscriptionStatus: a.subscriptionStatus,
        trialEndsAt: a.trialEndsAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
    }));

    res.json({
        data: {
            overview: {
                totalArtists: artists.length,
                activeArtists: activeArtists.length,
                trialArtists: trialArtists.length,
                pastDueArtists: artists.filter((a) => a.subscriptionStatus === 'PAST_DUE').length,
                cancelledArtists: artists.filter(
                    (a) => a.subscriptionStatus === 'CANCELLED' || a.subscriptionStatus === 'EXPIRED',
                ).length,
            },
            mrr: {
                estimatedMonthly,
                currency: 'EUR',
            },
            trial: { endingSoon, expiredNotConverted },
            churnRisk,
            recentRegistrations,
        },
    });
};

export const toggleArtist = async (req: Request, res: Response): Promise<void> => {
    const parsed = artistIdParamSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid artist ID', details: parsed.error.issues });
        return;
    }

    const { id } = parsed.data;

    const artist = await prisma.user.findUnique({
        where: { id },
        select: { id: true, isActive: true, role: true },
    });

    if (!artist || artist.role !== 'ARTIST') {
        res.status(404).json({ error: 'Artist not found' });
        return;
    }

    const updated = await prisma.user.update({
        where: { id },
        data: { isActive: !artist.isActive },
        select: { id: true, isActive: true },
    });

    res.json({ data: updated });
};
