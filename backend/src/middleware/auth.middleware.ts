import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface AuthPayload {
    userId: string;
    role: string;
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthPayload;
        }
    }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const token = authHeader.split(' ')[1];

    // try/catch je opravdan — jwt.verify je sinhroni poziv koji baca grešku,
    // Express 5 ne hvata sinkrone greške automatski
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
        req.user = decoded;
        next();
    } catch (err: unknown) {
        const name = err instanceof Error ? err.name : 'UnknownError';
        console.error('[Auth] Token verification failed:', name);
        res.status(401).json({ error: 'Unauthorized' });
    }
};
