import { Request, Response } from 'express';
import prisma from '../config/db';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    const artistId = req.user!.userId;

    const now = new Date();

    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [
        revenueResult,
        upcomingAppointmentsCount,
        newClientsThisMonth,
        todaysAppointments,
        completedLast6Months,
        scheduledCount,
        completedCount,
        cancelledCount,
        noShowCount,
    ] = await Promise.all([
        prisma.appointment.aggregate({
            where: {
                artistId,
                isActive: true,
                startTime: { gte: startOfDay, lte: endOfDay },
            },
            _sum: { price: true },
        }),

        prisma.appointment.count({
            where: {
                artistId,
                isActive: true,
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

        prisma.appointment.findMany({
            where: {
                artistId,
                isActive: true,
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

        prisma.appointment.findMany({
            where: {
                artistId,
                isActive: true,
                status: 'COMPLETED',
                startTime: { gte: sixMonthsAgo },
            },
            select: {
                startTime: true,
                price: true,
            },
        }),

        prisma.appointment.count({ where: { artistId, isActive: true, status: 'SCHEDULED' } }),
        prisma.appointment.count({ where: { artistId, isActive: true, status: 'COMPLETED' } }),
        prisma.appointment.count({ where: { artistId, isActive: true, status: 'CANCELLED' } }),
        prisma.appointment.count({ where: { artistId, isActive: true, status: 'NO_SHOW' } }),
    ]);

    // Build last 6 months array with revenue per month
    const monthlyRevenueMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthlyRevenueMap.set(key, 0);
    }
    for (const appt of completedLast6Months) {
        const d = new Date(appt.startTime);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (monthlyRevenueMap.has(key)) {
            monthlyRevenueMap.set(key, (monthlyRevenueMap.get(key) ?? 0) + Number(appt.price ?? 0));
        }
    }
    const monthlyRevenue = Array.from(monthlyRevenueMap.entries()).map(([key, revenue]) => {
        const [, month] = key.split('-').map(Number);
        return { month: MONTH_NAMES[month], revenue: Math.round(revenue * 100) / 100 };
    });

    const appointmentsByStatus = [
        { status: 'Scheduled', count: scheduledCount, color: '#3b82f6' },
        { status: 'Completed', count: completedCount, color: '#22c55e' },
        { status: 'Cancelled', count: cancelledCount, color: '#ef4444' },
        { status: 'No Show', count: noShowCount, color: '#f59e0b' },
    ].filter((s) => s.count > 0);

    res.json({
        todaysRevenue: Number(revenueResult._sum.price ?? 0),
        upcomingAppointmentsCount,
        newClientsThisMonth,
        todaysAppointments,
        monthlyRevenue,
        appointmentsByStatus,
    });
};
