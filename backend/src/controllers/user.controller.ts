import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { UpdateProfileSchema, ChangePasswordSchema } from '@tattoocrm/shared';

const userSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    aftercareText: true,
} as const;

export const getMe = async (req: Request, res: Response): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: userSelect,
    });

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    res.json(user);
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const user = await prisma.user.update({
        where: { id: req.user!.userId },
        data: { name: parsed.data.name, aftercareText: parsed.data.aftercareText },
        select: userSelect,
    });

    res.json(user);
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
    const parsed = ChangePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid input', details: parsed.error.issues });
        return;
    }

    const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        select: { id: true, passwordHash: true },
    });

    if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
    }

    const isMatch = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
    if (!isMatch) {
        res.status(400).json({ error: 'Current password is incorrect' });
        return;
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
    });

    res.json({ message: 'Password updated successfully' });
};
