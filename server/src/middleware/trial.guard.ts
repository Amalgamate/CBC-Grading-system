import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

const daysBetween = (start: Date, end: Date) => {
  const ms = end.getTime() - start.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
};

export const checkSchoolActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Allow unauthenticated routes handled elsewhere; here we assume authenticate ran
    // Bypass for SUPER_ADMIN and admin endpoints
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user = (req as any).user || {};
    if (user?.role === 'SUPER_ADMIN' || req.path.startsWith('/admin')) {
      return next();
    }
    // Resolve schoolId from tenant (set by tenant middleware)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tenant = (req as any).tenant || {};
    const schoolId: string | undefined = tenant.schoolId || user?.schoolId;
    if (!schoolId) {
      return res.status(400).json({ success: false, error: 'Missing school context' });
    }
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return res.status(404).json({ success: false, error: 'School not found' });
    }
    // If inactive, block
    if (school.active === false) {
      return res.status(403).json({ success: false, error: 'School inactive. Payment required.' });
    }
    // Trial evaluation
    if (school.status === ('TRIAL' as any) && school.trialStart) {
      const days = daysBetween(new Date(school.trialStart), new Date());
      const trialDays = school.trialDays ?? 30;
      if (days >= trialDays) {
        // Check active subscription
        const sub = await prisma.schoolSubscription.findFirst({
          where: { schoolId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
        });
        if (!sub) {
          await prisma.school.update({
            where: { id: schoolId },
            data: { active: false, status: 'INACTIVE' as any },
          });
          return res.status(403).json({ success: false, error: 'Trial expired. Payment required.' });
        }
      }
    }
    next();
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Trial status check failed' });
  }
};
