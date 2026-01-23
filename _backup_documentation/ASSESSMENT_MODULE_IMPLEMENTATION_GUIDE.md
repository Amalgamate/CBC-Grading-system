# Assessment Module Enhancement - Implementation Guide

## 📋 Overview

This document provides step-by-step instructions for completing the CBC Assessment Module enhancement. The foundation has been built (backend APIs, database models, enhanced frontend components), and this guide will help you complete the remaining work.

**Current Progress: ~35% Complete**

---

## 🎯 What's Already Done

### ✅ Completed Components

1. **Backend Report System** (`server/src/controllers/reportController.ts`)
   - Formative report aggregation
   - Summative report aggregation
   - Complete termly report compilation
   - Class and individual analytics
   - All helper functions for calculations

2. **Backend Routes** (`server/src/routes/reportRoutes.ts`)
   - `/api/reports/formative/:learnerId`
   - `/api/reports/summative/:learnerId`
   - `/api/reports/termly/:learnerId`
   - `/api/reports/analytics/class/:classId`
   - `/api/reports/analytics/learner/:learnerId`

3. **Frontend API Service** (`src/services/api.js`)
   - Complete `reportAPI` object with all methods
   - Integrated with authentication

4. **Enhanced Formative Report** (`src/components/CBCGrading/pages/FormativeReport_NEW.jsx`)
   - Real API integration
   - PDF generation
   - Professional layout

5. **Database Schema Definitions** (`server/prisma/schema_additions.txt`)
   - CoreCompetency model
   - ValuesAssessment model
   - CoCurricularActivity model
   - TermlyReportComment model

---

## 🚀 Implementation Steps

### **STEP 1: Database Migration** ⏱️ 30 minutes

#### 1.1 Update Prisma Schema

Open `server/prisma/schema.prisma` and add the following models at the end of the file (before the last closing brace if any):

```prisma
// ============================================
// CBC-SPECIFIC ASSESSMENT MODELS
// ============================================

// Core Competencies Assessment (CBC Requirement)
model CoreCompetency {
  id              String        @id @default(uuid())
  
  // Learner Reference
  learnerId       String
  learner         Learner       @relation("LearnerCoreCompetencies", fields: [learnerId], references: [id], onDelete: Cascade)
  
  // Academic Period
  term            Term
  academicYear    Int
  
  // Six Core Competencies with detailed ratings
  communication        DetailedRubricRating
  communicationComment String?  @db.Text
  
  criticalThinking        DetailedRubricRating
  criticalThinkingComment String?  @db.Text
  
  creativity        DetailedRubricRating
  creativityComment String?  @db.Text
  
  collaboration        DetailedRubricRating
  collaborationComment String?  @db.Text
  
  citizenship        DetailedRubricRating
  citizenshipComment String?  @db.Text
  
  learningToLearn        DetailedRubricRating
  learningToLearnComment String?  @db.Text
  
  // Assessor
  assessedBy      String
  assessor        User          @relation("AssessorCoreCompetencies", fields: [assessedBy], references: [id])
  
  // Metadata
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([learnerId, term, academicYear])
  @@map("core_competencies")
  @@index([learnerId])
  @@index([term, academicYear])
}

// Values Assessment (CBC Requirement)
model ValuesAssessment {
  id              String        @id @default(uuid())
  
  // Learner Reference
  learnerId       String
  learner         Learner       @relation("LearnerValues", fields: [learnerId], references: [id], onDelete: Cascade)
  
  // Academic Period
  term            Term
  academicYear    Int
  
  // Seven National Values
  love            DetailedRubricRating
  responsibility  DetailedRubricRating
  respect         DetailedRubricRating
  unity           DetailedRubricRating
  peace           DetailedRubricRating
  patriotism      DetailedRubricRating
  integrity       DetailedRubricRating
  
  // General Comment
  comment         String?       @db.Text
  
  // Assessor
  assessedBy      String
  assessor        User          @relation("AssessorValues", fields: [assessedBy], references: [id])
  
  // Metadata
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([learnerId, term, academicYear])
  @@map("values_assessments")
  @@index([learnerId])
  @@index([term, academicYear])
}

// Co-Curricular Activities
model CoCurricularActivity {
  id              String        @id @default(uuid())
  
  // Learner Reference
  learnerId       String
  learner         Learner       @relation("LearnerCoCurricular", fields: [learnerId], references: [id], onDelete: Cascade)
  
  // Academic Period
  term            Term
  academicYear    Int
  
  // Activity Details
  activityName    String                    // Football, Drama, Choir, etc.
  activityType    String                    // Sports, Arts, Clubs, etc.
  performance     DetailedRubricRating      // Performance rating
  achievements    String?       @db.Text    // Competitions, awards, etc.
  remarks         String?       @db.Text
  
  // Recorder
  recordedBy      String
  recorder        User          @relation("RecorderCoCurricular", fields: [recordedBy], references: [id])
  
  // Metadata
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@map("co_curricular_activities")
  @@index([learnerId])
  @@index([term, academicYear])
  @@index([activityType])
}

// Termly Report Comments
model TermlyReportComment {
  id              String        @id @default(uuid())
  
  // Learner Reference
  learnerId       String
  learner         Learner       @relation("LearnerReportComments", fields: [learnerId], references: [id], onDelete: Cascade)
  
  // Academic Period
  term            Term
  academicYear    Int
  
  // Class Teacher Comment
  classTeacherComment    String   @db.Text
  classTeacherName       String
  classTeacherSignature  String?  // Base64 or URL
  classTeacherDate       DateTime
  
  // Head Teacher Comment
  headTeacherComment     String?  @db.Text
  headTeacherName        String?
  headTeacherSignature   String?
  headTeacherDate        DateTime?
  
  // Parent/Guardian Acknowledgment
  parentComment          String?  @db.Text
  parentSignature        String?
  parentDate             DateTime?
  
  // Next Term Details
  nextTermOpens          DateTime
  
  // Metadata
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  
  @@unique([learnerId, term, academicYear])
  @@map("termly_report_comments")
  @@index([learnerId])
  @@index([term, academicYear])
}
```

