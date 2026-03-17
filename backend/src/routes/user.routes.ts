import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getMe, updateProfile, changePassword } from '../controllers/user.controller';

const router = Router();

router.get('/me', requireAuth, getMe);
router.patch('/me', requireAuth, updateProfile);
router.patch('/me/password', requireAuth, changePassword);

export default router;
