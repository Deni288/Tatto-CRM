import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import { exportClients, exportAppointments } from '../controllers/export.controller';

const router = Router();

const exportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many export requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

router.get('/clients', exportLimiter, requireAuth, exportClients);
router.get('/appointments', exportLimiter, requireAuth, exportAppointments);

export default router;
