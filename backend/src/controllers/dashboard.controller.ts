import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    const artistId = req.user!.userId;

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Sve 4 query se izvršavaju paralelno — ne čekaju jedna drugu
    const [revenueResult, upcomingAppointmentsCount, newClientsThisMonth, todaysAppointments] =
        await Promise.all([
            // SUM u bazi — ne dohvaćamo objekte samo da zbrajamo u JS-u
            prisma.appointment.aggregate({
                where: {
                    artistId,
                    startTime: { gte: startOfDay, lte: endOfDay },
                },
                _sum: { price: true },
            }),

            prisma.appointment.count({
                where: {
                    artistId,
                    status: 'SCHEDULED',
                    startTime: { gt: now },
                },
            }),

            prisma.client.count({
                where: {
                    artistId,
                    isActive: true,
                    createdAt: { gte: startOfMonth, lte: endOfMonth },
                },
            }),

            // select — samo polja koja dashboard prikazuje
            prisma.appointment.findMany({
                where: {
                    artistId,
                    client: { isActive: true },
                    startTime: { gte: startOfDay, lte: endOfDay },
                },
                orderBy: { startTime: 'asc' },
                select: {
                    id: true,
                    title: true,
                    status: true,
                    startTime: true,
                    client: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            }),
        ]);

    const todaysRevenue = Number(revenueResult._sum.price ?? 0);

    res.json({
        todaysRevenue,
        upcomingAppointmentsCount,
        newClientsThisMonth,
        todaysAppointments,
    });
};
