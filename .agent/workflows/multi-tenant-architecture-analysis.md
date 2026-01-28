---
description: Multi-Tenant Architecture Analysis & Recommendations
---

# Multi-Tenant School Management System - Architecture Analysis

## Executive Summary

Your system is a **multi-tenant SaaS platform** where each school is a separate tenant. The current implementation has a solid foundation but needs streamlining for SUPER_ADMIN operations, particularly for creating and deleting schools.

---

## Current Architecture Overview

### 1. **Data Separation Strategy**

Your system uses **Row-Level Multi-Tenancy** with the following hierarchy:

```
SUPER_ADMIN (System Owner)
    └── School (Tenant)
        └── Branch (Sub-tenant/Location)
            └── Learners, Classes, Users, etc.
```

#### Key Tenant Identifiers:
- **`schoolId`**: Primary tenant identifier (required for all school-specific data)
- **`branchId`**: Secondary identifier for multi-branch schools (optional)

#### Data Isolation Mechanisms:

**✅ CURRENT IMPLEMENTATION:**

1. **Schema Level** (`schema.prisma`):
   - Every major model has `schoolId` field
   - Cascade deletion configured: `onDelete: Cascade`
   - Proper indexing on `schoolId` and `branchId`
   - Unique constraints scoped to school level

2. **Middleware Level**:
   - `tenant.middleware.ts`: Enforces tenant context
   - `auth.middleware.ts`: Extracts tenant from JWT
   - `permissions.middleware.ts`: Role-based access control

3. **Controller Level**:
   - Tenant scoping in queries (e.g., `where: { schoolId }`)
   - Authorization checks before operations

---

## Current Issues & Gaps

### 🔴 **Critical Issues**

#### 1. **SUPER_ADMIN School Creation Flow**
**Problem**: The current `createSchool` endpoint requires authentication but doesn't properly handle SUPER_ADMIN context.

**Location**: `server/src/controllers/school.controller.ts` (Line 22-98)

**Issues**:
- ✅ Creates school successfully
- ❌ Doesn't create default admin user for the school
- ❌ Doesn't create initial subscription
- ❌ Doesn't set up default branches
- ❌ No onboarding workflow

**Current Code**:
```typescript
export const createSchool = async (req: AuthRequest, res: Response) => {
  // Only creates School record, nothing else
  const school = await prisma.school.create({
    data: { name, admissionFormatType, ... }
  });
}
```

#### 2. **SUPER_ADMIN School Deletion**
**Problem**: Deletion has safety checks but no proper cleanup workflow.

**Location**: `server/src/controllers/school.controller.ts` (Line 270-312)

**Issues**:
- ✅ Checks if school is active
- ✅ Prevents template deletion
- ❌ No soft delete option
- ❌ No data export before deletion
- ❌ No notification to school admin
- ❌ Doesn't clean up subscriptions properly

#### 3. **Tenant Middleware Confusion**
**Problem**: Multiple middleware doing similar things.

**Location**: `server/src/middleware/tenant.middleware.ts`

**Issues**:
- `requireTenant` (new, recommended)
- `tenantResolver` (deprecated but still used)
- `enforceSchoolConsistency` (deprecated but still used)
- Routes use different combinations

#### 4. **SUPER_ADMIN Access Pattern**
**Problem**: SUPER_ADMIN can bypass tenant checks but has no clear "impersonation" pattern.

**Current Behavior**:
- SUPER_ADMIN has no `schoolId` in their JWT
- Can access any school via `switchSchool` endpoint
- Gets new JWT with `schoolId` set
- This is a **temporary impersonation** pattern

---

## Recommended Architecture

### 🎯 **Streamlined Multi-Tenant Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                     SUPER_ADMIN LAYER                        │
│  - No schoolId in JWT                                        │
│  - Full system access                                        │
│  - Can create/delete schools                                 │
│  - Can switch context to any school                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      SCHOOL LAYER (Tenant)                   │
│  - schoolId required in JWT for all users                    │
│  - Data isolated by schoolId                                 │
│  - Subscription-based access                                 │
│  - Own admin users (ADMIN role)                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BRANCH LAYER (Sub-tenant)                 │
│  - branchId optional (null = all branches)                   │
│  - Further data isolation within school                      │
│  - Branch-specific users and resources                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Recommendations

