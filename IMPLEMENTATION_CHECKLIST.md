# Step-by-Step Implementation Checklist

## Phase 1: Database & Schema ✅ Week 1

### 1.1 Update Prisma Schema
**File**: `server/prisma/schema.prisma`

- [ ] Open the School model (around line 249)
- [ ] Add these three fields after `website` field:
```prisma
  subdomain           String?    @unique     // e.g., "zawadi"
  subdomainVerified   Boolean    @default(false)
  subdomainVerifiedAt DateTime?
```
- [ ] Save file
- [ ] Verify syntax (run `npm run prisma:generate`)

### 1.2 Create Migration
```bash
cd server
npm run prisma:migrate dev -- --name add_subdomain_to_school
```
- [ ] Enter migration name: `add_subdomain_to_school`
- [ ] Review generated migration file
- [ ] Migration should complete successfully
- [ ] Test: `npm run prisma:studio` → School table should show new fields

### 1.3 Update .env
- [ ] Add: `DEPLOYMENT_DOMAIN=example.com`
- [ ] Add: `SUBDOMAIN_ENABLED=true`
- [ ] Add: `SUBDOMAIN_CACHE_TTL=600`

**Verify**: `npx prisma db pull` shows updated schema

---

## Phase 2: Database Services ✅ Week 1-2

### 2.1 Create SubdomainService
**File**: `server/src/services/subdomain.service.ts`

Create with these methods:
- [ ] `validateSubdomain(subdomain: string)` - Check format, reserved words, uniqueness
- [ ] `resolveSubdomainToSchool(subdomain: string)` - Query DB or cache
- [ ] `buildSubdomainUrl(subdomain: string)` - Helper method
- [ ] Error handling for invalid/inactive schools

**Test**:
```typescript
const service = new SubdomainService();
const result = await service.validateSubdomain('zawadi');
// Should return { available: true, message: '...' }
```

### 2.2 Create Cache Helper
- [ ] Implement simple in-memory cache for development
- [ ] Add TTL support (configurable from env)
- [ ] Cache keys: `subdomain:schoolname`
- [ ] Methods: `get()`, `set()`, `clear()`, `invalidate()`

**For Production Later**: Replace with Redis

---

## Phase 3: Middleware Layer ✅ Week 2

### 3.1 Create extractSubdomain Middleware
**File**: `server/src/middleware/subdomain.middleware.ts`

```typescript
export function extractSubdomain(req: any, res, next) {
  const host = req.get('host') || '';
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  
  // Your implementation here
  // Sets req.subdomain and req.isTenantAccess
  
  next();
}
```

**Test Cases**:
- [ ] `zawadi.example.com` → `subdomain = "zawadi"`
- [ ] `localhost:5000` → `subdomain = null`
- [ ] `127.0.0.1:5000` → `subdomain = null`
- [ ] `example.com` → `subdomain = null`

### 3.2 Create subdomainAuth Middleware
**File**: `server/src/middleware/subdomain-auth.middleware.ts`

```typescript
export async function subdomainAuth(req: any, res, next) {
  // Resolve subdomain to school
  // Set req.subdomainSchool and req.tenant
  // Validate JWT if present
}
```

**Test Cases**:
- [ ] Valid subdomain → schoolId set correctly
- [ ] Invalid subdomain → 404 error
- [ ] Inactive school → 404 error
- [ ] JWT mismatch → 403 error
- [ ] No subdomain → pass to next middleware

### 3.3 Update Server Configuration
**File**: `server/src/server.ts`

- [ ] Import `extractSubdomain` middleware
- [ ] Add it early in pipeline: `app.use(extractSubdomain);`
- [ ] Update CORS configuration for wildcard subdomains
- [ ] Test CORS with OPTIONS request

**CORS Test**:
```bash
curl -X OPTIONS https://zawadi.example.com/api/learners \
  -H "Origin: https://zawadi.example.com"
```

---

## Phase 4: API Routes & Endpoints ✅ Week 2-3

### 4.1 Create Subdomain Routes
**File**: `server/src/routes/subdomain.routes.ts`

Create these endpoints:

- [ ] `POST /api/subdomains/check-availability`
  - Body: `{ subdomain: string }`
  - Returns: `{ available: boolean, message: string }`
  - Public endpoint (no auth)

- [ ] `GET /api/subdomains/:subdomain/branding`
  - Returns: School branding info
  - Public endpoint
  - Cached response

- [ ] `PUT /api/schools/:schoolId/subdomain`
  - Body: `{ subdomain: string }`
  - Protected (requires auth)
  - Validates ownership

- [ ] `POST /api/admin/schools/:schoolId/subdomain/enable`
  - Admin-only endpoint
  - Enables subdomain for any school