#### 1.2 Update User Model Relations

Find the `User` model in `schema.prisma` and add these relations to the relations section:

```prisma
// Add to User model relations:
assessedCoreCompetencies  CoreCompetency[]      @relation("AssessorCoreCompetencies")
assessedValues            ValuesAssessment[]    @relation("AssessorValues")
recordedCoCurricular      CoCurricularActivity[] @relation("RecorderCoCurricular")
```

#### 1.3 Update Learner Model Relations

Find the `Learner` model and add these relations:

```prisma
// Add to Learner model relations:
coreCompetencies     CoreCompetency[]        @relation("LearnerCoreCompetencies")
valuesAssessments    ValuesAssessment[]      @relation("LearnerValues")
coCurricularActivities CoCurricularActivity[] @relation("LearnerCoCurricular")
reportComments       TermlyReportComment[]   @relation("LearnerReportComments")
```

#### 1.4 Run Migration

```bash
cd server

# Generate Prisma client
npx prisma generate

# Create and run migration
npx prisma migrate dev --name add_cbc_assessment_models

# Verify migration (optional)
npx prisma studio
```

✅ **Checkpoint:** Database should now have `core_competencies`, `values_assessments`, `co_curricular_activities`, and `termly_report_comments` tables.

---

### **STEP 2: Create CBC Backend Controllers** ⏱️ 3-4 hours

Create file: `server/src/controllers/cbcController.ts`

