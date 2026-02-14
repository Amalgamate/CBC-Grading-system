# Multi-Tenant Subdomain Implementation Plan

## Overview
Transform your multi-tenant system from **path-based** (`/t/:schoolId/...`) to **subdomain-based** access (`schoolname.example.com`), while maintaining backward compatibility with the existing path-based approach.

---

## Current State Analysis

### ✅ What You Have
- **Path-based tenancy**: `/t/:schoolId/...`
- **JWT-based tenant context**: `schoolId` in token
- **Prisma tenant middleware**: Auto-filters by `schoolId`
- **School model**: Has all school data (name, email, etc.)
- **CORS configuration**: Whitelist approach for localhost

### ❌ What's Missing
- **Subdomain field**: School model lacks subdomain identifier
- **Subdomain extraction middleware**: No header/host parsing
- **Subdomain → SchoolId resolution**: No lookup mechanism
- **Wildcard CORS support**: No `*.example.com` configuration
- **Branding by subdomain**: Tenant detection in frontend

---

## Implementation Phases

### 🟦 Phase 1: Database & Schema Updates (16 hours)

#### 1.1 Add Subdomain Field to School Model
**File**: `server/prisma/schema.prisma`

**Changes**:
```prisma
model School {
  // ... existing fields ...
  
  // NEW: Subdomain for tenant-first access
  subdomain      String?    @unique    // e.g., "zawadi", "kampala-high"
  subdomainVerified Boolean @default(false)
  subdomainVerifiedAt DateTime?
  
  // ... rest of fields ...
}
```

**Rationale**:
- `subdomain`: Unique identifier for URL access (max 63 chars, alphanumeric + hyphen)
- `subdomainVerified`: Allows deferred domain validation
- `subdomainVerifiedAt`: Audit trail

#### 1.2 Create Migration
```bash
npm run prisma:migrate
# Migration name: "add_subdomain_to_school"
```

**Migration Content**:
- Add columns to `School` table
- Create unique index on `subdomain` (nullable)
- Create composite index on `(active, archived, subdomain)`

---

### 🟦 Phase 2: Backend Middleware & Services (20 hours)

#### 2.1 Create Subdomain Extraction Middleware
**File**: `server/src/middleware/subdomain.middleware.ts`

**Functionality**:
```typescript
// Extract subdomain from host header
// host: "zawadi.example.com" → subdomain: "zawadi"
// host: "localhost:5000" → subdomain: null
// host: "example.com" → subdomain: null

export interface SubdomainRequest extends Request {
  subdomain?: string;
  isTenantAccess?: boolean;  // true if accessed via subdomain, false if path-based
}

export function extractSubdomain(req: SubdomainRequest, res, next) {
  const host = req.get('host') || '';
  const hostname = host.split(':')[0]; // Remove port
  
  // Parse subdomain
  const parts = hostname.split('.');
  
  if (hostname === 'localhost' || 
      hostname.startsWith('127.') ||
      parts.length <= 2) {
    // No subdomain
    req.subdomain = null;
    req.isTenantAccess = false;
    return next();
  }
  
  // Extract subdomain (first part)
  req.subdomain = parts[0].toLowerCase();
  req.isTenantAccess = true;
  
  next();
}
```

#### 2.2 Create Subdomain Resolution Service
**File**: `server/src/services/subdomain.service.ts`

