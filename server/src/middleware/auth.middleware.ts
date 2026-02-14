import { Response, NextFunction } from 'express';
import { AuthRequest } from './permissions.middleware';
import { verifyAccessToken } from '../utils/jwt.util';
import { ApiError } from '../utils/error.util';
import { Role } from '../config/permissions';

export type { AuthRequest };

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required');
    }

    const token = authHeader.split(' ')[1];

    const decoded = verifyAccessToken(token);
    req.user = decoded;

    // Set tenant context if available
    if (decoded.schoolId || decoded.branchId) {
      (req as any).tenant = {
        schoolId: decoded.schoolId,
        branchId: decoded.branchId
      };
    }

    next();
  } catch (error: any) {
    console.error('❌ Auth Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired'));
    } else if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else {
      next(new ApiError(401, 'Authentication failed'));
    }
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
