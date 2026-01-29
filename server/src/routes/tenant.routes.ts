import { Router } from 'express';
import prisma from '../config/database';
import { asyncHandler } from '../utils/async.util';
import { ApiError } from '../utils/error.util';

/**
 * Tenant Routes (Public)
 * Used for tenant-first UX (branding + portal validation)
 */
const router = Router();

/**
 * GET /api/tenants/public/:schoolId
 * Returns public branding data for a tenant.
 *
 * Note: Keep this response intentionally minimal (no PII).
 */
router.get(
  '/public/:schoolId',
  asyncHandler(async (req, res) => {
    const { schoolId } = req.params;
    if (!schoolId) throw new ApiError(400, 'schoolId is required');

    const school = await prisma.school.findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        faviconUrl: true,
        active: true,
        archived: true,
        status: true,
      },
    });

    if (!school || !school.active || school.archived) {
      throw new ApiError(404, 'Tenant not found');
    }

    res.json({
      success: true,
      data: {
        schoolId: school.id,
        schoolName: school.name,
        logoUrl: school.logoUrl,
        faviconUrl: school.faviconUrl,
        status: school.status,
      },
    });
  })
);

export default router;

