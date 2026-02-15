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

    // Check if we have a subdomain
    // - localhost or 127.x.x.x have no subdomains
    // - single part (localhost) has no subdomain
    // - two parts (example.com) has no subdomain  
    // - 3+ parts (sub.example.com) has subdomain
    
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.match(/^\d+\.\d+\.\d+\.\d+$/) // IPv4
    ) {
      // No subdomain for localhost or IP addresses
      req.subdomain = undefined;
      req.isTenantAccess = false;
      return next();
    }

    if (parts.length <= 2) {
      // No subdomain for root domain
      req.subdomain = undefined;
      req.isTenantAccess = false;
      return next();
    }

    // Extract subdomain (first part)
    const subdomain = parts[0].toLowerCase();
    
    // Validate subdomain isn't a common non-tenant prefix
    const commonPrefixes = ['www', 'mail', 'ftp', 'smtp', 'pop', 'imap'];
    if (commonPrefixes.includes(subdomain)) {
      req.subdomain = undefined;
      req.isTenantAccess = false;
      return next();
    }

    // We have a valid subdomain
    req.subdomain = subdomain;
    req.isTenantAccess = true;

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
