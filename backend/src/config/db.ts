import { PrismaClient } from '@prisma/client';

// Jednostavna inicijalizacija - Prisma će sama potražiti DATABASE_URL u Environment Variables
const prisma = new PrismaClient();

export default prisma;