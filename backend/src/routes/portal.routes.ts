import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { getClientPortal } from '../controllers/portal.controller';

const router = Router();

const portalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { error: 'Too many requests' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public — no auth required
router.get('/:token', portalLimiter, getClientPortal);

export default router;
