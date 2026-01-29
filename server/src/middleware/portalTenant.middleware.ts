import { Response, NextFunction } from 'express';
import { AuthRequest } from './permissions.middleware';
import { ApiError } from '../utils/error.util';

/**
 * Portal tenant consistency middleware.
 *
 * Purpose:
 * - Frontend tenant-first URLs (/t/:schoolId/...) are not visible to the API server.
 * - Frontend sends X-Portal-School-Id to indicate which tenant portal the UI is in.
 * - Backend NEVER uses this header to select tenant. It is only used to detect mismatch.
 *
 * Rules:
 * - For non-super-admins: if X-Portal-School-Id is present, it must match req.user.schoolId.
 * - SUPER_ADMIN is exempt (they can switch tenants).
 */
export const enforcePortalTenantMatch = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) return next(new ApiError(401, 'Authentication required'));

  const portalSchoolId = req.header('X-Portal-School-Id') || req.header('x-portal-school-id');
  if (!portalSchoolId) return next();

  if (req.user.role === 'SUPER_ADMIN') return next();

  // If the token has no schoolId, they cannot be using a tenant portal.
  if (!req.user.schoolId) {
    return next(new ApiError(403, 'Tenant mismatch: token has no school context.'));
  }

  if (req.user.schoolId !== portalSchoolId) {
    return next(new ApiError(403, 'Tenant mismatch: wrong portal for this token.'));
  }

  next();
};

