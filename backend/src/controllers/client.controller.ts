import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import { clientSchema } from '../schemas/client.schema';

const idParamSchema = z.object({ id: z.uuid() });

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Fields returned in list view — no tattooHistory/customFields (heavy, not needed for list)
const clientListSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    createdAt: true,
} as const;

// Fields returned in detail view — includes relations
const clientDetailSelect = {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    phone: true,
    tattooHistory: true,
    customFields: true,
    createdAt: true,
    appointments: {
        select: {
            id: true,
            title: true,
            status: true,
            startTime: true,
            depositAmount: true,
            depositPaid: true,
            price: true,
        },
        orderBy: { startTime: 'desc' as const },
    },
    consentForms: {
        select: {
            id: true,
            agreedToTerms: true,
            createdAt: true,
        },
    },
    images: {
        select: {
            id: true,
            imageUrl: true,
            type: true,
            createdAt: true,
        },
    },
} as const;

export const getClients = async (req: Request, res: Response): Promise<void> => {
    const artistId = req.user!.userId;

    const parsed = paginationSchema.safeParse(req.query);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid pagination params' });
        return;
    }
    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    const where = { artistId, isActive: true };

    const [clients, total] = await Promise.all([
        prisma.client.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: clientListSelect,
            skip,
            take: limit,
        }),
        prisma.client.count({ where }),
    ]);

    res.json({
        data: clients,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
};

export const getClientById = async (req: Request, res: Response): Promise<void> => {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        res.status(400).json({ error: 'Invalid client ID' });
        return;
    }
    const { id } = paramsParsed.data;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({
        where: { id, artistId, isActive: true },
        select: clientDetailSelect,
    });

    if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    res.json(client);
};

export const createClient = async (req: Request, res: Response): Promise<void> => {
    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const artistId = req.user!.userId;

    const client = await prisma.client.create({
        data: {
            ...parsed.data,
            artistId,
            email: parsed.data.email || null,
            phone: parsed.data.phone || null,
            tattooHistory: parsed.data.tattooHistory || null,
        },
        select: clientListSelect,
    });

    res.status(201).json(client);
};

export const updateClient = async (req: Request, res: Response): Promise<void> => {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        res.status(400).json({ error: 'Invalid client ID' });
        return;
    }
    const { id } = paramsParsed.data;
    const artistId = req.user!.userId;

    const bodyParsed = clientSchema.safeParse(req.body);
    if (!bodyParsed.success) {
        res.status(400).json({ error: 'Invalid input', details: bodyParsed.error.issues });
        return;
    }

    const existing = await prisma.client.findFirst({
        where: { id, artistId },
        select: { id: true },
    });
    if (!existing) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    const client = await prisma.client.update({
        where: { id },
        data: {
            ...bodyParsed.data,
            email: bodyParsed.data.email || null,
            phone: bodyParsed.data.phone || null,
            tattooHistory: bodyParsed.data.tattooHistory || null,
        },
        select: clientDetailSelect,
    });

    res.json(client);
};

export const deleteClient = async (req: Request, res: Response): Promise<void> => {
    const paramsParsed = idParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
        res.status(400).json({ error: 'Invalid client ID' });
        return;
    }
    const { id } = paramsParsed.data;
    const artistId = req.user!.userId;

    const existing = await prisma.client.findFirst({
        where: { id, artistId, isActive: true },
        select: { id: true },
    });
    if (!existing) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    await prisma.client.update({
        where: { id },
        data: { isActive: false },
    });

    res.status(200).json({ message: 'Client deactivated successfully' });
};
