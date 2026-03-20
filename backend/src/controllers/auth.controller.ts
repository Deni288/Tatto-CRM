import { randomUUID } from 'crypto';
import type { Request, Response, CookieOptions } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import prisma from '../config/db';
import { env } from '../config/env';
import { RegisterSchema, LoginSchema } from '@tattoocrm/shared';
import { sendVerificationEmail } from '../services/email.service';

interface TokenPayload {
    userId: string;
    role: string;
}

const REFRESH_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
};

const generateTokens = (userId: string, role: string): { accessToken: string; refreshToken: string } => {
    const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, role }, env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const { email, password, name } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const emailVerificationToken = randomUUID();
    const emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.create({
        data: {
            email,
            passwordHash,
            name,
            role: 'ARTIST',
            trialEndsAt,
            isEmailVerified: false,
            emailVerificationToken,
            emailVerificationTokenExpiresAt,
        },
        select: { id: true },
    });

    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
    await sendVerificationEmail({ to: email, name, verificationUrl });

    res.status(201).json({ message: 'Account created. Please check your email to confirm your account.' });
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
    const parsed = z.object({ token: z.string().uuid() }).safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid token' });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { emailVerificationToken: parsed.data.token },
        select: { id: true, role: true, email: true, name: true, emailVerificationTokenExpiresAt: true, isEmailVerified: true },
    });

    if (!user) {
        res.status(400).json({ error: 'Invalid or expired verification link.' });
        return;
    }

    if (user.isEmailVerified) {
        res.status(400).json({ error: 'Email already verified. Please log in.' });
        return;
    }

    if (!user.emailVerificationTokenExpiresAt || user.emailVerificationTokenExpiresAt < new Date()) {
        res.status(400).json({ error: 'Verification link has expired. Please register again.' });
        return;
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationTokenExpiresAt: null,
        },
    });

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
        token: accessToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
};

export const login = async (req: Request, res: Response): Promise<void> => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const { email, password } = parsed.data;

    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, name: true, role: true, isActive: true, isEmailVerified: true, passwordHash: true },
    });
    if (!user || !user.isActive) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
    }

    if (!user.isEmailVerified) {
        res.status(403).json({ error: 'Please verify your email before logging in.', code: 'EMAIL_NOT_VERIFIED' });
        return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({
        token: accessToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
        res.status(401).json({ error: 'No refresh token' });
        return;
    }

    let payload: TokenPayload;
    try {
        payload = jwt.verify(token, env.REFRESH_TOKEN_SECRET) as TokenPayload;
    } catch {
        res.clearCookie('refreshToken', { path: '/' });
        res.status(401).json({ error: 'Invalid or expired refresh token' });
        return;
    }

    const user = await prisma.user.findFirst({
        where: { id: payload.userId, isActive: true },
        select: { id: true, role: true },
    });
    if (!user) {
        res.clearCookie('refreshToken', { path: '/' });
        res.status(401).json({ error: 'User not found or inactive' });
        return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.role);
    res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);

    res.json({ token: accessToken });
};

export const logout = (_req: Request, res: Response): void => {
    res.clearCookie('refreshToken', { path: '/' });
    res.json({ message: 'Logged out' });
};
