import { PrismaClient } from '@prisma/client';
import { applyTenantMiddleware } from '../middleware/prisma-tenant.middleware';

const prisma = new PrismaClient({
  log: ['error'],
});

// Apply automatic tenant filtering middleware
applyTenantMiddleware(prisma);

export default prisma;

