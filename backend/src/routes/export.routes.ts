import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { exportClients, exportAppointments } from '../controllers/export.controller';

const router = Router();

router.get('/clients', requireAuth, exportClients);
router.get('/appointments', requireAuth, exportAppointments);

export default router;
