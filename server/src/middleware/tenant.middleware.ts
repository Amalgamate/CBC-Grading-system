import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './permissions.middleware';
import { ApiError } from '../utils/error.util';

/**
 * Middleware to enforce tenant context
 * Ensures that the authenticated user has a valid schoolId
 * Populates req.tenant for downstream use
 */
export const requireTenant = (req: AuthRequest, _res: Response, next: NextFunction) => {
  // 1. Check if user is authenticated
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  // 2. Extract context
  // SECURITY RULE:
  // - Non-super-admin users are tenant-bound by JWT only (headers must not override).
  // - SUPER_ADMIN may provide tenant context via headers for admin tooling / switching.
  const headerSchoolId = req.header('X-School-Id') || req.header('x-school-id');
  const headerBranchId = req.header('X-Branch-Id') || req.header('x-branch-id');

  const isSuperAdmin = req.user.role === 'SUPER_ADMIN';

  const schoolId = isSuperAdmin ? (req.user.schoolId || headerSchoolId) : req.user.schoolId;
  const branchId = isSuperAdmin ? (req.user.branchId || headerBranchId) : req.user.branchId;

  // If a non-super-admin sends a different header tenant, treat as tampering / bug.
  if (!isSuperAdmin) {
    if (headerSchoolId && req.user.schoolId && headerSchoolId !== req.user.schoolId) {
      return next(new ApiError(403, 'Tenant mismatch: invalid X-School-Id for this token.'));
    }
    if (headerBranchId && req.user.branchId && headerBranchId !== req.user.branchId) {
      return next(new ApiError(403, 'Tenant mismatch: invalid X-Branch-Id for this token.'));
    }
  }

  // 3. Check for schoolId
  if (!schoolId && !isSuperAdmin) {
    return next(new ApiError(403, 'No school association found. Please contact support.'));
  }

  // 4. Set tenant context
  (req as any).tenant = {
    schoolId: schoolId,
    branchId: branchId
  };

  // 5. Back-fill req.user for downstream code paths that depend on it.
  // Only SUPER_ADMIN may receive tenant context from headers.
  if (isSuperAdmin) {
    if (!req.user.schoolId && schoolId) req.user.schoolId = schoolId;
    if (!req.user.branchId && branchId) req.user.branchId = branchId;
  }

  next();
};

/**
 * @deprecated Use requireTenant instead.
 * Kept for backward compatibility during migration.
 */
export const tenantResolver = (req: Request, _res: Response, next: NextFunction) => {
  const anyReq = req as any;
  const user = anyReq.user || {};

  // Prefer JWT over headers. For non-super-admin, headers must not override.
  const headerSchoolId = req.header('X-School-Id') || req.header('x-school-id');
  const headerBranchId = req.header('X-Branch-Id') || req.header('x-branch-id');
  const isSuperAdmin = user.role === 'SUPER_ADMIN';

  const schoolId = isSuperAdmin ? (user.schoolId || headerSchoolId) : user.schoolId;
  const branchId = isSuperAdmin ? (user.branchId || headerBranchId) : user.branchId;

  anyReq.tenant = { schoolId, branchId };
  next();
};

/**
 * @deprecated Use requireTenant instead.
 * Kept for backward compatibility during migration.
 */
export const enforceSchoolConsistency = (req: Request, res: Response, next: NextFunction) => {
  const anyReq = req as any;
  // Use the tenant context already set by requireTenant (or legacy tenantResolver)
  const tenantSchoolId = anyReq.tenant?.schoolId;
  const paramSchoolId = (req.params && (req.params as any).schoolId) || undefined;

  // If we have both, they must match
  if (tenantSchoolId && paramSchoolId && tenantSchoolId !== paramSchoolId) {
    // Exception: If user is SUPER_ADMIN, they might be operating on a different school
    // But typically SUPER_ADMIN wouldn't have a tenantSchoolId set in the token 
    // (unless they are impersonating, which is a different story).
    // If they have a schoolId in token, they are bound to it.
    return res.status(403).json({
      success: false,
      message: 'Access denied: You cannot operate on a different school.',
      details: { userSchoolId: tenantSchoolId, targetSchoolId: paramSchoolId },
    });
  }

  // If we don't have a tenantSchoolId (e.g. SUPER_ADMIN), but we have a param, 
  // we might want to set the context for downstream
  if (!tenantSchoolId && paramSchoolId) {
    anyReq.tenant = anyReq.tenant || {};
    anyReq.tenant.schoolId = paramSchoolId;
  }

  next();
};
