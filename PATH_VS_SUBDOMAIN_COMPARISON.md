# Path-Based vs Subdomain-Based Access: Comparison Guide

## Access Method Comparison

### 1. Path-Based (Current Implementation)
```
URL Format:     https://example.com/t/:schoolId/dashboard
DNS Required:   Only domain root (example.com)
Tenant Parsing: Extract from URL path
Database Check: Yes, validate schoolId exists
School Lookup:  JWT token contains schoolId
```

### 2. Subdomain-Based (New Implementation)
```
URL Format:     https://schoolname.example.com/dashboard
DNS Required:   Wildcard record (*.example.com)
Tenant Parsing: Extract from host header
Database Check: Yes, validate subdomain maps to schoolId
School Lookup:  Host header → Database query or cache
```

---

## Code Comparison: User Login


### Path-Based Flow (Current)
```typescript
// auth.controller.ts
async login(req: AuthRequest, res: Response) {
  const { email, password, schoolId } = req.body;  // schoolId provided by user
  
  // Validate credentials
  const user = await prisma.user.findUnique({
    where: { email },
    include: { school: true }
  });
  
  if (!user || !password match) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // Check if user belongs to the requested school
  if (user.schoolId !== schoolId) {
    throw new ApiError(403, 'Access denied');
  }
  
  // Generate JWT with schoolId
  const token = generateAccessToken({
    userId: user.id,
    email: user.email,
    schoolId: user.schoolId,  // ← Explicit in token
    role: user.role
  });
  
  // Frontend navigates to: /t/schoolId/dashboard
  res.json({ 
    success: true, 
    token,
    schoolId: user.schoolId
  });
}
```

**Frontend**: User selects school from dropdown, then logs in
```jsx
const [selectedSchool, setSelectedSchool] = useState(null);

<form onSubmit={handleLogin}>
  <SchoolSelector onChange={setSelectedSchool} />
  <input type="email" placeholder="Email" />
  <input type="password" placeholder="Password" />
  <button>Login</button>
</form>

// On success:
navigate(`/t/${schoolId}/dashboard`)
```

---

### Subdomain-Based Flow (New)
```typescript
// auth.controller.ts (Enhanced)
async login(req: AuthRequest, res: Response) {
  const { email, password } = req.body;  // NO schoolId needed
  const subdomain = req.subdomain;  // From host header
  
  // Validate credentials
  const user = await prisma.user.findUnique({
    where: { email },
    include: { school: true }
  });
  
  if (!user || !password match) {
    throw new ApiError(401, 'Invalid credentials');
  }
  
  // If accessed via subdomain, verify user belongs to that school
  if (subdomain) {
    const school = req.subdomainSchool;  // Set by middleware
    if (user.schoolId !== school.id) {
      throw new ApiError(403, 'This account does not belong to this school');
    }
  }
  
  // Generate JWT with schoolId
  const token = generateAccessToken({
    userId: user.id,
    email: user.email,
    schoolId: user.schoolId,  // ← Still in token, but derived from subdomain
    role: user.role
  });
  
  // Frontend navigates to: /dashboard (same domain)
  res.json({ 
    success: true, 
    token,
    schoolName: user.school.name  // Optional: for UI
  });
}
```

**Frontend**: Automatic subdomain detection, no school selector needed
```jsx
// useSubdomain hook detects: zawadi.example.com → "zawadi"
const subdomain = useSubdomain().getSubdomain();

<form onSubmit={handleLogin}>
  {subdomain && <p>Accessing {schoolName}</p>}
  <input type="email" placeholder="Email" />
  <input type="password" placeholder="Password" />
  <button>Login</button>
</form>

// On success:
navigate(`/dashboard`)  // Stay on same domain
```

---

## Middleware Comparison

### Path-Based: Tenant Extraction
```typescript
// tenant.middleware.ts (Current)
export const requireTenant = (req: any, res, next) => {
  // Get schoolId from different sources (in order of priority):
  
  // 1. From JWT
  let schoolId = req.user?.schoolId;
  
  // 2. From URL path: /t/:schoolId/...
  if (!schoolId) {
    const match = req.path.match(/^\/t\/([a-z0-9-]+)/);
    schoolId = match?.[1];
  }
  
  // 3. From header (SUPER_ADMIN bypass)
  if (!schoolId && req.user?.role === 'SUPER_ADMIN') {
    schoolId = req.headers['x-school-id'];
  }
  
  if (!schoolId) {
    return next(new ApiError(403, 'No school association found'));
  }
  
  req.tenant = { schoolId };
  next();
};
```

