import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    getAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
} from '../controllers/appointment.controller';

const router = Router();

router.use(requireAuth);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
