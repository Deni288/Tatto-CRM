import { Request, Response } from 'express';
import prisma from '../config/db';
import { appointmentSchema } from '@tattoocrm/shared';
import { env } from '../config/env';
import { sendAppointmentConfirmation } from '../services/email.service';

export const getAppointments = async (req: Request, res: Response) => {
    const artistId = req.user!.userId;
    const appointments = await prisma.appointment.findMany({
        where: { artistId, isActive: true, client: { isActive: true } },
        select: {
            id: true,
            clientId: true,
            artistId: true,
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            status: true,
            price: true,
            depositAmount: true,
            depositPaid: true,
            deposit: true,
            createdAt: true,
            client: {
                select: { id: true, firstName: true, lastName: true },
            },
        },
        orderBy: { startTime: 'asc' },
    });
    res.json(appointments);
};

export const createAppointment = async (req: Request, res: Response) => {
    const parsed = appointmentSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const artistId = req.user!.userId;

    const [client, artist] = await Promise.all([
        prisma.client.findFirst({
            where: { id: parsed.data.clientId, artistId, isActive: true },
            select: { id: true, firstName: true, lastName: true, email: true, portalToken: true },
        }),
        prisma.user.findUnique({
            where: { id: artistId },
            select: { name: true },
        }),
    ]);

    if (!client) {
        res.status(404).json({ error: 'Client not found' });
        return;
    }

    const appointment = await prisma.appointment.create({
        data: {
            ...parsed.data,
            price: parsed.data.price != null ? Number(parsed.data.price) : null,
            depositAmount: parsed.data.depositAmount != null ? Number(parsed.data.depositAmount) : null,
            deposit: parsed.data.deposit ?? 0,
            artistId,
        },
    });

    if (client.email && client.portalToken) {
        void sendAppointmentConfirmation({
            to: client.email,
            clientName: `${client.firstName} ${client.lastName}`,
            artistName: artist?.name ?? 'Vaš artist',
            title: parsed.data.title,
            startTime: new Date(parsed.data.startTime),
            endTime: new Date(parsed.data.endTime),
            portalUrl: `${env.FRONTEND_URL}/portal/${client.portalToken}`,
        });
    }

    res.status(201).json(appointment);
};

export const updateAppointment = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const artistId = req.user!.userId;

    const parsed = appointmentSchema.partial().safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const existing = await prisma.appointment.findFirst({ where: { id, artistId } });
    if (!existing) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
    }

    const appointment = await prisma.appointment.update({
        where: { id },
        data: {
            ...parsed.data,
            ...(parsed.data.price !== undefined && { price: parsed.data.price != null ? Number(parsed.data.price) : null }),
            ...(parsed.data.depositAmount !== undefined && { depositAmount: parsed.data.depositAmount != null ? Number(parsed.data.depositAmount) : null }),
        },
    });

    res.json(appointment);
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    // Validate valid ApptStatus enum (Prisma)
    const validStatuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'];
    if (!validStatuses.includes(req.body.status)) {
        res.status(400).json({ error: 'Invalid status provided' });
        return;
    }

    try {
        const result = await prisma.appointment.updateMany({
            where: { 
                id: req.params.id as string, 
                artistId: req.user!.userId 
            },
            data: { 
                status: req.body.status 
            },
        });

        if (result.count === 0) {
            res.status(404).json({ error: 'Appointment not found or unauthorized' });
            return;
        }

        res.json({ success: true, count: result.count });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        res.status(500).json({ error: 'Failed to update status', details: message });
    }
};

export const deleteAppointment = async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const artistId = req.user!.userId;

    const existing = await prisma.appointment.findFirst({ where: { id, artistId } });
    if (!existing) {
        res.status(404).json({ error: 'Appointment not found' });
        return;
    }

    await prisma.appointment.update({
        where: { id },
        data: { isActive: false },
        select: { id: true },
    });
    res.status(204).send();
};
