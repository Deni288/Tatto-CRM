import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { initiateOAuth, handleCallback, getStatus, disconnect } from '../controllers/googleCalendar.controller';

const router = Router();

router.get('/connect', requireAuth, initiateOAuth);
router.get('/callback', handleCallback); // Public — Google redirects here
router.get('/status', requireAuth, getStatus);
router.delete('/disconnect', requireAuth, disconnect);

export default router;
