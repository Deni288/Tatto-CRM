import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getDashboardStats } from '../controllers/dashboard.controller';

const router = Router();

router.get('/stats', requireAuth as any, getDashboardStats as any);

export default router;