### 📋 **Phase 1: SUPER_ADMIN School Management**

#### 1.1 Enhanced School Creation

**Create**: `server/src/services/school-provisioning.service.ts`

```typescript
/**
 * Complete school provisioning workflow
 * - Creates school
 * - Creates default admin user
 * - Creates default subscription (trial)
 * - Creates default branch (if needed)
 * - Sets up initial configuration
 */
export async function provisionNewSchool(data: SchoolProvisioningData) {
  return await prisma.$transaction(async (tx) => {
    // 1. Create school
    const school = await tx.school.create({ ... });
    
    // 2. Create default admin user
    const adminUser = await tx.user.create({
      data: {
        email: data.adminEmail,
        role: 'ADMIN',
        schoolId: school.id,
        password: await hashPassword(data.tempPassword),
        // Send welcome email with temp password
      }
    });
    
    // 3. Create trial subscription
    const subscription = await tx.schoolSubscription.create({
      data: {
        schoolId: school.id,
        planId: data.planId || defaultTrialPlanId,
        startedAt: new Date(),
        expiresAt: addDays(new Date(), 30),
        status: 'ACTIVE'
      }
    });
    
    // 4. Create default branch (if multi-branch)
    if (school.admissionFormatType !== 'NO_BRANCH') {
      await tx.branch.create({
        data: {
          schoolId: school.id,
          name: 'Main Campus',
          code: 'MC',
          active: true
        }
      });
    }
    
    // 5. Create initial admission sequence
    await tx.admissionSequence.create({
      data: {
        schoolId: school.id,
        academicYear: new Date().getFullYear(),
        currentValue: 0
      }
    });
    
    return { school, adminUser, subscription };
  });
}
```

#### 1.2 Enhanced School Deletion

**Create**: `server/src/services/school-deletion.service.ts`

```typescript
/**
 * Safe school deletion workflow
 * - Validates deletion eligibility
 * - Exports data (optional)
 * - Soft delete or hard delete
 * - Notifies affected users
 */
export async function deleteSchoolSafely(
  schoolId: string, 
  options: {
    hardDelete?: boolean;
    exportData?: boolean;
    notifyUsers?: boolean;
  }
) {
  // 1. Validate deletion
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      _count: {
        select: {
          learners: true,
          users: true,
          branches: true
        }
      }
    }
  });
  
  if (!school) throw new Error('School not found');
  if (school.status === 'TEMPLATE') {
    throw new Error('Cannot delete template school');
  }
  
  // 2. Export data if requested
  if (options.exportData) {
    await exportSchoolData(schoolId);
  }
  
  // 3. Notify users if requested
  if (options.notifyUsers) {
    await notifySchoolUsers(schoolId, 'SCHOOL_DELETION');
  }
  
  // 4. Perform deletion
  if (options.hardDelete) {
    // Hard delete - cascades to all related data
    await prisma.school.delete({ where: { id: schoolId } });
  } else {
    // Soft delete - mark as inactive
    await prisma.school.update({
      where: { id: schoolId },
      data: {
        active: false,
        status: 'DELETED',
        deletedAt: new Date() // Add this field to schema
      }
    });
  }
  
  return { success: true, message: 'School deleted successfully' };
}
```

---

### 📋 **Phase 2: Middleware Cleanup**

#### 2.1 Consolidate Tenant Middleware

**Update**: `server/src/middleware/tenant.middleware.ts`

```typescript
/**
 * Single, clear tenant middleware
 * Replaces: requireTenant, tenantResolver, enforceSchoolConsistency
 */
export const enforceTenantContext = (options?: {
  allowSuperAdmin?: boolean;
  requireBranch?: boolean;
}) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    
    // SUPER_ADMIN bypass (if allowed)
    if (user.role === 'SUPER_ADMIN' && options?.allowSuperAdmin) {
      // SUPER_ADMIN can operate without tenant context
      // OR they can have temporary context from switchSchool
      (req as any).tenant = {
        schoolId: user.schoolId || null,
        branchId: user.branchId || null,
        isSuperAdmin: true
      };
      return next();
    }
    
    // All other users MUST have schoolId
    if (!user.schoolId) {
      return next(new ApiError(403, 'No school association. Contact support.'));
    }
    
    // Set tenant context
    (req as any).tenant = {
      schoolId: user.schoolId,
      branchId: user.branchId || null,
      isSuperAdmin: false
    };
    
    // Optional: Require branch
    if (options?.requireBranch && !user.branchId) {
      return next(new ApiError(403, 'Branch association required'));
    }
    
    next();
  };
};
```

