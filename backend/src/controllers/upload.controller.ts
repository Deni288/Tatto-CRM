import type { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import { env } from '../config/env';

export const getBookingUploadConfig = (_req: Request, res: Response): void => {
    res.json({
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        uploadPreset: env.CLOUDINARY_BOOKING_UPLOAD_PRESET,
    });
};

export const getUploadSignature = (req: Request, res: Response): void => {
    const timestamp = Math.round(Date.now() / 1000);
    const folder = `tattoocrm/${req.user!.userId}`;

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        env.CLOUDINARY_API_SECRET
    );

    res.json({
        signature,
        timestamp,
        cloudName: env.CLOUDINARY_CLOUD_NAME,
        apiKey: env.CLOUDINARY_API_KEY,
        folder,
    });
};
