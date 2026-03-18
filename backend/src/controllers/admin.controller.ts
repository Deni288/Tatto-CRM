import { Request, Response } from 'express';
import prisma from '../config/db';
import { artistIdParamSchema } from '../schemas/admin.schema';

export const getArtists = async (_req: Request, res: Response): Promise<void> => {
    const artists = await prisma.user.findMany({
        where: { role: 'ARTIST' },
        select: {
            id: true,
            name: true,
            email: true,
            isActive: true,
            createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
    });

    res.json({ data: artists });
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
