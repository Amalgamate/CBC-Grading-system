import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './permissions.middleware';

// Re-export AuthRequest for convenience
export type { AuthRequest };
import { verifyAccessToken } from '../utils/jwt.util';
import { ApiError } from '../utils/error.util';
import { Role } from '../config/permissions';

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    
    next();
  } catch (error) {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

export const authorize = (...roles: Role[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Access denied. Required roles: ' + roles.join(', ')));
    }
    next();
  };
};

/**
 * Middleware to ensure user belongs to a school
 * Use this for endpoints that require school context
 */
export const requireSchool = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user?.schoolId && req.user?.role !== 'SUPER_ADMIN') {
    return next(new ApiError(403, 'School association required. Please contact administrator.'));
  }
  next();
};

/**
 * Middleware to ensure user belongs to a branch
 * Use this for branch-specific operations
 */
export const requireBranch = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user?.branchId && req.user?.role !== 'SUPER_ADMIN' && req.user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Branch association required. Please contact administrator.'));
  }
  next();
};
