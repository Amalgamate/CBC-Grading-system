import prisma from '../config/database';
import { ApiError } from '../utils/error.util';

/**
 * Simple in-memory cache for subdomain lookups
 * TTL: Configurable via environment variable
 */
class SimpleCache<T> {
  private cache = new Map<string, { data: T; expiresAt: number }>();

  set(key: string, data: T, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { data, expiresAt });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return { size: this.cache.size };
  }
}

interface SchoolData {
  id: string;
  name: string;
  active: boolean;
  archived: boolean;
  subdomain?: string | null;
  subdomainVerified: boolean;
  subdomainVerifiedAt?: Date | null;
  logoUrl: string | null;
  faviconUrl: string | null;
}

interface SubdomainValidationResult {
  available: boolean;
  message: string;
}

/**
 * SubdomainService
 * Handles all subdomain-related operations for multi-tenant system
 */
export class SubdomainService {
  private cache: SimpleCache<SchoolData>;
  private cacheTTL: number;
  private reservedWords: Set<string>;

  constructor() {
    this.cacheTTL = parseInt(process.env.SUBDOMAIN_CACHE_TTL || '600', 10); // 10 minutes default
    this.cache = new SimpleCache<SchoolData>();
    
    // Parse reserved words from env
    const reserved = process.env.SUBDOMAIN_RESERVED_WORDS || 'www,api,mail,admin,support,blog,contact,help,docs,status';
    this.reservedWords = new Set(reserved.split(',').map(w => w.trim().toLowerCase()));
  }

  /**
   * Validate subdomain format and availability
   * Returns: { available: boolean, message: string }
   */
  async validateSubdomain(subdomain: string): Promise<SubdomainValidationResult> {
    // null/undefined check
    if (!subdomain || typeof subdomain !== 'string') {
      return {
        available: false,
        message: 'Subdomain is required and must be a string'
      };
    }

    const trimmed = subdomain.trim().toLowerCase();

    // Length check (2-63 chars per RFC 1123)
    if (trimmed.length < 2 || trimmed.length > 63) {
      return {
        available: false,
        message: 'Subdomain must be between 2 and 63 characters'
      };
    }

    // Format check: only lowercase letters, numbers, and hyphens
    // Must start and end with alphanumeric
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(trimmed)) {
      return {
        available: false,
        message: 'Only lowercase letters, numbers, and hyphens allowed. Must start and end with letter/number'
      };
    }

    // Reserved words check
    if (this.reservedWords.has(trimmed)) {
      return {
        available: false,
        message: `"${trimmed}" is a reserved subdomain and cannot be used`
      };
    }

    // Check if already in database
    const existing = await ((prisma.school as any).findUnique({
      where: { subdomain: trimmed },
      select: { id: true }
    })) as any;

    if (existing) {
      return {
        available: false,
        message: 'This subdomain is already taken'
      };
    }

    return {
      available: true,
      message: 'Subdomain is available'
    };
  }

  /**
   * Resolve subdomain to School ID
   * Checks cache first, then database
   * Returns null if not found or inactive
   */
  async resolveSubdomainToSchool(subdomain: string): Promise<SchoolData | null> {
    if (!subdomain) return null;

    const lowerSubdomain = subdomain.toLowerCase();
    const cacheKey = `subdomain:${lowerSubdomain}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Query database
    try {
      const school = await ((prisma.school as any).findUnique({
        where: { subdomain: lowerSubdomain },
        select: {
          id: true,
          name: true,
          active: true,
          archived: true,
          subdomain: true,
          subdomainVerified: true,
          subdomainVerifiedAt: true,
          logoUrl: true,
          faviconUrl: true
        }
      })) as any;

      if (!school || !school.active || school.archived) {
        return null;
      }

      // Cache the result
      this.cache.set(cacheKey, school as SchoolData, this.cacheTTL);

      return school as SchoolData;
    } catch (error) {
      console.error('Error resolving subdomain:', error);
      return null;
    }
  }

  /**
   * Update school with new subdomain
   * Used when school admin sets their subdomain
   */
  async updateSchoolSubdomain(schoolId: string, subdomain: string): Promise<any> {
    // Validate subdomain
    const validation = await this.validateSubdomain(subdomain);
    if (!validation.available) {
      throw new ApiError(400, validation.message);
    }

    const lowerSubdomain = subdomain.toLowerCase();

    try {
      const updated = await ((prisma.school as any).update({
        where: { id: schoolId },
        data: {
          subdomain: lowerSubdomain,
          subdomainVerified: false, // Re-verify after change
          subdomainVerifiedAt: null
        },
        select: {
          id: true,
          name: true,
          subdomain: true,
          subdomainVerified: true
        }
      })) as any;

      // Invalidate cache
      this.invalidateSchoolCache(schoolId, subdomain);

      return updated;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ApiError(400, 'This subdomain is already in use');
      }
      throw error;
    }
  }

  /**
   * Generate subdomain from school name
   * Converts "Zawadi Academy" → "zawadi" or "kampala-high-school" → "kampala-high"
   */
  generateSubdomainFromName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
      .substring(0, 63); // Max 63 chars
  }

  /**
   * Auto-assign subdomain to new school
   * Generates from name, ensures uniqueness with counter if needed
   */
  async autoAssignSubdomain(schoolName: string): Promise<string> {
    let subdomain = this.generateSubdomainFromName(schoolName);
    let counter = 1;
    let original = subdomain;

    // Check availability and add counter if taken
    while (true) {
      const validation = await this.validateSubdomain(subdomain);
      if (validation.available) {
        return subdomain;
      }
      subdomain = `${original}${counter}`;
      counter++;
      if (counter > 100) {
        throw new ApiError(400, 'Could not generate unique subdomain');
      }
    }
  }

  /**
   * Enable subdomain for school (SUPER_ADMIN only)
   * Marks subdomain as verified
   */
  async enableSubdomain(schoolId: string, subdomain: string): Promise<any> {
    const validation = await this.validateSubdomain(subdomain);
    if (!validation.available) {
      throw new ApiError(400, validation.message);
    }

    const lowerSubdomain = subdomain.toLowerCase();

    const updated = await ((prisma.school as any).update({
      where: { id: schoolId },
      data: {
        subdomain: lowerSubdomain,
        subdomainVerified: true,
        subdomainVerifiedAt: new Date()
      }
    })) as any;

    // Invalidate cache
    this.invalidateSchoolCache(schoolId, lowerSubdomain);

    return updated;
  }

  /**
   * Invalidate cache for school
   */
  private invalidateSchoolCache(schoolId: string, subdomain?: string): void {
    if (subdomain) {
      this.cache.invalidate(`subdomain:${subdomain.toLowerCase()}`);
    }
  }

  /**
   * Get cache statistics (for monitoring)
   */
  getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Clear all cache (use with caution, usually only during testing)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Build full subdomain URL
   */
  buildSubdomainUrl(subdomain: string, path: string = ''): string {
    const domain = process.env.DEPLOYMENT_DOMAIN || 'elimcrown.co.ke';
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const port = process.env.NODE_ENV === 'development' ? `:${process.env.PORT || 5000}` : '';
    
    return `${protocol}://${subdomain}.${domain}${port}${path}`;
  }
}

// Export singleton instance
export const subdomainService = new SubdomainService();
