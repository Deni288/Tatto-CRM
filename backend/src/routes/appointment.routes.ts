import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    updateAppointmentStatus,
} from '../controllers/appointment.controller';

const router = Router();

// Routes
router.get('/', requireAuth, getAppointments);
router.post('/', requireAuth, createAppointment);
router.put('/:id', requireAuth, updateAppointment);
router.patch('/:id/status', requireAuth, updateAppointmentStatus);
router.delete('/:id', requireAuth, deleteAppointment);

export default router;
