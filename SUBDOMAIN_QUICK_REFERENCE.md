# Subdomain Implementation - Quick Reference Guide

## 📋 What's Needed (Components Checklist)

### Database Changes
```
✅ Add 'subdomain' field to School model (UNIQUE, nullable)
✅ Add 'subdomainVerified' field (boolean, default false)
✅ Add 'subdomainVerifiedAt' field (DateTime, nullable)
✅ Create unique index on subdomain
✅ Create composite index on (active, archived, subdomain)
```

### Backend Files to Create/Update

```
CREATE:
├── server/src/middleware/subdomain.middleware.ts
│   └── extractSubdomain() - Parse host header
├── server/src/middleware/subdomain-auth.middleware.ts
│   └── subdomainAuth() - Resolve subdomain to school
├── server/src/services/subdomain.service.ts
│   ├── resolveSubdomainToSchool()
│   └── validateSubdomain()
├── server/src/routes/subdomain.routes.ts
│   ├── POST /check-availability
│   ├── GET /:subdomain/branding
│   ├── PUT /:schoolId/subdomain
│   └── POST /:schoolId/enable

UPDATE:
├── server/src/server.ts
│   ├── Update CORS config (wildcard support)
│   └── Add extractSubdomain middleware
├── server/src/middleware/auth.middleware.ts
│   └── Integrate subdomain context
├── server/src/routes/index.ts
│   └── Register /api/subdomains route
└── server/src/routes/school.routes.ts
    └── Update getMySchool() endpoint
```

### Frontend Files to Create/Update

```
CREATE:
├── src/hooks/useSubdomain.ts
│   ├── getSubdomain()
│   └── getAccessMode()
└── src/utils/subdomainUtils.ts
    └── buildSchoolUrl()

UPDATE:
├── src/App.jsx
│   ├── Detect access mode
│   └── Fetch branding by subdomain
└── src/components/auth/LoginForm.jsx
    └── Show tenant name from subdomain
```

### Configuration Files

```
UPDATE:
├── .env
│   ├── DEPLOYMENT_DOMAIN=example.com
│   ├── SUBDOMAIN_ENABLED=true
│   └── SUBDOMAIN_CACHE_TTL=600
└── server/nodemon.json
    └── (if needed, restart on changes)
```

---

## 🔐 Security Validation Checklist

- [ ] Subdomain format validation (2-63 char, alphanumeric + hyphen)
- [ ] Reserved subdomain list (www, api, mail, admin, support, blog)
- [ ] JWT schoolId vs subdomain schoolId verification
- [ ] Rate limiting on subdomain checks (100/min)
- [ ] CORS wildcard only in production (with explicit check)
- [ ] HTTPS only enforcement in production
- [ ] Cache with TTL to prevent enumeration
- [ ] Audit log subdomain changes
- [ ] SQL injection protection (use Prisma parameterized queries)

---

## 🧪 Testing Scenarios

### Unit Tests
```typescript
// SubdomainService.test.ts
- ✅ validateSubdomain() with valid inputs
- ✅ validateSubdomain() with reserved words
- ✅ validateSubdomain() with special chars
- ✅ resolveSubdomainToSchool() cache hit
- ✅ resolveSubdomainToSchool() cache miss
- ✅ resolveSubdomainToSchool() inactive/archived school

// Middleware tests
- ✅ extractSubdomain() from valid host
- ✅ extractSubdomain() from localhost
- ✅ subdomainAuth() with valid subdomain
- ✅ subdomainAuth() with invalid subdomain
- ✅ subdomainAuth() JWT mismatch rejection
```

### Integration Tests
```typescript
// Full request flow
- ✅ GET https://schoolname.example.com/api/schools
- ✅ POST /api/subdomains/check-availability
- ✅ PUT /api/schools/123/subdomain
- ✅ CORS preflight for *.example.com
- ✅ Tenant data isolation via subdomain
```

### Manual Testing Checklist
```bash
# Local development
curl -H "Host: zawadi.localhost" http://localhost:5000/api/health
# Should return with subdomain context

# Staging
curl -H "Host: schoolname.example-staging.com" https://api.example-staging.com/api/health

# Production
# Access https://schoolname.example.com and verify login works
```

---

## 📊 DNS Configuration Template

```
# Add these records to your DNS provider

; Wildcard subdomain (all subdomains point here)
*.example.com       A       YOUR_SERVER_IP
example.com         A       YOUR_SERVER_IP

; Optional: For specific handling
www.example.com     A       YOUR_SERVER_IP
api.example.com     A       YOUR_SERVER_IP

; TTL: 3600 (1 hour) for faster updates during testing
; TTL: 86400 (24 hours) for production stability

; Optional: Add CAA record for SSL certificate authority
example.com  CAA  0 issue "letsencrypt.org"
```

---

## 🚀 Implementation Timeline Estimate

