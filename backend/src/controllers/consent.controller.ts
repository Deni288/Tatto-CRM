import { Request, Response } from 'express';
import prisma from '../config/db';
import { z } from 'zod';

const consentSchema = z.object({
    clientId: z.string().uuid(),
    appointmentId: z.string().uuid(),
    formData: z.record(z.string(), z.any()),
    signatureUrl: z.string().url(),
});

export const getConsentByAppointmentId = async (req: Request, res: Response) => {
    try {
        const appointmentId = req.params.appointmentId as string;
        const artistId = req.user!.userId;

        const appointment = await prisma.appointment.findFirst({
            where: { id: appointmentId, artistId },
            include: { consentForm: true },
        });

        if (!appointment || !appointment.consentForm) {
            return res.status(404).json({ error: 'Consent form not found' });
        }

        res.json(appointment.consentForm);
    } catch (error) {
        console.error('Error fetching consent form:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createConsentForm = async (req: Request, res: Response) => {
    try {
        const parsed = consentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        }

        const { appointmentId, clientId } = parsed.data;
        const artistId = req.user!.userId;

        // Verify appointment belongs to artist and client
        const appointment = await prisma.appointment.findFirst({
            where: { id: appointmentId, clientId, artistId },
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Valid appointment not found' });
        }

        const consentForm = await prisma.consentForm.create({
            data: {
                ...parsed.data,
                formData: parsed.data.formData as any,
            },
        });

        res.status(201).json(consentForm);
    } catch (error) {
        console.error('Error creating consent form:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
