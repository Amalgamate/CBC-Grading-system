# Feature Rollout Guide for Multi-Tenant System

## Overview
Your EDucore system uses **automatic tenant filtering** where data is scoped by `schoolId`. This means:
- ✅ Each school sees ONLY their own data
- ✅ Changes to defaults don't automatically apply to all schools
- ⚠️ You need explicit strategies for system-wide rollouts

---

## Tenant Architecture

### How Multi-Tenancy Works

```
┌─ System Level (SUPER_ADMIN only)
│  ├─ LearningArea (GLOBAL defaults)
│  ├─ SubscriptionPlan
│  └─ GradingSystem (system defaults)
│
└─ School Level (Tenant-scoped)
   ├─ School (root tenant)
   ├─ Users (filtered by schoolId)
   ├─ Classes (filtered by schoolId)
   ├─ Learners (filtered by schoolId)
   └─ Assessments (filtered by schoolId)
```

### Tenant-Scoped Models (Auto-filtered)
```typescript
// These are ALWAYS filtered by schoolId automatically:
- Learner
- User
- Class
- ClassEnrollment
- Attendance
- FormativeAssessment
- SummativeTest
- SummativeResult
- Branch
- StreamConfig
- TermConfig
- AggregationConfig
- GradingSystem
```

**Middleware Location**: `server/src/middleware/prisma-tenant.middleware.ts`

---

## Feature Rollout Strategies

### Strategy 1: System-Wide Defaults (Global)
**When**: Configuration that all schools should use by default
**Example**: Learning areas, core competencies, rubric definitions

**Implementation**:
```typescript
// 1. Add to Prisma schema
model LearningArea {
  id          String   @id @default(cuid())
  name        String
  description String?
  isSystemDefault Boolean @default(true)  // ← Flag for system defaults
  schoolId    String?  // NULL = system default
  school      School?  @relation(fields: [schoolId], references: [id])
}

// 2. Create/Update seed script
// server/prisma/seed-learning-areas.ts
const systemDefaults = [
  { name: 'English Language', isSystemDefault: true, schoolId: null },
  { name: 'Mathematics', isSystemDefault: true, schoolId: null },
  // ...
];

// For NEW schools, create learning areas from system defaults
const school = await prisma.school.create({ /* ... */ });
const defaults = await prisma.learningArea.findMany({ 
  where: { isSystemDefault: true } 
});
for (const def of defaults) {
  await prisma.learningArea.create({
    schoolId: school.id,
    name: def.name,
    // ... copy other fields
  });
}

// 3. Query with fallback logic
const learningAreas = await prisma.learningArea.findMany({
  where: {
    OR: [
      { schoolId: schoolId },           // School-specific
      { isSystemDefault: true }         // Global defaults
    ]
  }
});
```

