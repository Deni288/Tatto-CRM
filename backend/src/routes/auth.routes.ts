import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login } from '../controllers/auth.controller';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuta
  max: 5, // maksimalno 5 pokušaja s iste IP adrese
  message: { message: 'Too many login attempts from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', register);
router.post('/login', loginLimiter, login);

export default router;