**Test Each Endpoint**:
```bash
# Check availability
curl -X POST http://localhost:5000/api/subdomains/check-availability \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "zawadi"}'

# Get branding
curl http://localhost:5000/api/subdomains/zawadi/branding

# Update subdomain (requires token)
curl -X PUT http://localhost:5000/api/schools/uuid-123/subdomain \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "zawadi"}'
```

### 4.2 Register Routes
**File**: `server/src/routes/index.ts`

- [ ] Import subdomain routes
- [ ] Register: `router.use('/subdomains', subdomainRoutes);`
- [ ] Place BEFORE protected routes

### 4.3 Update School Routes
**File**: `server/src/routes/school.routes.ts`

- [ ] Update `getMySchool()` to include subdomain info
- [ ] Return both access methods in response
- [ ] Example:
```typescript
{
  id: "uuid-123",
  name: "Zawadi Academy",
  subdomain: "zawadi",
  accessMethods: {
    pathBased: "/t/uuid-123",
    subdomainBased: "zawadi.example.com"
  }
}
```

---

## Phase 5: Frontend Integration ✅ Week 3

### 5.1 Create useSubdomain Hook
**File**: `src/hooks/useSubdomain.ts`

```typescript
export function useSubdomain() {
  const getSubdomain = useCallback(() => {
    // Your implementation
  }, []);
  
  const getAccessMode = useCallback(() => {
    // Return 'subdomain', 'path', or 'unknown'
  }, []);
  
  const getSchoolDomain = useCallback((subdomain) => {
    // Build full domain URL
  }, []);
  
  return { getSubdomain, getAccessMode, getSchoolDomain };
}
```

**Test**:
```jsx
// In development
const { getSubdomain } = useSubdomain();
console.log(getSubdomain()); // Should log subdomain or null
```

### 5.2 Create useSchoolBranding Hook
**File**: `src/hooks/useSchoolBranding.ts`

- [ ] Fetch tenant branding from new API
- [ ] Cache result in React state
- [ ] Support both access methods:
  - Path-based: Use schoolId from URL
  - Subdomain: Use server-returned branding

### 5.3 Update App.jsx
**File**: `src/App.jsx`

- [ ] Import new hooks
- [ ] Detect access method at app startup
- [ ] Fetch branding based on access method
- [ ] Pass branding to components

Example:
```jsx
function App() {
  const { getAccessMode, getSubdomain } = useSubdomain();
  const [branding, setBranding] = useState(null);
  
  useEffect(() => {
    const mode = getAccessMode();
    if (mode === 'subdomain') {
      const subdomain = getSubdomain();
      fetchBranding(subdomain);  // New API
    }
    // ... existing path-based logic
  }, []);
}
```

### 5.4 Update Login Component
**File**: `src/components/auth/LoginForm.jsx`

- [ ] Auto-detect school from subdomain
- [ ] Show school name/logo if available
- [ ] Simplify form (no school selector on subdomain)
- [ ] Keep school selector for path-based access

---

## Phase 6: Testing & Validation ✅ Week 3-4

### 6.1 Unit Tests

**Create**: `server/src/__tests__/subdomain.service.spec.ts`
- [ ] Test: `validateSubdomain()` with valid inputs
- [ ] Test: `validateSubdomain()` with reserved words
- [ ] Test: `validateSubdomain()` with special characters
- [ ] Test: `resolveSubdomainToSchool()` cache hit/miss
- [ ] Test: `resolveSubdomainToSchool()` inactive school

**Create**: `server/src/__tests__/subdomain.middleware.spec.ts`
- [ ] Test: Extract subdomain from host header
- [ ] Test: No subdomain on localhost
- [ ] Test: Resolve subdomain to schoolId
- [ ] Test: Reject invalid subdomain

### 6.2 Integration Tests

**Create**: `server/src/__tests__/subdomain.integration.spec.ts`

```typescript
describe('Subdomain Access', () => {
  it('GET /api/health via subdomain', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Host', 'zawadi.example.com');
    
    expect(res.status).toBe(200);
    expect(res.body.tenant?.schoolId).toBe(expectedSchoolId);
  });
  
  it('POST /api/subdomains/check-availability', async () => {
    const res = await request(app)
      .post('/api/subdomains/check-availability')
      .send({ subdomain: 'newschool' });
    
    expect(res.body.data.available).toBe(true);
  });
});
```

### 6.3 Manual Testing Checklist

**Local Development** (`localhost:5000`):
- [ ] Path-based access works: `http://localhost:5000/t/uuid-123/api/health`
- [ ] Subdomain via hosts file: Add `127.0.0.1  zawadi.localhost` to hosts file
- [ ] Test: `http://zawadi.localhost:5000/api/health` works
- [ ] Check cache: Call twice, verify cache hit (timing)

