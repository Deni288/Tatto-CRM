const requireEnv = (key: string): string => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`[Config] Missing required environment variable: ${key}`);
    }
    return value;
};

export const env = {
    JWT_SECRET: requireEnv('JWT_SECRET'),
    DATABASE_URL: requireEnv('DATABASE_URL'),
    PORT: process.env.PORT ?? '5000',
    NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;
