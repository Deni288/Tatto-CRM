import type { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../config/db';
import cloudinary from '../config/cloudinary';
import { gallerySchema } from '@tattoocrm/shared';

const uuidSchema = z.string().uuid();

const gallerySelect = {
    id: true,
    clientId: true,
    imageUrl: true,
    description: true,
    cloudinaryPublicId: true,
    createdAt: true,
} as const;

export const getClientGallery = async (req: Request, res: Response): Promise<void> => {
    const idParsed = uuidSchema.safeParse(req.params.clientId);
    if (!idParsed.success) {
        res.status(400).json({ error: 'Invalid client ID' });
        return;
    }
    const clientId = idParsed.data;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({
        where: { id: clientId, artistId },
        select: { id: true },
    });
    if (!client) {
        res.status(404).json({ error: 'Client not found or unauthorized' });
        return;
    }

    const images = await prisma.clientGallery.findMany({
        where: { clientId },
        select: gallerySelect,
        orderBy: { createdAt: 'desc' },
    });

    res.json(images);
};

export const addGalleryImage = async (req: Request, res: Response): Promise<void> => {
    const idParsed = uuidSchema.safeParse(req.params.clientId);
    if (!idParsed.success) {
        res.status(400).json({ error: 'Invalid client ID' });
        return;
    }
    const clientId = idParsed.data;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({
        where: { id: clientId, artistId },
        select: { id: true },
    });
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
            cloudinaryPublicId: parsed.data.cloudinaryPublicId,
        },
        select: gallerySelect,
    });

    res.status(201).json(image);
};

export const deleteGalleryImage = async (req: Request, res: Response): Promise<void> => {
    const clientIdParsed = uuidSchema.safeParse(req.params.clientId);
    const imageIdParsed = uuidSchema.safeParse(req.params.id);
    if (!clientIdParsed.success || !imageIdParsed.success) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }
    const clientId = clientIdParsed.data;
    const imageId = imageIdParsed.data;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({
        where: { id: clientId, artistId },
        select: { id: true },
    });
    if (!client) {
        res.status(404).json({ error: 'Client not found or unauthorized' });
        return;
    }

    const image = await prisma.clientGallery.findFirst({
        where: { id: imageId, clientId },
        select: { id: true, cloudinaryPublicId: true },
    });
    if (!image) {
        res.status(404).json({ error: 'Image not found' });
        return;
    }

    await prisma.clientGallery.delete({ where: { id: imageId } });

    // Delete from Cloudinary fire-and-forget (non-blocking)
    if (image.cloudinaryPublicId) {
        cloudinary.uploader.destroy(image.cloudinaryPublicId).catch(() => {});
    }

    res.json({ success: true });
};