**Functionality**:
```typescript
export class SubdomainService {
  /**
   * Resolve subdomain to School ID
   * Uses caching to minimize DB queries (10-minute TTL)
   */
  async resolveSubdomainToSchool(subdomain: string) {
    const cacheKey = `subdomain:${subdomain}`;
    
    // Check cache first
    const cached = await this.cache.get(cacheKey);
    if (cached) return cached;
    
    // Query database
    const school = await prisma.school.findUnique({
      where: { subdomain },
      select: {
        id: true,
        name: true,
        active: true,
        archived: true,
        subdomainVerified: true
      }
    });
    
    if (!school || !school.active || school.archived) {
      return null;
    }
    
    // Cache result
    await this.cache.set(cacheKey, school, 600); // 10 minutes
    
    return school;
  }
  
  /**
   * Validate subdomain availability
   * Returns: { available: boolean, message: string }
   */
  async validateSubdomain(subdomain: string) {
    // Rules
    if (!subdomain || subdomain.length < 2 || subdomain.length > 63) {
      return { available: false, message: 'Subdomain must be 2-63 characters' };
    }
    
    if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(subdomain)) {
      return { available: false, message: 'Only lowercase letters, numbers, and hyphens allowed' };
    }
    
    // Reserved subdomains
    const reserved = ['www', 'api', 'mail', 'admin', 'support', 'blog'];
    if (reserved.includes(subdomain)) {
      return { available: false, message: 'This subdomain is reserved' };
    }
    
    // Check in database
    const existing = await prisma.school.findUnique({
      where: { subdomain }
    });
    
    if (existing) {
      return { available: false, message: 'Subdomain already taken' };
    }
    
    return { available: true, message: 'Subdomain is available' };
  }
}
```

#### 2.3 Create Subdomain Authentication Middleware
**File**: `server/src/middleware/subdomain-auth.middleware.ts`

**Functionality**:
```typescript
/**
 * Middleware to:
 * 1. Extract subdomain from host header
 * 2. Resolve to School ID if present
 * 3. Auto-set tenant context for subdomain-based access
 * 4. Validate subdomain ownership (optional JWT check)
 */
export async function subdomainAuth(req: any, res, next) {
  const subdomain = req.subdomain;
  
  if (!subdomain || !req.isTenantAccess) {
    return next(); // No subdomain, continue normally
  }
  
  // Resolve subdomain to school
  const school = await subdomainService.resolveSubdomainToSchool(subdomain);
  
  if (!school) {
    return next(new ApiError(404, 'Tenant not found'));
  }
  
  // Store school info in request
  req.subdomainSchool = school;
  
  // For authenticated requests, verify JWT schoolId matches subdomain
  if (req.user && req.user.schoolId !== school.id) {
    return next(new ApiError(403, 'Access denied: Invalid tenant'));
  }
  
  // Set tenant context
  req.tenant = {
    schoolId: school.id,
    source: 'subdomain'
  };
  
  next();
}
```

#### 2.4 Update Server Configuration
**File**: `server/src/server.ts`

**Changes**:
```typescript
// CORS Configuration - Support Wildcard Subdomains
const allowedOrigins = [
  // Exact origins (for localhost dev)
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  // Production domain
  process.env.FRONTEND_URL || '',
  // Wildcard subdomains (if deployment domain set)
  ...(process.env.DEPLOYMENT_DOMAIN ? [
    `https://${process.env.DEPLOYMENT_DOMAIN}`,
    `https://*.${process.env.DEPLOYMENT_DOMAIN}` // Wildcard pattern
  ] : [])
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    // Check exact matches
    if (allowedOrigins.includes(origin)) return callback(null, true);
    
    // Check localhost
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    
    // Check wildcard pattern
    if (process.env.DEPLOYMENT_DOMAIN) {
      const domainPattern = new RegExp(
        `https://([a-z0-9-]+\\.)?${process.env.DEPLOYMENT_DOMAIN.replace(/\./g, '\\.')}$`
      );
      if (domainPattern.test(origin)) return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

// Add subdomain extraction middleware (early in pipeline, before auth)
app.use(extractSubdomain);
```

---

### 🟦 Phase 3: API Endpoints (12 hours)

#### 3.1 Create Subdomain Management Endpoints
**File**: `server/src/routes/subdomain.routes.ts`

**Endpoints**:
```typescript
const router = Router();

// PUBLIC: Check subdomain availability
router.post('/check-availability', asyncHandler(async (req, res) => {
  const { subdomain } = req.body;
  const result = await subdomainService.validateSubdomain(subdomain);
  res.json({ success: true, data: result });
}));

// PUBLIC: Get tenant branding by subdomain
router.get('/:subdomain/branding', asyncHandler(async (req, res) => {
  const school = await subdomainService.resolveSubdomainToSchool(req.params.subdomain);
  if (!school) throw new ApiError(404, 'Tenant not found');
  
  res.json({ success: true, data: {
    schoolId: school.id,
    schoolName: school.name,
    logoUrl: school.logoUrl,
    faviconUrl: school.faviconUrl
  }});
}));

// PROTECTED: Update school subdomain
router.put('/:schoolId/subdomain', 
  authenticate, 
  requireTenant, 
  asyncHandler(async (req, res) => {
    const { subdomain } = req.body;
    const { schoolId } = req.params;
    
    // Verify ownership
    if (req.tenant.schoolId !== schoolId) {
      throw new ApiError(403, 'Access denied');
    }
    
    // Validate subdomain
    const validation = await subdomainService.validateSubdomain(subdomain);
    if (!validation.available) {
      throw new ApiError(400, validation.message);
    }
    
    // Update school
    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: { subdomain }
    });
    
    res.json({ success: true, data: updated });
  }));

