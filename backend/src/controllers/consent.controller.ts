import type { Request, Response } from 'express';
import prisma from '../config/db';
import { consentFormSchema } from '@tattoocrm/shared';

export const getClientConsentForms = async (req: Request, res: Response): Promise<void> => {
    const clientId = req.params.clientId as string;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({
        where: { id: clientId, artistId },
        select: { id: true },
    });
    if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    const consentForms = await prisma.consentForm.findMany({
        where: { clientId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            medicalConditions: true,
            allergies: true,
            agreedToTerms: true,
            signatureName: true,
            signatureImage: true,
            createdAt: true,
        },
    });

    res.json(consentForms);
};

export const createConsentForm = async (req: Request, res: Response): Promise<void> => {
    const clientId = req.params.clientId as string;
    const artistId = req.user!.userId;

    const client = await prisma.client.findFirst({
        where: { id: clientId, artistId },
        select: { id: true },
    });
    if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    const parsed = consentFormSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const consentForm = await prisma.consentForm.create({
        data: {
            clientId,
            medicalConditions: parsed.data.medicalConditions ?? null,
            allergies: parsed.data.allergies ?? null,
            agreedToTerms: parsed.data.agreedToTerms,
            signatureName: parsed.data.signatureName,
            signatureImage: parsed.data.signatureImage ?? null,
        },
        select: {
            id: true,
            medicalConditions: true,
            allergies: true,
            agreedToTerms: true,
            signatureName: true,
            signatureImage: true,
            createdAt: true,
        },
    });

    res.status(201).json(consentForm);
};
