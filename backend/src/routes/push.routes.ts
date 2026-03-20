import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getVapidPublicKey, subscribe, unsubscribe } from '../controllers/push.controller';

const router = Router();

router.get('/vapid-public-key', getVapidPublicKey);
router.post('/subscribe', requireAuth, subscribe);
router.delete('/subscribe', requireAuth, unsubscribe);

export default router;
