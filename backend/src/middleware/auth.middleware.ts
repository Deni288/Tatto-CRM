import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

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
    console.log(`=> [Auth] Checking Token for ${req.method} ${req.originalUrl}`);
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.error('=> [Auth] No auth header or invalid format:', authHeader);
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }

    const token = authHeader.split(' ')[1];

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('=> [Auth] FATAL: JWT_SECRET is not set in environment variables!');
        res.status(500).json({ error: 'Server configuration error' });
        return;
    }

    try {
        const decoded = jwt.verify(token, jwtSecret) as AuthPayload;
        req.user = decoded;
        next();
    } catch (err: any) {
        console.error('=> [Auth] Token verification failed:', err.name, err.message);
        res.status(401).json({ error: 'Unauthorized, token failed' });
        return;
    }
};
