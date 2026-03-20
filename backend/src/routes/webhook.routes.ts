import { Router } from 'express';
import express from 'express';
import { handleStripeWebhook } from '../controllers/webhook.controller';

const router = Router();

// Raw body je obavezan za Stripe signature verifikaciju
router.post('/', express.raw({ type: 'application/json' }), handleStripeWebhook);

export default router;
