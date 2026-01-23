/**
 * Report Controller - FIXED VERSION
 * Fixes:
 * 1. Removed testType (doesn't exist in schema)
 * 2. Fixed attendance query (no term/academicYear fields)
 * 3. Fixed class analytics (no _count.learners, no classId in learner)
 */

// Apply these fixes to reportController.ts:

// Line 303: Remove testType
// BEFORE:
              testType: true

// AFTER: (delete this line)

//  Line 313: Remove term and academicYear from attendance query
// BEFORE:
      prisma.attendance.findMany({
        where: {
          learnerId,
          term: termValue,
          academicYear: yearValue
        }
      }),

// AFTER:
      prisma.attendance.findMany({
        where: {
          learnerId
          // Note: Filter by date range if needed in production
        }
      }),

// Line 438: Fix _count.learners
// BEFORE:
      include: {
        _count: {
          select: { learners: true }
        }
      }

// AFTER:
      include: {
        enrollments: {
          where: { active: true },
          select: { id: true }
        }
      }

// Line 452: Fix classId in learner
// BEFORE:
    const learners = await prisma.learner.findMany({
      where: { classId, status: 'ACTIVE' },
      select: { id: true }
    });

// AFTER:
    const learners = await prisma.learner.findMany({
      where: {
        enrollments: {
          some: {
            classId,
            active: true
          }
        },
        status: 'ACTIVE'
      },
      select: { id: true }
    });

// Line 489: Fix totalLearners
// BEFORE:
        totalLearners: classInfo._count.learners

// AFTER:
        totalLearners: classInfo.enrollments.length
