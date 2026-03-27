import cron from 'node-cron';
import prisma from '../config/db';
import { env } from '../config/env';
import { sendAppointmentReminder } from './email.service';
import { sendPushToArtist } from './push.service';

const sendReminders = async (): Promise<void> => {
    const now = new Date();
    const tomorrowStart = new Date(now);
    tomorrowStart.setUTCHours(0, 0, 0, 0);
    tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

    const tomorrowEnd = new Date(tomorrowStart);
    tomorrowEnd.setUTCHours(23, 59, 59, 999);

    const appointments = await prisma.appointment.findMany({
        where: {
            status: 'SCHEDULED',
            isActive: true,
            reminderSent: false,
            startTime: { gte: tomorrowStart, lte: tomorrowEnd },
            client: { isActive: true, email: { not: null } },
        },
        select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            client: {
                select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                    portalToken: true,
                },
            },
            artist: {
                select: { id: true, name: true },
            },
            artistId: true,
        },
    });

    for (const appt of appointments) {
        const { client, artist } = appt;
        if (!client.email || !client.portalToken) continue;

        try {
            await sendAppointmentReminder({
                to: client.email,
                clientName: `${client.firstName} ${client.lastName}`,
                artistName: artist.name,
                title: appt.title,
                startTime: appt.startTime,
                endTime: appt.endTime,
                portalUrl: `${env.FRONTEND_URL}/portal/${client.portalToken}`,
            });

            // Send push notification to the artist
            await sendPushToArtist(appt.artist.id, {
                title: `Sutra: ${client.firstName} ${client.lastName}`,
                body: `${appt.title} — ${appt.startTime.toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })}`,
                url: '/dashboard/appointments',
            }).catch((pushErr: unknown) => {
                console.error(`[Push] Failed for appointment ${appt.id}:`, pushErr instanceof Error ? pushErr.message : pushErr);
            });

            await prisma.appointment.update({
                where: { id: appt.id },
                data: { reminderSent: true },
                select: { id: true },
            });
        } catch (err: unknown) {
            console.error(`Failed to send reminder for appointment ${appt.id}:`, err instanceof Error ? err.message : err);
        }
    }
};

export const startReminderCron = (): void => {
    // Runs every day at 09:00 UTC (11:00 CET / 10:00 CEST)
    cron.schedule('0 9 * * *', () => {
        sendReminders().catch((err: unknown) => {
            console.error('Reminder cron error:', err instanceof Error ? err.message : err);
        });
    });
};
