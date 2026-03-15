import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
    createBookingRequest,
    getBookingRequests,
    updateBookingRequestStatus,
    convertRequestToClient,
} from '../controllers/bookingRequest.controller';

const router = Router();

// Public route — no auth required
router.post('/', createBookingRequest);

// Protected routes — require auth
console.log('Registering route: GET /api/booking-requests/');
router.get('/', requireAuth, getBookingRequests);
console.log('Registering route: PUT /api/booking-requests/:id/status');
router.put('/:id/status', requireAuth, updateBookingRequestStatus);
console.log('Registering route: POST /api/booking-requests/:id/convert');
router.post('/:id/convert', requireAuth, convertRequestToClient);

export default router;
