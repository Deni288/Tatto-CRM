import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    createBookingRequest,
    getBookingRequests,
    updateBookingRequestStatus,
} from '../controllers/bookingRequest.controller';

const router = Router();

// Public route — no auth required
router.post('/', createBookingRequest);

// Protected routes — require auth
router.get('/', requireAuth, getBookingRequests);
router.put('/:id/status', requireAuth, updateBookingRequestStatus);

export default router;