**Applies To**: ✅ All new schools, ✅ Existing schools (if they haven't customized)

---

### Strategy 2: Per-School Customization
**When**: Features that schools can customize after setup
**Example**: Grading scales, term configurations, assessment types

**Implementation**:
```typescript
// 1. Schema allows per-school customization
model GradingSystem {
  id          String  @id @default(cuid())
  schoolId    String  @unique
  school      School  @relation(fields: [schoolId], references: [id])
  
  // Customizable fields
  minScore    Float   @default(0)
  maxScore    Float   @default(100)
  grades      Grade[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

// 2. On school creation, copy system defaults
const templateGrading = await prisma.gradingSystem.findFirst({
  where: { school: { name: 'EDucore Template' } }
});

await prisma.gradingSystem.create({
  schoolId: newSchool.id,
  minScore: templateGrading.minScore,
  maxScore: templateGrading.maxScore,
  // ... copy other fields
});

// 3. Schools can then modify their own
await prisma.gradingSystem.update({
  where: { schoolId: schoolId },
  data: { maxScore: 120 }  // ← Only affects this school
});
```

**Applies To**: ✅ Per-school basis only

---

### Strategy 3: Mandatory System Updates
**When**: Critical features that all schools MUST adopt
**Example**: New security requirements, compliance updates

**Implementation**:
```typescript
// 1. Create migration to add new column
// server/prisma/migrations/20260202_add_feature/migration.sql
ALTER TABLE "some_table" ADD COLUMN "newFeature" BOOLEAN NOT NULL DEFAULT true;

// 2. Create targeted migration script
// server/scripts/rollout-feature.ts
async function rolloutFeature() {
  const schools = await prisma.school.findMany({
    where: { active: true }
  });
  
  for (const school of schools) {
    // Log update for audit trail
    await prisma.systemAudit.create({
      data: {
        schoolId: school.id,
        action: 'FEATURE_ROLLOUT',
        featureName: 'newSecurityFeature',
        timestamp: new Date()
      }
    });
    
    // Apply feature setup
    await prisma.schoolConfig.upsert({
      where: { schoolId: school.id },
      create: {
        schoolId: school.id,
        newFeatureEnabled: true
      },
      update: {
        newFeatureEnabled: true
      }
    });
  }
  
  console.log(`✅ Rolled out to ${schools.length} schools`);
}

// 3. Run on deployment
npm run rollout:feature

// 4. Verify rollout
await prisma.schoolConfig.findMany({ 
  where: { newFeatureEnabled: true } 
});
```

**Applies To**: ✅ All schools automatically

---

### Strategy 4: Gradual Rollout / Feature Flags
**When**: Testing new features before full release
**Example**: New assessment types, experimental UI features

**Implementation**:
```typescript
// 1. Add feature flag model
model FeatureFlag {
  id          String   @id @default(cuid())
  name        String   @unique
  enabled     Boolean  @default(false)
  schools     School[] @relation("FeatureFlagSchools")
  rolloutPercentage Float @default(0)  // 0-100
  createdAt   DateTime @default(now())
}

model SchoolFeatureAccess {
  id          String @id @default(cuid())
  schoolId    String
  school      School @relation(fields: [schoolId], references: [id])
  featureFlagId String
  flag        FeatureFlag @relation(fields: [featureFlagId], references: [id])
  enabled     Boolean @default(false)
  
  @@unique([schoolId, featureFlagId])
}

// 2. Enable for specific schools first
await prisma.schoolFeatureAccess.create({
  data: {
    schoolId: "school-1",
    featureFlagId: "new-assessment-type",
    enabled: true
  }
});

// 3. Check in API
const hasFeature = await prisma.schoolFeatureAccess.findUnique({
  where: {
    schoolId_featureFlagId: {
      schoolId: req.user.schoolId,
      featureFlagId: "new-assessment-type"
    }
  }
});

if (hasFeature?.enabled) {
  // Show new feature
}

// 4. Gradual rollout
await prisma.featureFlag.update({
  where: { name: "new-feature" },
  data: { rolloutPercentage: 50 }  // 50% of schools
});
```

**Applies To**: ✅ Selected schools, ✅ Gradual rollout possible

---

## Common Scenarios

### Scenario 1: Adding Learning Areas After Schools Exist

```typescript
// DON'T do this:
await prisma.learningArea.create({
  data: { name: 'New Subject' }  // ← Missing schoolId!
});

// DO this - Add to system defaults:
await prisma.learningArea.create({
  data: {
    name: 'New Subject',
    isSystemDefault: true,
    schoolId: null  // ← System default, no school
  }
});

// Then schools can use via fallback query OR explicitly copy if they want to customize
```

### Scenario 2: Changing Default Grading System

```typescript
// Option A: Update system default
const templateGrading = await prisma.gradingSystem.findFirst({
  where: { school: { name: 'EDucore Template' } }
});
await prisma.gradingSystem.update({
  where: { id: templateGrading.id },
  data: { maxScore: 100 }
});
// ✅ Applies to: New schools created after this change only

// Option B: Update all schools (BREAKING - be careful!)
await prisma.gradingSystem.updateMany({
  where: { school: { active: true } },
  data: { maxScore: 100 }
});
// ⚠️ Applies to: ALL schools (schools that already customized will be overwritten!)

// Option C: Update only uncustomized schools
const customized = await prisma.gradingSystem.findMany({
  where: { hasSchoolCustomizations: true }
});
const customizedIds = customized.map(g => g.id);

await prisma.gradingSystem.updateMany({
  where: {
    id: { notIn: customizedIds }
  },
  data: { maxScore: 100 }
});
// ✅ Applies to: Only schools that haven't customized
```

### Scenario 3: Migrating Data When Adding New Feature

```typescript
// 1. Create migration
// server/prisma/migrations/20260202_add_new_field/migration.sql
ALTER TABLE "classes" ADD COLUMN "newField" VARCHAR(255) DEFAULT 'default_value';

// 2. Create data migration
// server/scripts/migrate-new-field.ts
async function migrateNewField() {
  const classes = await prisma.class.findMany();
  
  for (const cls of classes) {
    await prisma.class.update({
      where: { id: cls.id },
      data: {
        newField: 'migrated_value'
      }
    });
  }
}

migrateNewField();

// 3. Commit both to git
git add server/prisma/migrations/
git add server/scripts/migrate-new-field.ts
git commit -m "Add newField to Class model with data migration"
```

---

## Deployment Checklist

When adding a new feature to production:

- [ ] **Schema Change?** 
  - Create migration: `server/prisma/migrations/`
  - Test on staging first
  
- [ ] **System Default?**
  - Add to `server/prisma/seed.ts` or relevant seed script
  - Runs on: `npm run seed` (development/staging)
  - For production: Run targeted script after deploy
  
- [ ] **Per-School Config?**
  - Add to `SchoolConfig` or relevant model
  - Create script to initialize for existing schools
  - Run: `railway run -- npm run setup:feature`
  
- [ ] **Feature Flag Needed?**
  - Add to `FeatureFlag` table
  - Enable for beta schools first
  - Gradual rollout per percentage
  
- [ ] **Data Migration?**
  - Test on production database backup FIRST
  - Run: `railway run -- ts-node scripts/migrate-*.ts`
  - Verify results before switching traffic
  
- [ ] **Backward Compatibility?**
  - Can old schools still use the system?
  - Are there graceful fallbacks?
  - Document breaking changes

---

## Best Practices

1. **Always use `schoolId` when creating school-scoped data**
   ```typescript
   // ❌ Bad
   await prisma.class.create({ data: { name: 'Form 1' } });
   
   // ✅ Good
   await prisma.class.create({ 
     data: { name: 'Form 1', schoolId: req.user.schoolId } 
   });
   ```

2. **Make defaults optional for customization**
   ```typescript
   // Schema design
   model GradingSystem {
     schoolId String @unique  // ← Each school has their own
     customized Boolean @default(false)
   }
   ```

3. **Seed new schools with system defaults**
   ```typescript
   // When creating new school
   const defaults = await prisma.gradingSystem.findFirst({
     where: { school: { name: 'EDucore Template' } }
   });
   
   await prisma.gradingSystem.create({
     schoolId: newSchool.id,
     ...defaults  // Copy system defaults
   });
   ```

4. **Log all system-wide updates**
   ```typescript
   await prisma.systemAudit.create({
     data: {
       action: 'SYSTEM_UPDATE',
       affectedSchools: schools.length,
       details: 'Updated grading scales'
     }
   });
   ```

5. **Test on staging environment first**
   ```bash
   # Staging deployment
   git push origin feature/new-feature
   
   # Test the feature
   # Visit: https://staging-app.railway.app
   
   # If OK, merge to main for production
   git checkout main
   git merge feature/new-feature
   git push origin main
   ```

---

## Quick Reference

| Scenario | Applies To | Strategy |
|----------|-----------|----------|
| Learning areas for new schools | New schools only | System defaults + seed |
| Grading system changes | Some schools | Per-school update + feature flag |
| Security fix (all must have) | ALL schools | Migration + targeted rollout |
| New assessment type | Beta users | Feature flag + gradual rollout |
| Database schema change | All (automatic) | Prisma migration |

---

## Emergency Rollback

If something goes wrong after rollout:

```bash
# 1. Rollback database migration
railway run -- npx prisma migrate resolve --rolled-back migration_name

# 2. Rollback code
git revert commit-hash
git push origin main

# 3. Verify status
railway run -- npm run verify:schema
```
