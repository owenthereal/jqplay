import { PrismaClient } from '@prisma/client';

declare global {
    var prisma: PrismaClient | undefined;
}

// Use a single PrismaClient instance in development and production environments.
const prisma = global.prisma || new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
});

if (process.env.NODE_ENV !== 'production') {
    global.prisma = prisma;
}

export default prisma;
