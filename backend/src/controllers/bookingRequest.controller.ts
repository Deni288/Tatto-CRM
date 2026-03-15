import { Request, Response } from 'express';
import prisma from '../config/db';
import { bookingRequestSchema, bookingRequestStatusSchema } from '../schemas/bookingRequest.schema';

// Public — no auth required
export const createBookingRequest = async (req: Request, res: Response) => {
    const parsed = bookingRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    try {
        const bookingRequest = await prisma.bookingRequest.create({
            data: {
                ...parsed.data,
                referenceLink: parsed.data.referenceLink || null,
            },
        });

        res.status(201).json(bookingRequest);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to submit booking request', details: error.message });
    }
};

// Protected — requires auth
export const getBookingRequests = async (req: Request, res: Response) => {
    try {
        const bookingRequests = await prisma.bookingRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });

        res.json(bookingRequests);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch booking requests', details: error.message });
    }
};

// Protected — requires auth
export const updateBookingRequestStatus = async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const parsed = bookingRequestStatusSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid status. Must be APPROVED or REJECTED.' });
        return;
    }

    try {
        const existing = await prisma.bookingRequest.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ error: 'Booking request not found' });
            return;
        }

        const updated = await prisma.bookingRequest.update({
            where: { id },
            data: { status: parsed.data.status },
        });

        res.json(updated);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update booking request status', details: error.message });
    }
};

// Protected — converts a booking request into a Client
export const convertRequestToClient = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const artistId = req.user!.userId;

    try {
        const bookingRequest = await prisma.bookingRequest.findUnique({ where: { id } });
        if (!bookingRequest) {
            res.status(404).json({ error: 'Booking request not found' });
            return;
        }

        // Split name into firstName / lastName
        const nameParts = bookingRequest.name.trim().split(/\s+/);
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create Client from booking request data
        const client = await prisma.client.create({
            data: {
                artistId,
                firstName,
                lastName,
                email: bookingRequest.email,
                phone: bookingRequest.phone,
                tattooHistory: bookingRequest.tattooIdea,
            },
        });

        // Mark the booking request as approved
        await prisma.bookingRequest.update({
            where: { id },
            data: { status: 'APPROVED' },
        });

        res.status(201).json(client);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to convert request to client', details: error.message });
    }
};
