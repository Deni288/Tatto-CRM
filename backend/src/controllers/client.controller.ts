import { Request, Response } from 'express';
import prisma from '../config/db';
import { clientSchema } from '../schemas/client.schema';

export const getClients = async (req: Request, res: Response) => {
    console.log("=> [API] getClients Invoked");
    const artistId = req.user!.userId;
    try {
        const clients = await prisma.client.findMany({
            where: { artistId, isActive: true },
            orderBy: { createdAt: 'desc' },
        });
        res.json(clients);
    } catch (err) {
        console.error("=> [API] getClients Prisma Error:", err);
        throw err;
    }
};

export const getClientById = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({
        where: { id, artistId, isActive: true },
        include: {
            appointments: true,
            consentForms: true,
            images: true,
        }
    });

    if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    res.json(client);
};

export const createClient = async (req: Request, res: Response) => {
    console.log("=> [API] Incoming Create Client:", req.body);
    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
        console.error("=> [API] Zod Validation Error:", parsed.error.issues);
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    try {
        const artistId = req.user!.userId;
        const client = await prisma.client.create({
            data: {
                ...parsed.data,
                artistId,
                email: parsed.data.email || null,
                phone: parsed.data.phone || null,
                tattooHistory: parsed.data.tattooHistory || null,
            },
        });
        console.log("=> [API] Client created successfully:", client.id);
        res.status(201).json(client);
    } catch (err) {
        console.error("=> [API] Prisma Error:", err);
        throw err;
    }
};

export const updateClient = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const artistId = req.user!.userId;

    const parsed = clientSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    // Verify ownership
    const existing = await prisma.client.findFirst({ where: { id, artistId } });
    if (!existing) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    const client = await prisma.client.update({
        where: { id },
        data: {
            ...parsed.data,
            email: parsed.data.email || null,
            phone: parsed.data.phone || null,
            tattooHistory: parsed.data.tattooHistory || null,
        },
    });

    res.json(client);
};

export const deleteClient = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const artistId = req.user!.userId;

    // 👇 OVO JE NAŠA ZAMKA 👇
    console.log("🚨 ALARM: SOFT DELETE FUNKCIJA JE POKRENUTA ZA KLIJENTA:", id);

    const existing = await prisma.client.findFirst({ where: { id, artistId, isActive: true } });
    if (!existing) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    await prisma.client.update({ where: { id }, data: { isActive: false } });
    res.status(200).json({ message: 'Client deactivated successfully' });
};
