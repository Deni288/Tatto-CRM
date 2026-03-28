import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { env } from '../config/env';
import prisma from '../config/db';
import { getAuthUrl, exchangeCodeForTokens, encryptToken } from '../services/calendar.service';

const OAuthStateSchema = z.object({
    userId: z.string().uuid(),
    nonce: z.string(),
});

type OAuthState = z.infer<typeof OAuthStateSchema>;

const CallbackQuerySchema = z.object({
    code: z.string().min(1).max(512),
    state: z.string().min(1).max(2048),
    error: z.string().optional(),
});

export const initiateOAuth = async (req: Request, res: Response): Promise<void> => {
    if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
        res.status(503).json({ error: 'Google Calendar integration is not configured' });
        return;
    }

    const userId = req.user!.userId;
    const nonce = crypto.randomUUID();
    const state = jwt.sign({ userId, nonce } satisfies OAuthState, env.JWT_SECRET, { expiresIn: '10m' });
    const url = getAuthUrl(state);
    res.json({ url });
};

// NOTE: try/catch is necessary here because this handler does HTTP redirects,
// not JSON responses. Express 5 centralized error handler would return JSON 500
// instead of redirecting to /profile?gcal=error.
export const handleCallback = async (req: Request, res: Response): Promise<void> => {
    const queryResult = CallbackQuerySchema.safeParse(req.query);
    if (!queryResult.success || queryResult.data.error) {
        res.redirect(`${env.FRONTEND_URL}/dashboard/profile?gcal=error`);
        return;
    }
    const { code, state } = queryResult.data;

    let payload: OAuthState;
    try {
        const raw = jwt.verify(state, env.JWT_SECRET);
        const parsed = OAuthStateSchema.safeParse(raw);
        if (!parsed.success) {
            res.redirect(`${env.FRONTEND_URL}/dashboard/profile?gcal=error`);
            return;
        }
        payload = parsed.data;
    } catch {
        res.redirect(`${env.FRONTEND_URL}/dashboard/profile?gcal=error`);
        return;
    }

    try {
        const refreshToken = await exchangeCodeForTokens(code);
        const encrypted = encryptToken(refreshToken);

        await prisma.user.update({
            where: { id: payload.userId },
            data: {
                googleRefreshToken: encrypted,
                googleCalendarId: 'primary',
                googleConnectedAt: new Date(),
            },
            select: { id: true },
        });

        res.redirect(`${env.FRONTEND_URL}/dashboard/profile?gcal=connected`);
    } catch (err: unknown) {
        console.error('[Calendar] OAuth callback error:', err instanceof Error ? err.message : err);
        res.redirect(`${env.FRONTEND_URL}/dashboard/profile?gcal=error`);
    }
};

export const getStatus = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            googleCalendarId: true,
            googleConnectedAt: true,
        },
    });

    res.json({
        connected: !!user?.googleConnectedAt,
        calendarId: user?.googleCalendarId ?? null,
        connectedAt: user?.googleConnectedAt ?? null,
    });
};

export const disconnect = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user!.userId;

    await prisma.user.update({
        where: { id: userId },
        data: {
            googleRefreshToken: null,
            googleCalendarId: null,
            googleConnectedAt: null,
        },
        select: { id: true },
    });

    res.json({ success: true });
};