| Phase | Task | Duration | Deps |
|-------|------|----------|------|
| 1 | Database schema update | 2h | None |
| 2 | Middleware creation | 6h | Phase 1 |
| 3 | Services layer | 6h | Phase 1 |
| 4 | API endpoints | 4h | Phase 2-3 |
| 5 | Frontend hooks | 3h | Phase 4 |
| 6 | CORS configuration | 2h | None |
| 7 | Testing & QA | 8h | All phases |
| 8 | Documentation | 3h | All phases |
| **Total** | | **34h** | |

---

## 📝 Environment Setup Instructions

### Development Environment
```bash
# 1. Update .env with:
DEPLOYMENT_DOMAIN=localhost:5000
SUBDOMAIN_ENABLED=true
NODE_ENV=development

# 2. Add to /etc/hosts (Mac/Linux) or C:\Windows\System32\drivers\etc\hosts (Windows):
127.0.0.1  zawadi.localhost
127.0.0.1  kampala-high.localhost
127.0.0.1  localhost

# 3. Run server (already running on http://localhost:5000)
# Access via: http://zawadi.localhost:5000/api/health
```

### Staging Environment
```bash
# 1. Update DNS records at hosting provider
*.example-staging.com  A  STAGING_SERVER_IP

# 2. Update .env with:
DEPLOYMENT_DOMAIN=example-staging.com
SUBDOMAIN_ENABLED=true
NODE_ENV=staging

# 3. Verify DNS propagation (wait 15-30 min):
nslookup schoolname.example-staging.com
```

### Production Environment
```bash
# 1. Update DNS records at hosting provider
*.example.com  A  PRODUCTION_SERVER_IP

# 2. Update .env with:
DEPLOYMENT_DOMAIN=example.com
SUBDOMAIN_ENABLED=true
NODE_ENV=production

# 3. Ensure HTTPS/SSL certificates
# - Use wildcard certificate: *.example.com
# - Or use Let's Encrypt cerbot with --wildcard flag

# 4. Verify HTTPS works:
curl https://schoolname.example.com/api/health
```

---

## 🔗 API Examples After Implementation

### Check Subdomain Availability
```bash
curl -X POST https://example.com/api/subdomains/check-availability \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "zawadi"}'

# Response:
{
  "success": true,
  "data": {
    "available": true,
    "message": "Subdomain is available"
  }
}
```

### Get Tenant Branding by Subdomain
```bash
curl https://example.com/api/subdomains/zawadi/branding

# Response:
{
  "success": true,
  "data": {
    "schoolId": "uuid-123",
    "schoolName": "Zawadi JRN Academy",
    "logoUrl": "https://...",
    "faviconUrl": "https://..."
  }
}
```

### Set Subdomain for School
```bash
curl -X PUT https://example.com/api/subdomain/uuid-123/subdomain \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subdomain": "zawadi"}'

# Response:
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "name": "Zawadi JRN Academy",
    "subdomain": "zawadi",
    "subdomainVerified": true,
    "accessMethods": {
      "pathBased": "/t/uuid-123",
      "subdomainBased": "zawadi.example.com"
    }
  }
}
```

---

## 🎯 Key Decision Points

### Before Starting Implementation, Decide:

1. **Subdomain Generation Strategy**
   - Option A: Auto-generate from school name (zawadi → "zawadi", kampala high → "kampala-high")
   - Option B: School admin chooses (after availability check)
   - Option C: SUPER_ADMIN assigns only

2. **Mandatory vs Optional**
   - Option A: All schools must have subdomain
   - Option B: Subdomains optional, path-based always available
   - *Recommendation: Option B (gradual migration, backward compatible)*

3. **Subdomain Input Timing**
   - Option A: During school creation
   - Option B: After school creation, optional setup
   - Option C: Only on demand
   - *Recommendation: Option B (less friction for early schools)*

4. **DNS Provider**
   - Option A: Self-managed (control full domain)
   - Option B: Delegated subdomain (e.g., schools.yourdomain.com)
   - Option C: Separate domain per school (expensive)
   - *Recommendation: Option A (all subdomains on one domain)*

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error on Subdomain
```
Error: Not allowed by CORS
```

**Solution:**
1. Verify DEPLOYMENT_DOMAIN env var is set correctly
2. Check CORS regex pattern in server.ts
3. Ensure origin header matches pattern

### Issue: Subdomain Not Resolving
```
ERR_NAME_NOT_RESOLVED
```

**Solution:**
1. Verify DNS records propagated (nslookup)
2. Check hosts file entries (localhost)
3. Restart browser (clear DNS cache)

### Issue: JWT Mismatch Error
```
Access denied: Invalid tenant
```

**Solution:**
1. Check JWT contains correct schoolId
2. Verify subdomain maps to correct schoolId in DB
3. Clear browser tokens and re-authenticate

---

## 📚 Reference Documents

- [SUBDOMAIN_IMPLEMENTATION_PLAN.md](./SUBDOMAIN_IMPLEMENTATION_PLAN.md) - Full detailed plan
- Multi-Tenant Architecture Analysis (existing) - Current structure
- Prisma Schema - Data model reference
- ENV Variables - Configuration reference

