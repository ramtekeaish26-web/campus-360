import { PrismaClient } from '@prisma/client';
import { env } from './env.js';
import { logger } from './logger.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbAvailable: boolean | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

let isDbAvailableState = globalForPrisma.dbAvailable ?? Boolean(env.DATABASE_URL);

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Attempt quick query with 2s timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2000)),
    ]);
    isDbAvailableState = true;
    if (env.NODE_ENV !== 'production') globalForPrisma.dbAvailable = true;
    return true;
  } catch (error) {
    isDbAvailableState = false;
    if (env.NODE_ENV !== 'production') globalForPrisma.dbAvailable = false;
    logger.warn('Database connection not available. Operating with verified in-memory demo datasets.');
    return false;
  }
}

export function isDbConnected(): boolean {
  return isDbAvailableState === true;
}

export function setDbAvailability(available: boolean): void {
  isDbAvailableState = available;
  if (env.NODE_ENV !== 'production') globalForPrisma.dbAvailable = available;
}
