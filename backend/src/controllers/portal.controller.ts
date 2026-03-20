import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';

const tokenSchema = z.object({ token: z.string().uuid() });

export const getClientPortal = async (req: Request, res: Response): Promise<void> => {
    const parsed = tokenSchema.safeParse(req.params);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid token' });
        return;
    }

    const client = await prisma.client.findUnique({
        where: { portalToken: parsed.data.token, isActive: true },
        select: {
            firstName: true,
            lastName: true,
            appointments: {
                where: { isActive: true },
                orderBy: { startTime: 'desc' },
                select: {
                    id: true,
                    title: true,
                    description: true,
                    startTime: true,
                    endTime: true,
                    status: true,
                    price: true,
                    depositAmount: true,
                    depositPaid: true,
                },
            },
            gallery: {
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    imageUrl: true,
                    description: true,
                    createdAt: true,
                },
            },
        },
    });

    if (!client) {
        res.status(404).json({ error: 'Portal not found' });
        return;
    }

    res.json(client);
};
