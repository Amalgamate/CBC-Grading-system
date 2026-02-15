import { Response, NextFunction } from 'express';
import { subdomainService } from '../services/subdomain.service';
import { ApiError } from '../utils/error.util';
import { SubdomainRequest } from './subdomain.middleware';

/**
 * Extended tenant context
 */
export interface TenantContext {
  schoolId: string;
  source: 'subdomain' | 'path' | 'jwt';
}

/**
 * Middleware to resolve subdomain to school and set tenant context
 * 
 * This middleware:
 * 1. Checks if subdomain is present
 * 2. Resolves subdomain to schoolId via database/cache
 * 3. Validates school is active and not archived
 * 4. Verifies JWT schoolId matches if user is authenticated
 * 5. Sets tenant context for downstream middleware
 */
export async function subdomainAuth(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    // If no subdomain detected or not tenant access, pass through
    if (!req.subdomain || !req.isTenantAccess) {
      return next();
    }

    // Resolve subdomain to school
    const school = await subdomainService.resolveSubdomainToSchool(req.subdomain);

    if (!school) {
      // Subdomain not found or school is inactive/archived
      return next(new ApiError(404, `School "${req.subdomain}" not found`));
    }

    // Store school in request for later use
    (req as any).subdomainSchool = school;

    // Set tenant context
    (req as any).tenant = {
      schoolId: school.id,
      source: 'subdomain'
    } as TenantContext;

    // If user is authenticated, verify consistency
    if (req.user && req.user.schoolId) {
      if (req.user.schoolId !== school.id) {
        // User is logged into a different school than the subdomain
        return next(new ApiError(403, 'You do not have access to this school'));
      }
    }

    // Success - allow request to proceed
    next();
  } catch (error) {
    console.error('Error in subdomainAuth middleware:', error);
    next(new ApiError(500, 'Error resolving subdomain'));
  }
}

/**
 * Middleware to validate subdomain access
 * Can be used to enforce that requests MUST come via subdomain
 */
export function requireSubdomainAccess(req: any, res: Response, next: NextFunction): void {
  if (!req.isTenantAccess || !req.subdomain) {
    return next(new ApiError(400, 'This operation requires subdomain-based access'));
  }
  next();
}

/**
 * Middleware to require tenant context from either subdomain or JWT
 * Sets tenant context if not already set
 */
export async function ensureTenantContext(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    // If tenant context already set (from subdomain middleware), we're good
    const tenant = (req as any).tenant;
    if (tenant && tenant.schoolId) {
      return next();
    }

    // Try to get from JWT
    if (req.user && req.user.schoolId) {
      (req as any).tenant = {
        schoolId: req.user.schoolId,
        source: 'jwt'
      } as TenantContext;
      return next();
    }

    // No tenant context found
    return next(new ApiError(403, 'No school association found. Please login or access via school subdomain'));
  } catch (error) {
    console.error('Error in ensureTenantContext middleware:', error);
    next(error);
  }
}

/**
 * Helper to get tenant context from request
 */
export function getTenantContextFromRequest(req: any): TenantContext | null {
  return (req as any).tenant || null;
}

/**
 * Helper to get school data from subdomain resolution
 */
export function getSubdomainSchoolFromRequest(req: any): any | null {
  return (req as any).subdomainSchool || null;
}
