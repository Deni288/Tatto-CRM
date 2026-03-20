import { Router } from 'express';
import { getClientPortal } from '../controllers/portal.controller';

const router = Router();

// Public — no auth required
router.get('/:token', getClientPortal);

export default router;