```typescript
/**
 * CBC Assessment Controller
 * Handles Core Competencies, Values, and Co-Curricular Activities
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import { PrismaClient, Term, DetailedRubricRating } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// CORE COMPETENCIES
// ============================================

/**
 * Create or Update Core Competencies
 * POST /api/cbc/competencies
 */
export const createOrUpdateCompetencies = async (req: AuthRequest, res: Response) => {
  try {
    const {
      learnerId,
      term,
      academicYear,
      communication,
      communicationComment,
      criticalThinking,
      criticalThinkingComment,
      creativity,
      creativityComment,
      collaboration,
      collaborationComment,
      citizenship,
      citizenshipComment,
      learningToLearn,
      learningToLearnComment
    } = req.body;

    const assessedBy = req.user?.userId;

    if (!assessedBy) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validate required fields
    if (!learnerId || !term || !academicYear || !communication || !criticalThinking || 
        !creativity || !collaboration || !citizenship || !learningToLearn) {
      return res.status(400).json({
        success: false,
        message: 'All competency ratings are required'
      });
    }

    // Upsert (create or update)
    const competencies = await prisma.coreCompetency.upsert({
      where: {
        learnerId_term_academicYear: {
          learnerId,
          term: term as Term,
          academicYear: parseInt(academicYear)
        }
      },
      update: {
        communication: communication as DetailedRubricRating,
        communicationComment,
        criticalThinking: criticalThinking as DetailedRubricRating,
        criticalThinkingComment,
        creativity: creativity as DetailedRubricRating,
        creativityComment,
        collaboration: collaboration as DetailedRubricRating,
        collaborationComment,
        citizenship: citizenship as DetailedRubricRating,
        citizenshipComment,
        learningToLearn: learningToLearn as DetailedRubricRating,
        learningToLearnComment,
        assessedBy
      },
      create: {
        learnerId,
        term: term as Term,
        academicYear: parseInt(academicYear),
        communication: communication as DetailedRubricRating,
        communicationComment,
        criticalThinking: criticalThinking as DetailedRubricRating,
        criticalThinkingComment,
        creativity: creativity as DetailedRubricRating,
        creativityComment,
        collaboration: collaboration as DetailedRubricRating,
        collaborationComment,
        citizenship: citizenship as DetailedRubricRating,
        citizenshipComment,
        learningToLearn: learningToLearn as DetailedRubricRating,
        learningToLearnComment,
        assessedBy
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        assessor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Core competencies saved successfully',
      data: competencies
    });

  } catch (error: any) {
    console.error('Error saving core competencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save core competencies',
      error: error.message
    });
  }
};

/**
 * Get Core Competencies for a Learner
 * GET /api/cbc/competencies/:learnerId?term=TERM_1&academicYear=2026
 */
export const getCompetenciesByLearner = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    if (!term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Term and academic year are required'
      });
    }

    const competencies = await prisma.coreCompetency.findUnique({
      where: {
        learnerId_term_academicYear: {
          learnerId,
          term: term as Term,
          academicYear: parseInt(academicYear as string)
        }
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        assessor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: competencies
    });

  } catch (error: any) {
    console.error('Error fetching core competencies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch core competencies',
      error: error.message
    });
  }
};

// ============================================
// VALUES ASSESSMENT
// ============================================

/**
 * Create or Update Values Assessment
 * POST /api/cbc/values
 */
export const createOrUpdateValues = async (req: AuthRequest, res: Response) => {
  try {
    const {
      learnerId,
      term,
      academicYear,
      love,
      responsibility,
      respect,
      unity,
      peace,
      patriotism,
      integrity,
      comment
    } = req.body;

    const assessedBy = req.user?.userId;

    if (!assessedBy) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Validate required fields
    if (!learnerId || !term || !academicYear || !love || !responsibility || 
        !respect || !unity || !peace || !patriotism || !integrity) {
      return res.status(400).json({
        success: false,
        message: 'All value ratings are required'
      });
    }

    // Upsert
    const values = await prisma.valuesAssessment.upsert({
      where: {
        learnerId_term_academicYear: {
          learnerId,
          term: term as Term,
          academicYear: parseInt(academicYear)
        }
      },
      update: {
        love: love as DetailedRubricRating,
        responsibility: responsibility as DetailedRubricRating,
        respect: respect as DetailedRubricRating,
        unity: unity as DetailedRubricRating,
        peace: peace as DetailedRubricRating,
        patriotism: patriotism as DetailedRubricRating,
        integrity: integrity as DetailedRubricRating,
        comment,
        assessedBy
      },
      create: {
        learnerId,
        term: term as Term,
        academicYear: parseInt(academicYear),
        love: love as DetailedRubricRating,
        responsibility: responsibility as DetailedRubricRating,
        respect: respect as DetailedRubricRating,
        unity: unity as DetailedRubricRating,
        peace: peace as DetailedRubricRating,
        patriotism: patriotism as DetailedRubricRating,
        integrity: integrity as DetailedRubricRating,
        comment,
        assessedBy
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Values assessment saved successfully',
      data: values
    });

  } catch (error: any) {
    console.error('Error saving values assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save values assessment',
      error: error.message
    });
  }
};

/**
 * Get Values Assessment for a Learner
 * GET /api/cbc/values/:learnerId?term=TERM_1&academicYear=2026
 */
export const getValuesByLearner = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    if (!term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Term and academic year are required'
      });
    }

    const values = await prisma.valuesAssessment.findUnique({
      where: {
        learnerId_term_academicYear: {
          learnerId,
          term: term as Term,
          academicYear: parseInt(academicYear as string)
        }
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: values
    });

  } catch (error: any) {
    console.error('Error fetching values assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch values assessment',
      error: error.message
    });
  }
};

// ============================================
// CO-CURRICULAR ACTIVITIES
// ============================================

/**
 * Create Co-Curricular Activity
 * POST /api/cbc/cocurricular
 */
export const createCoCurricular = async (req: AuthRequest, res: Response) => {
  try {
    const {
      learnerId,
      term,
      academicYear,
      activityName,
      activityType,
      performance,
      achievements,
      remarks
    } = req.body;

    const recordedBy = req.user?.userId;

    if (!recordedBy) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!learnerId || !term || !academicYear || !activityName || !activityType || !performance) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const activity = await prisma.coCurricularActivity.create({
      data: {
        learnerId,
        term: term as Term,
        academicYear: parseInt(academicYear),
        activityName,
        activityType,
        performance: performance as DetailedRubricRating,
        achievements,
        remarks,
        recordedBy
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Co-curricular activity created successfully',
      data: activity
    });

  } catch (error: any) {
    console.error('Error creating co-curricular activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create co-curricular activity',
      error: error.message
    });
  }
};

/**
 * Get Co-Curricular Activities for a Learner
 * GET /api/cbc/cocurricular/:learnerId?term=TERM_1&academicYear=2026
 */
export const getCoCurricularByLearner = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    const whereClause: any = { learnerId };
    
    if (term) whereClause.term = term as Term;
    if (academicYear) whereClause.academicYear = parseInt(academicYear as string);

    const activities = await prisma.coCurricularActivity.findMany({
      where: whereClause,
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        },
        recorder: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: activities,
      count: activities.length
    });

  } catch (error: any) {
    console.error('Error fetching co-curricular activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch co-curricular activities',
      error: error.message
    });
  }
};

/**
 * Update Co-Curricular Activity
 * PUT /api/cbc/cocurricular/:id
 */
export const updateCoCurricular = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.recordedBy;

    const activity = await prisma.coCurricularActivity.update({
      where: { id },
      data: updateData,
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Co-curricular activity updated successfully',
      data: activity
    });

  } catch (error: any) {
    console.error('Error updating co-curricular activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update co-curricular activity',
      error: error.message
    });
  }
};

/**
 * Delete Co-Curricular Activity
 * DELETE /api/cbc/cocurricular/:id
 */
export const deleteCoCurricular = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.coCurricularActivity.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Co-curricular activity deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting co-curricular activity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete co-curricular activity',
      error: error.message
    });
  }
};

// ============================================
// TERMLY REPORT COMMENTS
// ============================================

/**
 * Save Termly Report Comments
 * POST /api/cbc/comments
 */
export const saveReportComments = async (req: Request, res: Response) => {
  try {
    const {
      learnerId,
      term,
      academicYear,
      classTeacherComment,
      classTeacherName,
      classTeacherSignature,
      headTeacherComment,
      headTeacherName,
      headTeacherSignature,
      nextTermOpens
    } = req.body;

    if (!learnerId || !term || !academicYear || !classTeacherComment || !classTeacherName || !nextTermOpens) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const comments = await prisma.termlyReportComment.upsert({
      where: {
        learnerId_term_academicYear: {
          learnerId,
          term: term as Term,
          academicYear: parseInt(academicYear)
        }
      },
      update: {
        classTeacherComment,
        classTeacherName,
        classTeacherSignature,
        classTeacherDate: new Date(),
        headTeacherComment,
        headTeacherName,
        headTeacherSignature,
        headTeacherDate: headTeacherComment ? new Date() : undefined,
        nextTermOpens: new Date(nextTermOpens)
      },
      create: {
        learnerId,
        term: term as Term,
        academicYear: parseInt(academicYear),
        classTeacherComment,
        classTeacherName,
        classTeacherSignature,
        classTeacherDate: new Date(),
        headTeacherComment,
        headTeacherName,
        headTeacherSignature,
        headTeacherDate: headTeacherComment ? new Date() : undefined,
        nextTermOpens: new Date(nextTermOpens)
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Report comments saved successfully',
      data: comments
    });

  } catch (error: any) {
    console.error('Error saving report comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save report comments',
      error: error.message
    });
  }
};

/**
 * Get Termly Report Comments for a Learner
 * GET /api/cbc/comments/:learnerId?term=TERM_1&academicYear=2026
 */
export const getCommentsByLearner = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    if (!term || !academicYear) {
      return res.status(400).json({
        success: false,
        message: 'Term and academic year are required'
      });
    }

    const comments = await prisma.termlyReportComment.findUnique({
      where: {
        learnerId_term_academicYear: {
          learnerId,
          term: term as Term,
          academicYear: parseInt(academicYear as string)
        }
      },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: comments
    });

  } catch (error: any) {
    console.error('Error fetching report comments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch report comments',
      error: error.message
    });
  }
};
```