// SUPER_ADMIN: Enable subdomain for tenant
router.post('/:schoolId/enable', 
  authenticate,
  authorize('SUPER_ADMIN'),
  asyncHandler(async (req, res) => {
    const { subdomain } = req.body;
    const { schoolId } = req.params;
    
    // Validate & update
    const validation = await subdomainService.validateSubdomain(subdomain);
    if (!validation.available) {
      throw new ApiError(400, validation.message);
    }
    
    const updated = await prisma.school.update({
      where: { id: schoolId },
      data: { 
        subdomain,
        subdomainVerified: true,
        subdomainVerifiedAt: new Date()
      }
    });
    
    res.json({ success: true, data: updated });
  }));

export default router;
```

#### 3.2 Update School Routes
**File**: `server/src/routes/school.routes.ts`

**Add to School Controller**:
```typescript
// Get school with subdomain info
getMySchool = asyncHandler(async (req: AuthRequest, res) => {
  const { schoolId } = req.tenant;
  
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      branches: { where: { active: true } },
      subscriptions: { where: { status: 'ACTIVE' } }
    }
  });
  
  if (!school) throw new ApiError(404, 'School not found');
  
  res.json({ 
    success: true, 
    data: {
      ...school,
      accessMethods: {
        pathBased: `/t/${schoolId}`,
        subdomainBased: school.subdomain ? `${school.subdomain}.${process.env.DEPLOYMENT_DOMAIN}` : null
      }
    }
  });
});
```

---

### 🟦 Phase 4: Frontend Integration (10 hours)

#### 4.1 Create Subdomain Detection Hook
**File**: `src/hooks/useSubdomain.ts`

```typescript
export function useSubdomain() {
  const getSubdomain = useCallback(() => {
    const hostname = window.location.hostname;
    
    if (hostname === 'localhost' || hostname.startsWith('127.')) {
      return null;
    }
    
    const parts = hostname.split('.');
    if (parts.length <= 2) return null; // No subdomain
    
    return parts[0].toLowerCase();
  }, []);
  
  const getAccessMode = useCallback(() => {
    // Check if accessed via subdomain or path
    const subdomain = getSubdomain();
    const pathMatch = window.location.pathname.match(/^\/t\/([a-z0-9-]+)/);
    
    if (subdomain && !pathMatch) {
      return 'subdomain';
    }
    return 'path';
  }, [getSubdomain]);
  
  return { getSubdomain, getAccessMode };
}
```

#### 4.2 Update App.jsx
**Key changes**:
```jsx
// Detect access mode
const subdomain = useSubdomain().getSubdomain();
const accessMode = useSubdomain().getAccessMode();

