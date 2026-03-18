import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import './config/env'; // Validate required env vars at startup
import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import appointmentRoutes from './routes/appointment.routes';
import consentRoutes from './routes/consent.routes';
import dashboardRoutes from './routes/dashboard.routes';
import bookingRequestRoutes from './routes/bookingRequest.routes';
import userRoutes from './routes/user.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';
const app = express();
const port = process.env.PORT || 5000;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tatto-crm-mu.vercel.app'
  ],
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/booking-requests', bookingRequestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
