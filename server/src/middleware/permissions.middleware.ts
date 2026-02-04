/**
 * Permissions Middleware
 * Handles authorization checks for different user roles and permissions
 * 
 * @module middleware/permissions
 */

import { Request, Response, NextFunction } from 'express';
import { Permission, Role, hasPermission } from '../config/permissions';

/**
 * Extended Request interface with user information and common middleware properties
 */
export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: Role;
    schoolId?: string | null;
    branchId?: string | null;
  };
  file?: any;
  files?: any;
}

/**
 * Middleware to check if user has required permission
 * 
 * @param permission - The permission to check
 * @returns Express middleware function
 * 
 * @example
 * router.post('/learners', requirePermission('CREATE_LEARNER'), createLearner);
 */
export const requirePermission = (permission: Permission) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!hasPermission(userRole, permission)) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permission,
          userRole: userRole
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has any of the required permissions
 * 
 * @param permissions - Array of permissions, user needs at least one
 * @returns Express middleware function
 * 
 * @example
 * router.get('/reports', requireAnyPermission(['VIEW_ALL_REPORTS', 'VIEW_OWN_REPORTS']), getReports);
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const hasAnyPermission = permissions.some(permission =>
        hasPermission(userRole, permission)
      );

      if (!hasAnyPermission) {
        res.status(403).json({
          success: false,
          message: 'Insufficient permissions',
          required: permissions,
          userRole: userRole
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user has a specific role
 * 
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 * 
 * @example
 * router.delete('/users/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), deleteUser);
 */
export const requireRole = (roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      if (!roles.includes(userRole)) {
        res.status(403).json({
          success: false,
          message: 'Access denied',
          allowedRoles: roles,
          userRole: userRole
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware factory for resource-level access control
 * Can be extended for specific resource checks (learners, assessments, etc.)
 */
export class ResourceAccessControl {
  /**
   * Check if user can access a specific learner
   * - SUPER_ADMIN, ADMIN, HEAD_TEACHER: Can access all learners
   * - TEACHER: Can access learners in their assigned classes
   * - PARENT: Can access only their own children
   */
  static canAccessLearner() {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userRole = req.user?.role;
        const userId = req.user?.userId;

        if (!userRole || !userId) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        // SUPER_ADMIN, ADMIN, HEAD_TEACHER can access all learners
        if (['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER'].includes(userRole)) {
          return next();
        }

        // ACCOUNTANT and RECEPTIONIST can view but not modify
        if (['ACCOUNTANT', 'RECEPTIONIST'].includes(userRole)) {
          if (req.method === 'GET') {
            return next();
          }
          return res.status(403).json({
            success: false,
            message: 'You can only view learner information'
          });
        }

        // TEACHER - check if learner is in their class (implement later with actual DB check)
        if (userRole === 'TEACHER') {
          // TODO: Check if teacher has this learner in their class
          // const hasAccess = await checkTeacherHasLearner(userId, learnerId);
          // if (hasAccess) return next();
          return next(); // Temporary - allow for now
        }

        // PARENT - check if learner is their child (implement later with actual DB check)
        if (userRole === 'PARENT') {
          // TODO: Check if this is their child
          // const hasAccess = await checkParentHasChild(userId, learnerId);
          // if (hasAccess) return next();
          return next(); // Temporary - allow for now
        }

        return res.status(403).json({
          success: false,
          message: 'Cannot access this learner'
        });
      } catch (error) {
        next(error);
      }
    };
  }

  /**
   * Check if user can access a specific assessment
   */
  static canAccessAssessment() {
    return async (req: AuthRequest, res: Response, next: NextFunction) => {
      try {
        const userRole = req.user?.role;
        const userId = req.user?.userId;

        if (!userRole || !userId) {
          return res.status(401).json({
            success: false,
            message: 'Authentication required'
          });
        }

        // SUPER_ADMIN, ADMIN, HEAD_TEACHER can access all assessments
        if (['SUPER_ADMIN', 'ADMIN', 'HEAD_TEACHER'].includes(userRole)) {
          return next();
        }

        // TEACHER - can access assessments for their classes
        if (userRole === 'TEACHER') {
          // TODO: Check if assessment belongs to their class/subject
          return next(); // Temporary - allow for now
        }

        // PARENT - can view assessments for their children
        if (userRole === 'PARENT') {
          if (req.method === 'GET') {
            // TODO: Check if assessment is for their child
            return next(); // Temporary - allow for now
          }
          return res.status(403).json({
            success: false,
            message: 'Parents can only view assessments'
          });
        }

        return res.status(403).json({
          success: false,
          message: 'Cannot access this assessment'
        });
      } catch (error) {
        next(error);
      }
    };
  }
}

/**
 * Audit log middleware - logs sensitive operations
 * Should be used before operations that modify critical data
 */
export const auditLog = (action: string) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    // TODO: Implement actual audit logging to database
    console.log('[AUDIT]', {
      timestamp: new Date().toISOString(),
      action,
      user: req.user?.email,
      role: req.user?.role,
      ip: req.ip,
      method: req.method,
      path: req.path,
      params: req.params,
    });

    next();
  };
};