#### 2.2 Update Route Protection

**Update**: `server/src/routes/school.routes.ts`

```typescript
import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/permissions.middleware';
import { enforceTenantContext } from '../middleware/tenant.middleware';

const router = Router();

// All routes require authentication
router.use(authenticate);

// SUPER_ADMIN only routes (no tenant required)
router.post('/', 
  requireRole(['SUPER_ADMIN']), 
  createSchool
);

router.delete('/:id', 
  requireRole(['SUPER_ADMIN']), 
  deleteSchool
);

// School-scoped routes (tenant required)
router.get('/', 
  enforceTenantContext({ allowSuperAdmin: true }),
  getAllSchools
);

router.get('/:id', 
  enforceTenantContext({ allowSuperAdmin: true }),
  getSchoolById
);

// Branch routes (tenant + branch required)
router.post('/:schoolId/branches',
  enforceTenantContext({ requireBranch: false }),
  createBranch
);
```

---

### 📋 **Phase 3: Data Separation Validation**

#### 3.1 Add Prisma Middleware for Automatic Tenant Filtering

**Create**: `server/src/config/prisma-tenant.middleware.ts`

```typescript
import { Prisma } from '@prisma/client';

/**
 * Automatic tenant filtering for all queries
 * Prevents accidental cross-tenant data access
 */
export function applyTenantMiddleware(prisma: PrismaClient) {
  prisma.$use(async (params, next) => {
    // Models that require tenant filtering
    const tenantModels = [
      'Learner', 'User', 'Class', 'Attendance', 
      'FormativeAssessment', 'SummativeTest', 'SummativeResult',
      'FeeInvoice', 'Branch'
    ];
    
    if (tenantModels.includes(params.model || '')) {
      // Get tenant context from AsyncLocalStorage or request context
      const tenantContext = getTenantContext(); // Implement this
      
      if (tenantContext?.schoolId && !tenantContext.isSuperAdmin) {
        // Automatically add schoolId filter
        if (params.action === 'findMany' || params.action === 'findFirst') {
          params.args.where = {
            ...params.args.where,
            schoolId: tenantContext.schoolId
          };
        }
        
        if (params.action === 'create' || params.action === 'createMany') {
          if (Array.isArray(params.args.data)) {
            params.args.data = params.args.data.map(item => ({
              ...item,
              schoolId: tenantContext.schoolId
            }));
          } else {
            params.args.data = {
              ...params.args.data,
              schoolId: tenantContext.schoolId
            };
          }
        }
      }
    }
    
    return next(params);
  });
}
```

---

### 📋 **Phase 4: SUPER_ADMIN Dashboard**

#### 4.1 Enhanced Admin Controller

**Update**: `server/src/controllers/admin.controller.ts`

Add these methods:

```typescript
// Create school with full provisioning
async createSchoolWithProvisioning(req: Request, res: Response) {
  const { 
    schoolName, 
    adminEmail, 
    adminName,
    planId,
    admissionFormatType 
  } = req.body;
  
  const result = await provisionNewSchool({
    schoolName,
    adminEmail,
    adminName,
    planId,
    admissionFormatType
  });
  
  res.json({ success: true, data: result });
}

// Delete school with options
async deleteSchoolWithOptions(req: Request, res: Response) {
  const { schoolId } = req.params;
  const { hardDelete, exportData, notifyUsers } = req.body;
  
  const result = await deleteSchoolSafely(schoolId, {
    hardDelete,
    exportData,
    notifyUsers
  });
  
  res.json({ success: true, data: result });
}

// Get school statistics
async getSchoolStatistics(req: Request, res: Response) {
  const { schoolId } = req.params;
  
  const stats = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      _count: {
        select: {
          learners: true,
          users: true,
          branches: true,
          formativeAssessments: true,
          summativeTests: true
        }
      },
      subscriptions: {
        where: { status: 'ACTIVE' },
        include: { plan: true }
      }
    }
  });
  
  res.json({ success: true, data: stats });
}
```

