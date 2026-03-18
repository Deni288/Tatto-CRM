import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getUploadSignature } from '../controllers/upload.controller';

const router = Router();

router.get('/signature', requireAuth, getUploadSignature);

export default router;
