import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { getBillingStatus, createCheckout, createPortal } from '../controllers/billing.controller';

const router = Router();

router.get('/status', requireAuth, getBillingStatus);
router.post('/checkout', requireAuth, createCheckout);
router.post('/portal', requireAuth, createPortal);

export default router;