### Subdomain-Based: Additional Middleware
```typescript
// subdomain.middleware.ts (New)
export const extractSubdomain = (req: any, res, next) => {
  const host = req.get('host') || '';
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  
  // Extract subdomain if exists
  if (parts.length > 2 && hostname !== 'localhost') {
    req.subdomain = parts[0].toLowerCase();
    req.isTenantAccess = true;
  }
  
  next();
};

// subdomain-auth.middleware.ts (New)
export const subdomainAuth = async (req: any, res, next) => {
  if (!req.subdomain || !req.isTenantAccess) {
    return next();
  }
  
  // Resolve subdomain to school
  const school = await subdomainService.resolveSubdomainToSchool(req.subdomain);
  
  if (!school || !school.active) {
    return next(new ApiError(404, 'Tenant not found'));
  }
  
  // Store school in request
  req.subdomainSchool = school;
  
  // Set tenant context from subdomain
  req.tenant = { schoolId: school.id, source: 'subdomain' };
  
  // If user authenticated, verify consistency
  if (req.user && req.user.schoolId !== school.id) {
    return next(new ApiError(403, 'Invalid tenant access'));
  }
  
  next();
};
```

**Middleware Order (Updated server.ts)**:
```typescript
// IMPORTANT: Order matters!
app.use(extractSubdomain);          // 1. Parse host header
app.use(express.json());             // 2. Parse body
app.use(authenticate);               // 3. Verify JWT
app.use(subdomainAuth);              // 4. Resolve subdomain to schoolId
app.use(setTenantContext);           // 5. Set AsyncLocalStorage context
app.use('/api', routes);             // 6. Route handling
```

---

## API Request Comparison

### Scenario: List Learners for a School

#### Path-Based
```bash
# Request
curl -X GET https://example.com/api/learners \
  -H "Authorization: Bearer TOKEN" \
  -H "Host: example.com"

# Token contains: { schoolId: "uuid-123", ... }

# Response
{
  "success": true,
  "data": [
    { "id": "L1", "name": "John", "schoolId": "uuid-123" },
    { "id": "L2", "name": "Jane", "schoolId": "uuid-123" }
  ]
}
```

#### Subdomain-Based (Both work the same way!)
```bash
# Request
curl -X GET https://zawadi.example.com/api/learners \
  -H "Authorization: Bearer TOKEN" \
  -H "Host: zawadi.example.com"

# Middleware flow:
# 1. Host: zawadi.example.com → subdomain = "zawadi"
# 2. Database: subdomain="zawadi" → schoolId="uuid-123"
# 3. Token: { schoolId: "uuid-123", ... }
# Both methods reach same conclusion: schoolId = "uuid-123"

# Response (identical)
{
  "success": true,
  "data": [
    { "id": "L1", "name": "John", "schoolId": "uuid-123" },
    { "id": "L2", "name": "Jane", "schoolId": "uuid-123" }
  ]
}
```

---

## Database Query Comparison

### Both Methods: Auto-Filtering Works the Same

```typescript
// Controller code (same for both methods)
async getLearners(req: AuthRequest, res: Response) {
  // No need to manually add WHERE schoolId filter!
  const learners = await prisma.learner.findMany();
  
  res.json({ success: true, data: learners });
}

// Prisma Middleware (auto-applies to both):
prisma.$use(async (params, next) => {
  // If path-based: req.tenant.schoolId = "uuid-123"
  // If subdomain-based: req.tenant.schoolId = "uuid-123"
  // Result: SAME AUTO-FILTER APPLIED
  
  if (params.model === 'Learner') {
    params.args.where = {
      ...params.args.where,
      schoolId: getTenantContext().schoolId  // ← Applied either way
    };
  }
  
  return next(params);
});
```

---

## URL Navigation Comparison

### Path-Based Navigation
```
Home:           https://example.com/
Login:          https://example.com/login?schoolId=uuid-123
Dashboard:      https://example.com/t/uuid-123/dashboard
Classes:        https://example.com/t/uuid-123/classes
Settings:       https://example.com/t/uuid-123/settings
```

### Subdomain-Based Navigation
```
Home:           https://example.com/
School Portal:  https://schoolname.example.com/
Login:          https://schoolname.example.com/login
Dashboard:      https://schoolname.example.com/dashboard
Classes:        https://schoolname.example.com/classes
Settings:       https://schoolname.example.com/settings
```

