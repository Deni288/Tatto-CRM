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
    VAPID_PUBLIC_KEY: requireEnv('VAPID_PUBLIC_KEY'),
    VAPID_PRIVATE_KEY: requireEnv('VAPID_PRIVATE_KEY'),
    VAPID_CONTACT_EMAIL: requireEnv('VAPID_CONTACT_EMAIL'),
    STRIPE_SECRET_KEY: requireEnv('STRIPE_SECRET_KEY'),
    STRIPE_WEBHOOK_SECRET: requireEnv('STRIPE_WEBHOOK_SECRET'),
    STRIPE_MONTHLY_PRICE_ID: requireEnv('STRIPE_MONTHLY_PRICE_ID'),
    STRIPE_YEARLY_PRICE_ID: requireEnv('STRIPE_YEARLY_PRICE_ID'),
    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    PORT: process.env.PORT ?? '5000',
    NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
