import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.middleware';
import {
    createBookingRequest,
    getBookingRequests,
    updateBookingRequestStatus,
    convertRequestToClient,
} from '../controllers/bookingRequest.controller';

const router = Router();

// Rate limiter za javni booking endpoint
// 10 zahtjeva po IP-u na 15 minuta — štiti od spama i DoS napada
const bookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many booking requests from this IP, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public route — no auth required, artistId identifies the artist
router.post('/:artistId', bookingLimiter, createBookingRequest);

// Protected routes — require auth
router.get('/', requireAuth, getBookingRequests);
router.put('/:id/status', requireAuth, updateBookingRequestStatus);
router.post('/:id/convert', requireAuth, convertRequestToClient);

export default router;
