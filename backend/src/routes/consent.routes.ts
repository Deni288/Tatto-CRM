import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    getConsentByAppointmentId,
    createConsentForm,
} from '../controllers/consent.controller';

const router = Router();

router.use(requireAuth);

router.get('/appointment/:appointmentId', getConsentByAppointmentId);
router.post('/', createConsentForm);

export default router;
