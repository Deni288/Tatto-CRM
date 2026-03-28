const requireEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`[Config] Missing required environment variable: ${key}`);
    }
    return value;
};

export const env = {
    JWT_SECRET: requireEnv('JWT_SECRET'),
    REFRESH_TOKEN_SECRET: requireEnv('REFRESH_TOKEN_SECRET'),
    DATABASE_URL: requireEnv('DATABASE_URL'),
    RESEND_API_KEY: requireEnv('RESEND_API_KEY'),
    CLOUDINARY_CLOUD_NAME: requireEnv('CLOUDINARY_CLOUD_NAME'),
    CLOUDINARY_API_KEY: requireEnv('CLOUDINARY_API_KEY'),
    CLOUDINARY_API_SECRET: requireEnv('CLOUDINARY_API_SECRET'),
    CLOUDINARY_BOOKING_UPLOAD_PRESET: requireEnv('CLOUDINARY_BOOKING_UPLOAD_PRESET'),
    VAPID_PUBLIC_KEY: requireEnv('VAPID_PUBLIC_KEY'),
    VAPID_PRIVATE_KEY: requireEnv('VAPID_PRIVATE_KEY'),
    VAPID_CONTACT_EMAIL: requireEnv('VAPID_CONTACT_EMAIL'),
    STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
    STRIPE_MONTHLY_PRICE_ID: requireEnv('STRIPE_MONTHLY_PRICE_ID'),
    STRIPE_YEARLY_PRICE_ID: requireEnv('STRIPE_YEARLY_PRICE_ID'),
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_TOKEN_ENCRYPTION_KEY: process.env.GOOGLE_TOKEN_ENCRYPTION_KEY,
    API_URL: process.env.API_URL ?? 'http://localhost:5000',
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    PORT: process.env.PORT ?? '5000',
    NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;

// Fail-fast: if any Google Calendar env is set, all three must be present and valid
const hasAnyGoogleEnv = !!(env.GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_SECRET || env.GOOGLE_TOKEN_ENCRYPTION_KEY);
if (hasAnyGoogleEnv) {
    if (!env.GOOGLE_CLIENT_ID) throw new Error('[Config] GOOGLE_CLIENT_ID required when Google Calendar is configured');
    if (!env.GOOGLE_CLIENT_SECRET) throw new Error('[Config] GOOGLE_CLIENT_SECRET required when Google Calendar is configured');
    if (!env.GOOGLE_TOKEN_ENCRYPTION_KEY || env.GOOGLE_TOKEN_ENCRYPTION_KEY.length !== 64) {
        throw new Error('[Config] GOOGLE_TOKEN_ENCRYPTION_KEY must be 64 hex chars (32 bytes)');
    }
}
