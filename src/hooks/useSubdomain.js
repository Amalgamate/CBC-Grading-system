import { useCallback, useMemo } from 'react';

/**
 * Hook for subdomain detection and management
 * Detects whether the user accessed via path-based or subdomain-based URL
 */
export function useSubdomain() {
    /**
     * Get subdomain from hostname
     */
    const getSubdomain = useCallback(() => {
        const hostname = window.location.hostname;

        // No subdomain for localhost or IP addresses
        if (
            hostname === 'localhost' ||
            hostname.startsWith('127.') ||
            hostname.match(/^\d+\.\d+\.\d+\.\d+$/) // IPv4
        ) {
            return null;
        }

        const parts = hostname.split('.');

        // No subdomain for root domain (example.com = 2 parts)
        if (parts.length <= 2) {
            return null;
        }

        // Extract subdomain (first part)
        const subdomain = parts[0].toLowerCase();

        // Filter out common non-tenant prefixes
        const commonPrefixes = ['www', 'mail', 'ftp', 'smtp', 'pop', 'imap'];
        if (commonPrefixes.includes(subdomain)) {
            return null;
        }

        return subdomain;
    }, []);

    /**
     * Get access mode: subdomain, path, or unknown
     */
    const getAccessMode = useCallback(() => {
        const subdomain = getSubdomain();
        const pathname = window.location.pathname;

        // Check for subdomain access
        if (subdomain) {
            return 'subdomain';
        }

        // Check for path-based access: /t/schoolid
        const pathMatch = pathname.match(/^\/t\/([a-z0-9-]+)/i);
        if (pathMatch) {
            return 'path';
        }

        return 'unknown';
    }, [getSubdomain]);

    /**
     * Get school ID from access method
     */
    const getSchoolIdFromUrl = useCallback(() => {
        const subdomain = getSubdomain();
        if (subdomain) {
            // For subdomain, we need to fetch the schoolId from branding API
            // or get it from user context
            return null; // Will be populated by useSchoolBranding
        }

        const pathname = window.location.pathname;
        const pathMatch = pathname.match(/^\/t\/([a-z0-9-]+)/i);
        return pathMatch ? pathMatch[1] : null;
    }, [getSubdomain]);

    /**
     * Build full domain URL for subdomain
     */
    const getSchoolDomain = useCallback((subdomain) => {
        const baseUrl = process.env.REACT_APP_DEPLOYMENT_DOMAIN || 'elimcrown.co.ke';
        const protocol = window.location.protocol;
        const port = window.location.port ? `:${window.location.port}` : '';

        return `${protocol}//${subdomain}.${baseUrl}${port}`;
    }, []);

    /**
     * Get full path URL for subdomain
     */
    const getSchoolPathUrl = useCallback((subdomain, path = '') => {
        const domain = getSchoolDomain(subdomain);
        return `${domain}${path}`;
    }, [getSchoolDomain]);

    /**
     * Check if currently on a subdomain
     */
    const isTenantAccess = useMemo(() => {
        return getAccessMode() === 'subdomain';
    }, [getAccessMode]);

    /**
     * Get current subdomain (memoized)
     */
    const currentSubdomain = useMemo(() => {
        return getSubdomain();
    }, [getSubdomain]);

    /**
     * Get current access mode (memoized)
     */
    const currentAccessMode = useMemo(() => {
        return getAccessMode();
    }, [getAccessMode]);

    return {
        subdomain: currentSubdomain,
        accessMode: currentAccessMode,
        isTenantAccess,
        getSubdomain,
        getAccessMode,
        getSchoolIdFromUrl,
        getSchoolDomain,
        getSchoolPathUrl
    };
}

/**
 * Hook to fetch and manage school branding info
 * Works with both subdomain and path-based access methods
 */
export function useSchoolBranding() {
    const { subdomain, isTenantAccess, getSchoolIdFromUrl } = useSubdomain();
    const schoolId = getSchoolIdFromUrl();

    const getBrandingUrl = useCallback(() => {
        if (subdomain && isTenantAccess) {
            // Subdomain-based: fetch from API with subdomain
            return `/api/subdomains/${subdomain}/branding`;
        } else if (schoolId) {
            // Path-based: fetch from tenants API with schoolId
            return `/api/tenants/public/${schoolId}`;
        }
        return null;
    }, [subdomain, isTenantAccess, schoolId]);

    return {
        schoolId,
        subdomain,
        isTenantAccess,
        brandingUrl: getBrandingUrl()
    };
}

/**
 * Hook for subdomain availability checking
 */
export function useSubdomainCheck() {
    const checkAvailability = useCallback(async (subdomain) => {
        try {
            const response = await fetch('/api/subdomains/check-availability', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subdomain })
            });

            if (!response.ok) {
                throw new Error('Failed to check subdomain');
            }

            const { data } = await response.json();
            return data;
        } catch (error) {
            console.error('Error checking subdomain:', error);
            return { available: false, message: 'Error checking availability' };
        }
    }, []);

    const suggestSubdomain = useCallback(async (schoolName) => {
        try {
            const response = await fetch('/api/subdomains/suggest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schoolName })
            });

            if (!response.ok) {
                throw new Error('Failed to suggest subdomain');
            }

            const { data } = await response.json();
            return data;
        } catch (error) {
            console.error('Error suggesting subdomain:', error);
            return null;
        }
    }, []);

    return { checkAvailability, suggestSubdomain };
}
