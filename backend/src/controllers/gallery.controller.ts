import { Request, Response } from 'express';
import prisma from '../config/db';
import { gallerySchema } from '../schemas/gallery.schema';

export const getClientGallery = async (req: Request, res: Response) => {
    const clientId = req.params.clientId as string;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({ where: { id: clientId, artistId } });
    if (!client) {
        res.status(404).json({ error: 'Client not found or unauthorized' });
        return;
    }

    const images = await prisma.clientGallery.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
    });

    res.json(images);
};

export const addGalleryImage = async (req: Request, res: Response) => {
    const clientId = req.params.clientId as string;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({ where: { id: clientId, artistId } });
    if (!client) {
        res.status(404).json({ error: 'Client not found or unauthorized' });
        return;
    }

    const parsed = gallerySchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const image = await prisma.clientGallery.create({
        data: {
            clientId,
            imageUrl: parsed.data.imageUrl,
            description: parsed.data.description,
        },
    });

    res.status(201).json(image);
};

export const deleteGalleryImage = async (req: Request, res: Response) => {
    const clientId = req.params.clientId as string;
    const imageId = req.params.id as string;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({ where: { id: clientId, artistId } });
    if (!client) {
        res.status(404).json({ error: 'Client not found or unauthorized' });
        return;
    }

    const result = await prisma.clientGallery.deleteMany({
        where: { id: imageId, clientId },
    });

    if (result.count === 0) {
        res.status(404).json({ error: 'Image not found' });
        return;
    }

    res.json({ success: true });
};