---

## Data Separation Verification Checklist

### ✅ **Current State**

| Aspect | Status | Notes |
|--------|--------|-------|
| Schema-level separation | ✅ Good | All models have `schoolId` |
| Cascade deletion | ✅ Good | Properly configured |
| Index optimization | ✅ Good | Indexes on `schoolId`, `branchId` |
| Unique constraints | ✅ Good | Scoped to school level |
| JWT-based tenant context | ✅ Good | `schoolId` in token |
| Middleware enforcement | ⚠️ Needs cleanup | Multiple deprecated middlewares |
| SUPER_ADMIN pattern | ⚠️ Needs improvement | Impersonation works but unclear |
| School provisioning | ❌ Missing | Only creates School record |
| School deletion | ⚠️ Basic | No export, no soft delete |
| Automatic tenant filtering | ❌ Missing | Manual filtering in controllers |

---

## Migration Plan

### Step 1: Create New Services (No Breaking Changes)
- [ ] Create `school-provisioning.service.ts`
- [ ] Create `school-deletion.service.ts`
- [ ] Create `prisma-tenant.middleware.ts`

### Step 2: Update Admin Controller
- [ ] Add `createSchoolWithProvisioning` endpoint
- [ ] Add `deleteSchoolWithOptions` endpoint
- [ ] Add `getSchoolStatistics` endpoint

### Step 3: Update Routes
- [ ] Add new admin routes
- [ ] Keep old routes for backward compatibility

### Step 4: Middleware Cleanup (Breaking Change)
- [ ] Create `enforceTenantContext` middleware
- [ ] Update all routes to use new middleware
- [ ] Remove deprecated middlewares

### Step 5: Testing
- [ ] Test SUPER_ADMIN school creation
- [ ] Test SUPER_ADMIN school deletion
- [ ] Test tenant isolation
- [ ] Test switchSchool functionality

---

## Security Recommendations

### 🔒 **Critical Security Measures**

1. **Prevent Cross-Tenant Data Leaks**
   - ✅ Always filter by `schoolId` in queries
   - ✅ Use Prisma middleware for automatic filtering
   - ✅ Validate `schoolId` in request params matches JWT

2. **SUPER_ADMIN Access Control**
   - ✅ Require explicit role check for sensitive operations
   - ✅ Audit log all SUPER_ADMIN actions
   - ✅ Implement rate limiting on school creation/deletion

3. **Subscription Enforcement**
   - ⚠️ Check subscription status before allowing access
   - ⚠️ Implement feature flags based on plan
   - ⚠️ Block access when subscription expires

4. **Data Export Before Deletion**
   - ❌ Implement automatic backup before hard delete
   - ❌ Store exports in secure location
   - ❌ Provide download link to school admin

---

## API Endpoints Summary

### SUPER_ADMIN Endpoints

```
POST   /api/admin/schools                    - Create school (with provisioning)
DELETE /api/admin/schools/:schoolId          - Delete school (with options)
GET    /api/admin/schools                    - List all schools
GET    /api/admin/schools/:schoolId/stats    - Get school statistics
POST   /api/admin/switch-school/:schoolId    - Switch context to school
PATCH  /api/admin/schools/:schoolId/subscription - Update subscription
```

### School Admin Endpoints (Tenant-Scoped)

```
GET    /api/schools                          - Get my school
PUT    /api/schools/:id                      - Update my school
GET    /api/schools/:schoolId/branches       - Get branches
POST   /api/schools/:schoolId/branches       - Create branch
DELETE /api/schools/:schoolId/branches/:id   - Delete branch
```

---

## Conclusion

Your multi-tenant architecture is **fundamentally sound** with proper data separation at the schema level. The main improvements needed are:

1. **Streamline SUPER_ADMIN workflows** (school creation/deletion)
2. **Clean up middleware** (consolidate tenant enforcement)
3. **Add automatic tenant filtering** (Prisma middleware)
4. **Implement proper provisioning** (complete school setup)
5. **Add safety measures** (soft delete, data export)

The system is production-ready for basic operations but needs these enhancements for a complete SaaS platform.