// Fetch tenant branding based on access mode
useEffect(() => {
  if (subdomain && accessMode === 'subdomain') {
    // Fetch branding from /api/subdomains/:subdomain/branding
    fetchTenantBranding(subdomain);
  } else {
    // Existing path-based logic
    const { schoolId } = parseTenantFromPath(pathname);
    if (schoolId) fetchTenantBranding(schoolId);
  }
}, [subdomain, accessMode, pathname]);
```

---

### 🟦 Phase 5: Security & Performance (14 hours)

#### 5.1 Add Caching Layer
**File**: `server/src/config/cache.service.ts`

```typescript
// Use Redis or in-memory cache with TTL
class CacheService {
  // Cache subdomain resolutions for 10 minutes
  // Cache branding info for 1 hour
  // Invalidate cache on school update
}
```

#### 5.2 Rate Limiting
```typescript
// Rate limit subdomain lookups
router.get('/:subdomain/branding', 
  rateLimit(100, 60_000), // 100 per minute
  subdomainHandler
);
```

#### 5.3 Security Headers
```typescript
// Add security headers for subdomain cookies
app.use(helmet({
  frameguard: { action: 'deny' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      // Allow subdomains if needed
      childSrc: [`https://*.${process.env.DEPLOYMENT_DOMAIN}`]
    }
  }
}));
```

---

### 🟦 Phase 6: Documentation & Testing (10 hours)

#### 6.1 Create API Documentation
- Document subdomain endpoints
- Add examples for both access methods
- Document DNS setup requirements

#### 6.2 Testing
```bash
# Unit tests
jest --testPathPattern="subdomain"

# Integration tests
- Test subdomain resolution
- Test access control
- Test CORS wildcard
```

---

## Database Migration Path

### Step 1: Add Subdomain Field
```bash
npm run prisma:migrate
```

### Step 2: Populate Subdomains (Optional Batch Job)
```typescript
// Auto-generate subdomains from school names
const schools = await prisma.school.findMany({
  where: { subdomain: null }
});

for (const school of schools) {
  const suggested = generateSubdomainFromName(school.name);
  // Mark for manual review or auto-assign
}
```

---

## Environment Variables

Add to `.env`:
```bash
# Deployment domain for wildcard CORS
DEPLOYMENT_DOMAIN=example.com

# Subdomain settings
SUBDOMAIN_ENABLED=true
SUBDOMAIN_CACHE_TTL=600  # 10 minutes

# DNS Configuration (for documentation)
# *.example.com A-record → your server IP
# example.com A-record → your server IP
```

---

## DNS Configuration (For Production)

### Required DNS Records
```
# Wildcard subdomain routing
*.example.com    A    YOUR_SERVER_IP
example.com      A    YOUR_SERVER_IP

# Examples:
zawadi.example.com      → resolves to your server
kampala-high.example.com → resolves to your server
localhost:5000          → uses port-based routing
```

---

## Access Methods (After Implementation)

### Path-Based (Existing)
```
https://example.com/t/school-uuid-123/dashboard
```

### Subdomain-Based (New)
```
https://schoolname.example.com/dashboard
```

### Key Behaviors
- Both methods work simultaneously (backward compatible)
- JWT token contains `schoolId` regardless of access method
- Tenant middleware validates consistency
- Frontend auto-detects access method

---

## Rollout Plan

### Week 1-2: Development & Testing
- [ ] Implement all Phase 1-3 changes
- [ ] Add comprehensive tests
- [ ] Test in staging environment

### Week 3: Soft Launch
- [ ] Enable for new schools only
- [ ] Monitor for issues
- [ ] Gather feedback

### Week 4: Full Rollout
- [ ] Enable for existing schools
- [ ] Migrate optional (not forced)
- [ ] Keep path-based method as fallback

---

## Monitoring & Rollback

### Keep These Metrics
- Subdomain resolution time (should be <10ms with cache)
- CORS errors on wildcard subdomains
- Failed subdomain lookups
- Subdomain adoption rate

### Rollback Plan
- Disable subdomain middleware via feature flag
- Keep database fields for future re-enabling
- Both methods can coexist indefinitely

---

## Security Checklist

- ✅ Validate subdomain format (RFC 1123 compliant)
- ✅ Rate limit subdomain resolution
- ✅ Cache with TTL to prevent enumeration
- ✅ Verify JWT schoolId matches subdomain school
- ✅ Support HTTPS only in production
- ✅ Add security headers for subdomain cookies
- ✅ Audit log all subdomain changes
- ✅ Prevent wildcard CORS in production (explicit check)

---

## Questions Before Starting?

1. **Deployment Domain**: What will be your main domain? (e.g., app.transaqua.com)
2. **DNS Control**: Will you manage DNS or delegate to hosting provider?
3. **Existing Schools**: Should all existing schools get optional subdomains?
4. **School Input**: Should schools choose their own subdomain or auto-generated?
5. **Phase Priority**: Which phases are most urgent for your business?

