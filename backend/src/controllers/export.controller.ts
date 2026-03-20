import type { Request, Response } from 'express';
import prisma from '../config/db';

const escapeCSV = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const toCSV = (headers: string[], rows: unknown[][]): string => {
    const headerLine = headers.map(escapeCSV).join(',');
    const dataLines = rows.map((row) => row.map(escapeCSV).join(','));
    return [headerLine, ...dataLines].join('\n');
};

const setCSVHeaders = (res: Response, filename: string): void => {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
};

export const exportClients = async (req: Request, res: Response): Promise<void> => {
    const artistId = req.user!.userId;

    const clients = await prisma.client.findMany({
        where: { artistId, isActive: true },
        orderBy: { createdAt: 'desc' },
        select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            tattooHistory: true,
            createdAt: true,
            _count: { select: { appointments: true } },
        },
    });

    const headers = ['Ime', 'Prezime', 'Email', 'Telefon', 'Tattoo povijest', 'Broj termina', 'Datum dodavanja'];
    const rows = clients.map((c) => [
        c.firstName,
        c.lastName,
        c.email,
        c.phone,
        c.tattooHistory,
        c._count.appointments,
        new Date(c.createdAt).toLocaleDateString('hr-HR'),
    ]);

    setCSVHeaders(res, `klijenti-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(toCSV(headers, rows));
};

export const exportAppointments = async (req: Request, res: Response): Promise<void> => {
    const artistId = req.user!.userId;

    const appointments = await prisma.appointment.findMany({
        where: { artistId, isActive: true },
        orderBy: { startTime: 'desc' },
        select: {
            title: true,
            description: true,
            startTime: true,
            endTime: true,
            status: true,
            price: true,
            depositAmount: true,
            depositPaid: true,
            client: { select: { firstName: true, lastName: true, email: true, phone: true } },
        },
    });

    const headers = ['Klijent', 'Email', 'Telefon', 'Naziv', 'Opis', 'Početak', 'Kraj', 'Status', 'Cijena (€)', 'Depozit (€)', 'Depozit plaćen'];
    const rows = appointments.map((a) => [
        `${a.client.firstName} ${a.client.lastName}`,
        a.client.email,
        a.client.phone,
        a.title,
        a.description,
        new Date(a.startTime).toLocaleString('hr-HR'),
        new Date(a.endTime).toLocaleString('hr-HR'),
        a.status,
        a.price !== null ? Number(a.price).toFixed(2) : '',
        a.depositAmount !== null ? Number(a.depositAmount).toFixed(2) : '',
        a.depositPaid ? 'Da' : 'Ne',
    ]);

    setCSVHeaders(res, `termini-${new Date().toISOString().slice(0, 10)}.csv`);
    res.send(toCSV(headers, rows));
};
