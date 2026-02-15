import { Request, Response, NextFunction } from 'express';

/**
 * Extended Request with subdomain context
 */
export interface SubdomainRequest extends Request {
  subdomain?: string;
  isTenantAccess?: boolean; // true if accessed via subdomain
}

/**
 * Middleware to extract subdomain from host header
 * 
 * Parses the host header and extracts subdomain if present
 * 
 * Examples:
 * - host: "zawadi.elimcrown.co.ke" → subdomain: "zawadi"
 * - host: "localhost:5000" → subdomain: null
 * - host: "127.0.0.1:5000" → subdomain: null
 * - host: "elimcrown.co.ke" → subdomain: null
 */
export function extractSubdomain(req: SubdomainRequest, res: Response, next: NextFunction): void {
  try {
    const host = req.get('host') || '';

    // Remove port from host
    const hostname = host.split(':')[0].toLowerCase();

    // Split into parts
    const parts = hostname.split('.');

    // 1. Handle localhost/IPs
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.match(/^\d+\.\d+\.\d+\.\d+$/) // IPv4
    ) {
      req.subdomain = undefined;
      req.isTenantAccess = false;
      return next();
    }

    // 2. Configuration
    const deploymentDomain = (process.env.DEPLOYMENT_DOMAIN || 'elimcrown.co.ke').toLowerCase();
    const commonPrefixes = ['www', 'mail', 'ftp', 'api', 'elimcrown-api'];

    // 3. Exact match for platform domains (Root levels)
    const isRootDomain = hostname === deploymentDomain ||
      hostname === 'onrender.com' ||
      hostname === 'elimcrown-api.onrender.com';

    if (isRootDomain) {
      req.subdomain = undefined;
      req.isTenantAccess = false;
      return next();
    }

    // 4. Detect tenant subdomain from platform domain
    // Pattern: {subdomain}.elimcrown.co.ke
    if (hostname.endsWith(`.${deploymentDomain}`)) {
      const subdomain = hostname.replace(`.${deploymentDomain}`, '');

      if (commonPrefixes.includes(subdomain)) {
        req.subdomain = undefined;
        req.isTenantAccess = false;
      } else {
        req.subdomain = subdomain;
        req.isTenantAccess = true;
      }
      return next();
    }

    // 5. Fallback for OnRender direct URLs
    // Patterns: elimcrown-api.onrender.com (Root), or school.onrender.com (Tenant)
    if (hostname.endsWith('.onrender.com')) {
      const subdomain = hostname.replace('.onrender.com', '');

      if (subdomain === 'elimcrown-api' || commonPrefixes.includes(subdomain)) {
        req.subdomain = undefined;
        req.isTenantAccess = false;
      } else {
        req.subdomain = subdomain;
        req.isTenantAccess = true;
      }
      return next();
    }

    // 6. Default: No subdomain detected
    req.subdomain = undefined;
    req.isTenantAccess = false;
    next();
  } catch (error) {
    // Fall through to next middleware on error
    console.error('Error in extractSubdomain middleware:', error);
    req.subdomain = undefined;
    req.isTenantAccess = false;
    next();
  }
}

/**
 * Middleware to parse subdomain from URL path as fallback
 * Used for path-based access: /t/:schoolId/...
 */
export function extractPathTenant(req: SubdomainRequest, res: Response, next: NextFunction): void {
  try {
    // If subdomain already detected, skip
    if (req.isTenantAccess) {
      return next();
    }

    const pathname = req.path;

    // Match pattern: /t/schoolid or /t/schoolid-branchid
    const match = pathname.match(/^\/t\/([a-f0-9-]+)/i);

    if (match) {
      // Store in different property so we know it came from path
      (req as any).pathTenant = {
        schoolId: match[1]
      };
    }

    next();
  } catch (error) {
    console.error('Error in extractPathTenant middleware:', error);
    next();
  }
}