Create file: `server/src/routes/cbcRoutes.ts`

```typescript
/**
 * CBC Assessment Routes
 * Routes for Core Competencies, Values, and Co-Curricular Activities
 */

import express from 'express';
import * as cbcController from '../controllers/cbcController';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();

// Core Competencies
router.post('/competencies', authenticate, cbcController.createOrUpdateCompetencies);
router.get('/competencies/:learnerId', authenticate, cbcController.getCompetenciesByLearner);

// Values Assessment
router.post('/values', authenticate, cbcController.createOrUpdateValues);
router.get('/values/:learnerId', authenticate, cbcController.getValuesByLearner);

// Co-Curricular Activities
router.post('/cocurricular', authenticate, cbcController.createCoCurricular);
router.get('/cocurricular/:learnerId', authenticate, cbcController.getCoCurricularByLearner);
router.put('/cocurricular/:id', authenticate, cbcController.updateCoCurricular);
router.delete('/cocurricular/:id', authenticate, cbcController.deleteCoCurricular);

// Termly Report Comments
router.post('/comments', authenticate, cbcController.saveReportComments);
router.get('/comments/:learnerId', authenticate, cbcController.getCommentsByLearner);

export default router;
```

Update `server/src/routes/index.ts` to include CBC routes:

```typescript
import cbcRoutes from './cbcRoutes';

// Add to router mounting section:
router.use('/cbc', cbcRoutes);
```

