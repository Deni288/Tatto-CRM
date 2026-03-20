import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { bookingRequestSchema, bookingRequestStatusSchema } from '@tattoocrm/shared';
import { sendBookingConfirmation, sendNewBookingAlert } from '../services/email.service';
import { sendPushToArtist } from '../services/push.service';

const idParamSchema = z.object({ id: z.uuid() });
const artistIdParamSchema = z.object({ artistId: z.uuid() });

// Public — no auth required. artistId comes from URL param.
export const createBookingRequest = async (req: Request, res: Response): Promise<void> => {
    const paramsParsed = artistIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        res.status(400).json({ error: 'Invalid artist ID' });
        return;
    }
    const { artistId } = paramsParsed.data;

    const artist = await prisma.user.findUnique({
        where: { id: artistId },
        select: { id: true, name: true, email: true },
    });
    if (!artist) {
        res.status(404).json({ error: 'Artist not found' });
        return;
    }

    const bodyParsed = bookingRequestSchema.safeParse(req.body);
    if (!bodyParsed.success) {
        res.status(400).json({ error: 'Invalid input', details: bodyParsed.error.issues });
        return;
    }

    const bookingRequest = await prisma.bookingRequest.create({
        data: {
            artistId,
            ...bodyParsed.data,
            referenceLink: bodyParsed.data.referenceLink || null,
        },
        select: {
            id: true,
            name: true,
            status: true,
            createdAt: true,
        },
    });

    // Fire-and-forget emails — ne blokiramo response ako email fail
    const { name, email, tattooIdea, preferredMonth } = bodyParsed.data;
    void Promise.all([
        sendBookingConfirmation({
            to: email,
            clientName: name,
            artistName: artist.name,
            tattooIdea,
            preferredMonth,
        }),
        sendNewBookingAlert({
            to: artist.email,
            artistName: artist.name,
            clientName: name,
            clientEmail: email,
            clientPhone: bodyParsed.data.phone,
            tattooIdea,
            preferredMonth,
        }),
        sendPushToArtist(artistId, {
            title: 'Novi booking request!',
            body: `${name} — ${tattooIdea.substring(0, 60)}${tattooIdea.length > 60 ? '...' : ''}`,
            url: '/booking-requests',
        }),
    ]).catch((err: unknown) => {
        console.error('[Notification] Failed:', err instanceof Error ? err.message : err);
    });

    res.status(201).json(bookingRequest);
};

// Protected — returns only requests belonging to the logged-in artist
export const getBookingRequests = async (req: Request, res: Response): Promise<void> => {
    const artistId = req.user!.userId;

    const bookingRequests = await prisma.bookingRequest.findMany({
        where: { artistId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            tattooIdea: true,
            referenceLink: true,
            preferredMonth: true,
            status: true,
            createdAt: true,
        },
    });

    res.json(bookingRequests);
};

// Protected — requires auth + ownership check
export const updateBookingRequestStatus = async (req: Request, res: Response): Promise<void> => {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        res.status(400).json({ error: 'Invalid request ID' });
        return;
    }
    const { id } = paramsParsed.data;
    const artistId = req.user!.userId;

    const bodyParsed = bookingRequestStatusSchema.safeParse(req.body);
    if (!bodyParsed.success) {
        res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED.' });
        return;
    }

    const existing = await prisma.bookingRequest.findUnique({
        where: { id },
        select: { id: true, artistId: true },
    });

    if (!existing) {
        res.status(404).json({ error: 'Booking request not found' });
        return;
    }
    if (existing.artistId !== artistId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    const updated = await prisma.bookingRequest.update({
        where: { id },
        data: { status: bodyParsed.data.status },
        select: {
            id: true,
            status: true,
            updatedAt: true,
        },
    });

    res.json(updated);
};

// Protected — converts a booking request into a Client
export const convertRequestToClient = async (req: Request, res: Response): Promise<void> => {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        res.status(400).json({ error: 'Invalid request ID' });
        return;
    }
    const { id } = paramsParsed.data;
    const artistId = req.user!.userId;

    const bookingRequest = await prisma.bookingRequest.findUnique({
        where: { id },
        select: {
            id: true,
            artistId: true,
            name: true,
            email: true,
            phone: true,
            tattooIdea: true,
        },
    });

    if (!bookingRequest) {
        res.status(404).json({ error: 'Booking request not found' });
        return;
    }
    if (bookingRequest.artistId !== artistId) {
        res.status(403).json({ error: 'Forbidden' });
        return;
    }

    const nameParts = bookingRequest.name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    const client = await prisma.client.create({
        data: {
            artistId,
            firstName,
            lastName,
            email: bookingRequest.email,
            phone: bookingRequest.phone,
            tattooHistory: bookingRequest.tattooIdea,
        },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
        },
    });

    await prisma.bookingRequest.update({
        where: { id },
        data: { status: 'APPROVED' },
    });

    res.status(201).json(client);
};
