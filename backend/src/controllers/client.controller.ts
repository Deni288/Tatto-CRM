import { Request, Response } from 'express';
import prisma from '../config/db';
import { z } from 'zod';

const clientSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional().or(z.literal('')),
    tattooHistory: z.string().optional(),
    customFields: z.record(z.string(), z.any()).optional(),
});

export const getClients = async (req: Request, res: Response) => {
    try {
        const artistId = req.user!.userId;
        const clients = await prisma.client.findMany({
            where: { artistId },
            orderBy: { createdAt: 'desc' },
        });
        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getClientById = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const artistId = req.user!.userId;

        const client = await prisma.client.findFirst({
            where: { id, artistId },
            include: {
                appointments: true,
                consentForms: true,
                images: true,
            }
        });

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json(client);
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createClient = async (req: Request, res: Response) => {
    try {
        const parsed = clientSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        }

        const artistId = req.user!.userId;
        const client = await prisma.client.create({
            data: {
                ...parsed.data,
                customFields: parsed.data.customFields as any,
                artistId,
                email: parsed.data.email || null,
                phone: parsed.data.phone || null,
            },
        });

        res.status(201).json(client);
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateClient = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const artistId = req.user!.userId;

        const parsed = clientSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        }

        // Verify ownership
        const existing = await prisma.client.findFirst({ where: { id, artistId } });
        if (!existing) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const client = await prisma.client.update({
            where: { id },
            data: {
                ...parsed.data,
                customFields: parsed.data.customFields as any,
                email: parsed.data.email || null,
                phone: parsed.data.phone || null,
            },
        });

        res.json(client);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteClient = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const artistId = req.user!.userId;

        const existing = await prisma.client.findFirst({ where: { id, artistId } });
        if (!existing) {
            return res.status(404).json({ error: 'Client not found' });
        }

        await prisma.client.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
