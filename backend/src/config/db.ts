import { PrismaClient } from '@prisma/client';

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
    console.error("Greška: DATABASE_URL nije definiran u Environment Variables!");
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: dbUrl,
        },
    },
});

export default prisma;