**Staging**:
- [ ] DNS record created: `*.staging.example.com → SERVER_IP`
- [ ] Wait 15-30 min for DNS propagation
- [ ] Test: `https://schoolname-staging.example.com/api/health`
- [ ] Verify CORS headers present
- [ ] Login via subdomain works

**Production**:
- [ ] DNS record created: `*.example.com → SERVER_IP`
- [ ] Wait for propagation
- [ ] HTTPS certificate valid for `*.example.com`
- [ ] Test: `https://schoolname.example.com/login`
- [ ] Full user flow: Login → Dashboard → Edit settings

---

## Phase 7: Documentation ✅ Week 4

### 7.1 Update README
- [ ] Add subdomain feature to overview
- [ ] Add DNS configuration instructions
- [ ] Add environment variables section
- [ ] Add local development setup with hosts file

### 7.2 API Documentation
- [ ] Document new endpoints in API docs
- [ ] Add examples for both access methods
- [ ] Document cache behavior
- [ ] Document error codes

### 7.3 Operations Guide
- [ ] DNS setup instructions per hosting provider
- [ ] Certificate configuration (wildcard SSL)
- [ ] Monitoring & troubleshooting section
- [ ] Rollback procedures

---

## Phase 8: Gradual Rollout ✅ Week 4+

### 8.1 Feature Flag
- [ ] Add `SUBDOMAIN_ENABLED` env variable
- [ ] Wrap new endpoints in feature flag
- [ ] Can disable quickly if issues arise

### 8.2 Soft Launch
- [ ] Enable for development/staging only
- [ ] Monitor for 1 week
- [ ] Check performance metrics:
  - Cache hit rate (should be >90%)
  - Response time (should be <100ms overhead)
  - Error rate (should be <0.1%)

### 8.3 Production Release
- [ ] Enable for existing admin/pilot schools first
- [ ] Monitor for 1 week
- [ ] Public announcement
- [ ] Gradual rollout to all schools

### 8.4 Monitoring
- [ ] Set up alerts for:
  - [ ] High cache miss rate
  - [ ] Slow subdomain resolution (>50ms)
  - [ ] CORS errors
  - [ ] Failed subdomain validations
  
- [ ] Track adoption metrics:
  - [ ] % schools with subdomains enabled
  - [ ] Subdomain access vs path-based access
  - [ ] User satisfaction/engagement

---

## Common Issues During Implementation

### Issue: "Subdomain not resolving"
**Debug Steps**:
1. [ ] Check extractSubdomain middleware is first
2. [ ] Check host header is being parsed: `console.log(req.get('host'))`
3. [ ] Check hosts file (if local): `cat /etc/hosts` or Windows hosts file
4. [ ] Check DEPLOYMENT_DOMAIN env variable

### Issue: "CORS error on subdomain requests"
**Debug Steps**:
1. [ ] Verify CORS configuration includes wildcard pattern
2. [ ] Check Origin header in request
3. [ ] Verify regex pattern: `console.log(subdomainPattern.test(origin))`
4. [ ] Test OPTIONS request: `curl -X OPTIONS`

### Issue: "JWT schoolId doesn't match subdomain schoolId"
**Debug Steps**:
1. [ ] Decode JWT: `console.log(req.user)`
2. [ ] Check subdomainSchool: `console.log(req.subdomainSchool)`
3. [ ] Verify user belongs to school in DB
4. [ ] Check cache isn't stale

### Issue: "Performance degradation"
**Debug Steps**:
1. [ ] Check cache hit rate: `console.log(cache.stats())`
2. [ ] Monitor DB queries: Add logging in SubdomainService
3. [ ] Check Prisma indexes created properly
4. [ ] Profile middleware execution time

---

## Sign-Off Checklist

### Before Marking Complete:
- [ ] All phases completed and tested
- [ ] No breaking changes to path-based access
- [ ] Both access methods work simultaneously
- [ ] Performance metrics acceptable
- [ ] Documentation complete
- [ ] Code reviewed and approved
- [ ] Production deployment plan finalized
- [ ] Team trained on new feature
- [ ] Customer communication ready

---

## Contact for Help

**Questions during implementation?**
- Review [SUBDOMAIN_IMPLEMENTATION_PLAN.md](./SUBDOMAIN_IMPLEMENTATION_PLAN.md) for details
- Check [PATH_VS_SUBDOMAIN_COMPARISON.md](./PATH_VS_SUBDOMAIN_COMPARISON.md) for examples
- Review [SUBDOMAIN_QUICK_REFERENCE.md](./SUBDOMAIN_QUICK_REFERENCE.md) for API examples

