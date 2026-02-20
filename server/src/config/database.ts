import { PrismaClient } from '@prisma/client';
import { applyTenantMiddleware } from '../middleware/prisma-tenant.middleware';
import { applyNameFormatterMiddleware } from '../middleware/prisma-name-formatter.middleware';

const prisma = new PrismaClient({
  log: ['error'],
});

// Apply automatic uppercase formatting for names
applyNameFormatterMiddleware(prisma);

// Apply automatic tenant filtering middleware
applyTenantMiddleware(prisma);

export default prisma;

