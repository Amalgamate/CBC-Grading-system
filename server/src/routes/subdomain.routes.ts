import { Router } from 'express';
import { subdomainService } from '../services/subdomain.service';
import { asyncHandler } from '../utils/async.util';
import { ApiError } from '../utils/error.util';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { requireTenant } from '../middleware/tenant.middleware';
import prisma from '../config/database';

const router = Router();

/**
 * POST /api/subdomains/check-availability
 * Check if a subdomain is available for use
 * Public endpoint - no authentication required
 */
router.post(
  '/check-availability',
  asyncHandler(async (req, res) => {
    const { subdomain } = req.body;

    if (!subdomain) {
      throw new ApiError(400, 'Subdomain is required');
    }

    const result = await subdomainService.validateSubdomain(subdomain);

    res.json({
      success: true,
      data: result
    });
  })
);

/**
 * GET /api/subdomains/:subdomain/branding
 * Get public branding information for a tenant by subdomain
 * Used for tenant-first UX and branding
 * Public endpoint - no authentication required
 */
router.get(
  '/:subdomain/branding',
  asyncHandler(async (req, res) => {
    const { subdomain } = req.params;

    const school = await subdomainService.resolveSubdomainToSchool(subdomain);

    if (!school) {
      throw new ApiError(404, 'School not found');
    }

    res.json({
      success: true,
      data: {
        schoolId: school.id,
        schoolName: school.name,
        logoUrl: school.logoUrl,
        faviconUrl: school.faviconUrl,
        status: school.active ? 'ACTIVE' : 'INACTIVE'
      }
    });
  })
);

/**
 * POST /api/subdomains/suggest
 * Get suggested subdomain from school name
 * Public endpoint - used during school registration
 */
router.post(
  '/suggest',
  asyncHandler(async (req, res) => {
    const { schoolName } = req.body;

    if (!schoolName) {
      throw new ApiError(400, 'School name is required');
    }

    const suggested = await subdomainService.autoAssignSubdomain(schoolName);

    res.json({
      success: true,
      data: {
        suggested,
        url: subdomainService.buildSubdomainUrl(suggested)
      }
    });
  })
);

/**
 * POST /api/subdomains/reserved
 * Get list of reserved subdomains
 * Public endpoint - for reference
 */
router.get(
  '/reserved',
  asyncHandler(async (req, res) => {
    const reserved = (process.env.SUBDOMAIN_RESERVED_WORDS || 'www,api,mail,admin,support,blog').split(
      ','
    );

    res.json({
      success: true,
      data: {
        reserved: reserved.map(w => w.trim())
      }
    });
  })
);

/**
 * PUT /api/subdomains/:schoolId
 * Update/assign subdomain for a school
 * Protected endpoint - school admin or owner only
 */
router.put(
  '/:schoolId',
  authenticate,
  requireTenant,
  asyncHandler(async (req, res) => {
    const { schoolId } = req.params;
    const { subdomain } = req.body;

    if (!subdomain) {
      throw new ApiError(400, 'Subdomain is required');
    }

    // Verify the school exists and user has access
    const school = await ((prisma.school as any).findUnique({
      where: { id: schoolId },
      select: { id: true, email: true }
    })) as any;

    if (!school) {
      throw new ApiError(404, 'School not found');
    }

    // Check if user is admin of this school or SUPER_ADMIN
    const anyReq = req as any;
    const isSuperAdmin = anyReq.user?.role === 'SUPER_ADMIN';
    const isSchoolAdmin = anyReq.user?.role === 'ADMIN' && anyReq.tenant?.schoolId === schoolId;

    if (!isSuperAdmin && !isSchoolAdmin) {
      throw new ApiError(403, 'You do not have permission to update this school subdomain');
    }

    // Update subdomain
    const updated = await subdomainService.updateSchoolSubdomain(schoolId, subdomain);

    res.json({
      success: true,
      message: 'Subdomain updated successfully',
      data: {
        id: updated.id,
        name: updated.name,
        subdomain: updated.subdomain,
        verified: updated.subdomainVerified,
        url: subdomainService.buildSubdomainUrl(updated.subdomain)
      }
    });
  })
);

/**
 * POST /api/subdomains/:schoolId/verify
 * Verify subdomain DNS configuration
 * Protected endpoint - SUPER_ADMIN only
 */
router.post(
  '/:schoolId/verify',
  authenticate,
  authorize('SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const { schoolId } = req.params;

    const school = await ((prisma.school as any).findUnique({
      where: { id: schoolId },
      select: {
        id: true,
        name: true,
        subdomain: true,
        subdomainVerified: true
      }
    })) as any;

    if (!school) {
      throw new ApiError(404, 'School not found');
    }

    if (!school.subdomain) {
      throw new ApiError(400, 'School does not have a subdomain assigned');
    }

    // TODO: In production, verify DNS resolution here
    // For now, just mark as verified
    const verified = await ((prisma.school as any).update({
      where: { id: schoolId },
      data: {
        subdomainVerified: true,
        subdomainVerifiedAt: new Date()
      },
      select: {
        id: true,
        subdomain: true,
        subdomainVerified: true,
        subdomainVerifiedAt: true
      }
    })) as any;

    // Invalidate cache
    subdomainService.clearCache();

    res.json({
      success: true,
      message: 'Subdomain verified successfully',
      data: verified
    });
  })
);

/**
 * GET /api/subdomains/stats
 * Get subdomain statistics (admin only)
 */
router.get(
  '/admin/stats',
  authenticate,
  authorize('SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const withSubdomains = await ((prisma.school as any).count({
      where: {
        subdomain: {
          not: null
        }
      } as any
    })) as any;

    const verifiedSubdomains = await ((prisma.school as any).count({
      where: {
        subdomainVerified: true
      } as any
    })) as any;

    const totalSchools = await prisma.school.count();

    res.json({
      success: true,
      data: {
        totalSchools,
        withSubdomains,
        verifiedSubdomains,
        adoptionRate: ((withSubdomains / totalSchools) * 100).toFixed(2) + '%',
        verificationRate: ((verifiedSubdomains / withSubdomains) * 100).toFixed(2) + '%',
        cacheStats: subdomainService.getCacheStats()
      }
    });
  })
);

export default router;
