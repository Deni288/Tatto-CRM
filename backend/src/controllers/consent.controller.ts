import { Request, Response } from 'express';
import prisma from '../config/db';
import { consentFormSchema } from '../schemas/consentForm.schema';

export const getClientConsentForms = async (req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId as string;
        const artistId = req.user!.userId;

        // Verify the client belongs to the requesting artist
        const client = await prisma.client.findFirst({
            where: { id: clientId, artistId }
        });

        if (!client) {
            return res.status(404).json({ error: 'Client not found or unauthorized' });
        }

        const consentForms = await prisma.consentForm.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' }
        });

        res.json(consentForms);
    } catch (error) {
        console.error('Error fetching consent forms:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createConsentForm = async (req: Request, res: Response) => {
    try {
        const clientId = req.params.clientId as string;
        const artistId = req.user!.userId;

        // Verify the client belongs to the requesting artist
        const client = await prisma.client.findFirst({
            where: { id: clientId, artistId }
        });

        if (!client) {
            return res.status(404).json({ error: 'Client not found or unauthorized' });
        }

        // Validate the request body
        const parsed = consentFormSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        }

        const consentForm = await prisma.consentForm.create({
            data: {
                clientId,
                medicalConditions: parsed.data.medicalConditions,
                allergies: parsed.data.allergies,
                agreedToTerms: parsed.data.agreedToTerms as boolean,
                signatureName: parsed.data.signatureName
            },
        });

        res.status(201).json(consentForm);
    } catch (error) {
        console.error('Error creating consent form:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