✅ **Checkpoint:** Backend should now have `/api/cbc/*` endpoints working.

---

### **STEP 3: Replace Old Formative Report** ⏱️ 5 minutes

```bash
# Backup the old file
cd src/components/CBCGrading/pages
cp FormativeReport.jsx FormativeReport_OLD_BACKUP.jsx

# Replace with new version
cp FormativeReport_NEW.jsx FormativeReport.jsx
```

Update the import in `CBCGradingSystem.jsx` if needed (should auto-pick up the change).

✅ **Checkpoint:** Formative Reports should now show real data from the API.

---

### **STEP 4: Create Summative Report Page** ⏱️ 2-3 hours

Create file: `src/components/CBCGrading/pages/SummativeReport.jsx`

See detailed component code in the continuation document: `SUMMATIVE_REPORT_IMPLEMENTATION.md`

---

### **STEP 5: Create CBC Input Pages** ⏱️ 3-4 hours

Create these files:
1. `src/components/CBCGrading/pages/CoreCompetenciesAssessment.jsx`
2. `src/components/CBCGrading/pages/ValuesAssessment.jsx`
3. `src/components/CBCGrading/pages/CoCurricularActivities.jsx`

See detailed component code in: `CBC_INPUT_PAGES_IMPLEMENTATION.md`

---

### **STEP 6: Enhance Termly Report** ⏱️ 2-3 hours

Update `src/components/CBCGrading/pages/TermlyReport.jsx` to:
- Fetch data from `/api/reports/termly/:learnerId`
- Display all CBC sections
- Show real attendance data
- Include all signatures

See detailed updates in: `TERMLY_REPORT_ENHANCEMENT.md`

---

### **STEP 7: Create Analytics Dashboard** ⏱️ 4-5 hours

Create `src/components/CBCGrading/pages/Assess