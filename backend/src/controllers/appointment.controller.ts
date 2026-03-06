import { Request, Response } from 'express';
import prisma from '../config/db';
import { z } from 'zod';

const appointmentSchema = z.object({
    clientId: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().optional(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    price: z.number().optional(),
    depositAmount: z.number().optional(),
});

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const artistId = req.user!.userId;
        const appointments = await prisma.appointment.findMany({
            where: { artistId },
            include: { client: true },
            orderBy: { startTime: 'asc' },
        });
        res.json(appointments);
    } catch (error) {
        console.error('Error fetching appointments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const parsed = appointmentSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        }

        const artistId = req.user!.userId;
        const client = await prisma.client.findFirst({ where: { id: parsed.data.clientId, artistId } });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        const appointment = await prisma.appointment.create({
            data: {
                ...parsed.data,
                artistId,
            },
        });

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Error creating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateAppointment = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const artistId = req.user!.userId;

        const parsed = appointmentSchema.partial().safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        }

        const existing = await prisma.appointment.findFirst({ where: { id, artistId } });
        if (!existing) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: parsed.data,
        });

        res.json(appointment);
    } catch (error) {
        console.error('Error updating appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteAppointment = async (req: Request, res: Response) => {
    try {
        const id = req.params.id as string;
        const artistId = req.user!.userId;

        const existing = await prisma.appointment.findFirst({ where: { id, artistId } });
        if (!existing) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        await prisma.appointment.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting appointment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
