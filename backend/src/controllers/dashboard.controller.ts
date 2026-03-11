import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDashboardStats = async (req: Request, res: Response) => {
    const artistId = req.user?.userId;
    if (!artistId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. todaysRevenue: Zbroj polja price (ili depositAmount) za sve termine danas
    const todaysAppointmentsRevenue = await prisma.appointment.aggregate({
        where: {
            artistId,
            startTime: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        _sum: {
            price: true,
            depositAmount: true
        }
    });

    const todaysRevenue = Number(todaysAppointmentsRevenue._sum.price || 0) + Number(todaysAppointmentsRevenue._sum.depositAmount || 0);

    // 2. upcomingAppointmentsCount: Broj termina sa statusom SCHEDULED čiji je startTime u budućnosti
    const upcomingAppointmentsCount = await prisma.appointment.count({
        where: {
            artistId,
            status: 'SCHEDULED', // Adjust based on your schema default status
            startTime: {
                gt: now
            }
        }
    });

    // 3. newClientsThisMonth: Broj klijenata čiji je createdAt u tekućem mjesecu
    const newClientsThisMonth = await prisma.client.count({
        where: {
            artistId,
            createdAt: {
                gte: startOfMonth,
                lte: endOfMonth
            }
        }
    });

    // 4. todaysAppointments: Dohvati listu termina za današnji dan, include client
    const todaysAppointments = await prisma.appointment.findMany({
        where: {
            artistId,
            startTime: {
                gte: startOfDay,
                lte: endOfDay
            }
        },
        include: {
            client: true
        },
        orderBy: {
            startTime: 'asc'
        }
    });

    res.json({
        todaysRevenue,
        upcomingAppointmentsCount,
        newClientsThisMonth,
        todaysAppointments
    });
};
