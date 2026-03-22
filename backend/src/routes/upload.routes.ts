import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getUploadSignature, getBookingUploadConfig } from '../controllers/upload.controller';

const router = Router();

router.get('/booking-config', getBookingUploadConfig);
router.get('/signature', requireAuth, getUploadSignature);

export default router;