### Both Can Coexist!
```
Path-based:     https://example.com/t/uuid-123/dashboard ✅
Subdomain-based: https://schoolname.example.com/dashboard ✅
```

---

## Frontend Detection Logic

```typescript
// useSubdomain hook
export function useSubdomain() {
  const getAccessMode = useCallback(() => {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;
    
    const hasSubdomain = hostname !== 'localhost' && 
                         !hostname.startsWith('127.') &&
                         hostname.split('.').length > 2;
    
    const hasPathBased = pathname.match(/^\/t\/[a-z0-9-]+/);
    
    if (hasSubdomain && !hasPathBased) {
      return 'subdomain';  // https://schoolname.example.com/...
    }
    
    if (!hasSubdomain && hasPathBased) {
      return 'path';       // https://example.com/t/:schoolId/...
    }
    
    return 'unknown';
  }, []);
  
  return { getAccessMode };
}
```

---

## CORS Configuration Comparison

### Path-Based (Current)
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://example.com'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
```

### Subdomain-Based (Enhanced)
```typescript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://example.com'
];

const deploymentDomain = process.env.DEPLOYMENT_DOMAIN || 'example.com';
const subdomainPattern = new RegExp(
  `https://([a-z0-9-]+\\.)?${deploymentDomain.replace(/\./g, '\\.')}$`
);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (origin.startsWith('http://localhost:')) return callback(null, true);
    if (subdomainPattern.test(origin)) return callback(null, true);  // ← Subdomain wildcard
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
```

---

## Migration Strategy: Gradual Rollout

### Phase 1: Code Deployed (No User Impact)
- ✅ Subdomain middleware added
- ✅ Database fields added
- ✅ API endpoints available
- ✅ Path-based access still works 100%

### Phase 2: Optional Adoption
- ✅ Existing schools can choose to enable subdomain
- ✅ New schools offered subdomain during signup
- ✅ Both methods work simultaneously

### Phase 3: Increased Visibility
- ✅ Admin dashboard shows subdomain status
- ✅ Send email: "Enable your custom domain!"
- ✅ UI shows both access methods

### Phase 4: Full Adoption (Optional)
- ✅ All tenants have subdomains
- ✅ Documentation emphasizes subdomain method
- ✅ Path-based method remains as fallback

---

## Performance Comparison

### Path-Based Performance
```
1. Request received
2. Parse JWT               ~1ms
3. Extract schoolId        ~0.1ms
4. Set tenant context      ~0.5ms
5. Database query          ~50-200ms (depends on query)
Total: ~51-201ms
```

### Subdomain-Based Performance
```
1. Request received
2. Extract subdomain       ~0.5ms
3. Check cache             ~2-5ms (hit in 90% of requests)
   - OR -
   Database query          ~50-200ms (miss in 10%)
4. Parse JWT               ~1ms
5. Set tenant context      ~0.5ms
6. Database query          ~50-200ms (depends on query)
Total: ~5-206ms (mostly cache hits, minimal overhead)
```

**Key Insight**: Subdomain resolution is cached, so it adds <5ms 90% of the time!

---

## Security Considerations

| Aspect | Path-Based | Subdomain-Based |
|--------|-----------|-----------------|
| JWT Tampering | Prevented by JWT verification | Prevented + Verified against host |
| Cross-Tenant Access | Guarded by JWT | Guarded by JWT + Host check |
| CSRF | Protected by same-site cookies | Protected + Subdomain isolation helps |
| Enumeration | Requires valid JWT | Requires subdomain lookup + JWT |
| DNS Hijacking | N/A | Risk if attacker controls DNS |
| Certificate | Single cert for domain | Wildcard cert needed |

**Recommendation**: Use both methods for defense in depth
- Subdomain identifies tenant (first layer)
- JWT verifies user (second layer)
- Middleware enforces consistency (third layer)

---

## Decision: Which Method to Use?

### Choose Path-Based When:
- ✅ Users access from multiple schools (multi-tenant users)
- ✅ Cannot manage wildcard DNS
- ✅ Using subdomains for other services
- ✅ Users explicitly switch between schools

### Choose Subdomain When:
- ✅ Single school per user (most common)
- ✅ Want branded experience per school
- ✅ Users rarely switch schools
- ✅ Can manage wildcard DNS
- ✅ Want professional school-branded URLs

### Best Practice: **Use Both!**
```
Path: https://example.com/t/uuid-123/dashboard
Subdomain: https://schoolname.example.com/dashboard
Both work seamlessly together!
```

