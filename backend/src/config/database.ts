import { PrismaClient } from '@prisma/client';
import { logger } from './logger';

export const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' },
  ],
});

(prisma as any).$on('query', (e: any) => {
  logger.debug(`Prisma Query: ${e.query} | Params: ${e.params} | Duration: ${e.duration}ms`);
});

(prisma as any).$on('info', (e: any) => {
  logger.info(`Prisma Info: ${e.message}`);
});

(prisma as any).$on('warn', (e: any) => {
  logger.warn(`Prisma Warning: ${e.message}`);
});

(prisma as any).$on('error', (e: any) => {
  logger.error(`Prisma Error: ${e.message}`);
});
