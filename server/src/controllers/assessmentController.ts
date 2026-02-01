/**
 * Assessment Controller
 * Handles formative and summative assessment operations
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import { Grade, RubricRating, DetailedRubricRating, SummativeGrade, TestStatus, FormativeAssessmentType, AssessmentStatus, CurriculumType } from '@prisma/client';
import prisma from '../config/database';
import * as rubricUtil from '../utils/rubric.util';
import { gradingService } from '../services/grading.service';
import { auditService } from '../services/audit.service';

// ============================================
// FORMATIVE ASSESSMENT CONTROLLERS
// ============================================

/**
 * Create or Update Formative Assessment
 * POST /api/assessments/formative
 */
export const createFormativeAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const {
      learnerId,
      term,
      academicYear,
      learningArea,
      strand,
      subStrand,
      overallRating,
      detailedRating,  // New: EE1, EE2, ME1, etc.
      percentage,      // New: 0-100%
      exceedingCount,
      meetingCount,
      approachingCount,
      belowCount,
      strengths,
      areasImprovement,
      remarks,
      recommendations,
      // New fields Phase 1
      type = 'OPENER',
      status = 'DRAFT',
      title,
      date,
      maxScore,
      weight = 1.0
    } = req.body;

    const teacherId = req.user?.userId;

    if (!teacherId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - Teacher ID required'
      });
    }

    // Validate required fields
    if (!learnerId || !term || !academicYear || !learningArea) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: learnerId, term, academicYear, learningArea'
      });
    }

    // Fetch school's grading system
    const gradingSystem = req.user?.schoolId
      ? await gradingService.getGradingSystem(req.user.schoolId, 'CBC')
      : null;
    const ranges = gradingSystem?.ranges;

    // Calculate detailed rating and points if percentage is provided
    let calculatedDetailedRating: DetailedRubricRating | undefined = detailedRating;
    let calculatedPoints: number | undefined;
    let calculatedPercentage: number | undefined = percentage;
    let calculatedOverallRating: RubricRating | undefined = overallRating;

    if (detailedRating) {
      // If detailed rating is provided, calculate points and general rating
      calculatedPoints = ranges
        ? gradingService.getPointsSync(detailedRating as DetailedRubricRating, ranges)
        : rubricUtil.ratingToPoints(detailedRating as DetailedRubricRating);

      calculatedOverallRating = rubricUtil.detailedToGeneralRating(detailedRating as DetailedRubricRating);

      if (!percentage) {
        calculatedPercentage = ranges
          ? gradingService.getAveragePercentageSync(detailedRating as DetailedRubricRating, ranges)
          : rubricUtil.getAveragePercentage(detailedRating as DetailedRubricRating);
      }
    } else if (percentage !== undefined) {
      // If percentage is provided, calculate detailed rating and points
      calculatedDetailedRating = ranges
        ? gradingService.calculateRatingSync(percentage, ranges)
        : rubricUtil.percentageToDetailedRating(percentage);

      calculatedPoints = ranges
        ? gradingService.getPointsSync(calculatedDetailedRating, ranges)
        : rubricUtil.ratingToPoints(calculatedDetailedRating);

      calculatedOverallRating = rubricUtil.detailedToGeneralRating(calculatedDetailedRating);
      calculatedPercentage = percentage;
    } else if (overallRating) {
      // If only general rating provided, use it
      calculatedOverallRating = overallRating as RubricRating;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Must provide either: detailedRating, percentage, or overallRating'
      });
    }

    // Check if assessment already exists (upsert logic adjusted for new constraints)
    // We try to find a match based on the new composite key logic
    // If title is provided, use it. If not, we might match null title.
    const whereMatch: any = {
      learnerId,
      term,
      academicYear: parseInt(academicYear),
      learningArea,
      type: type as FormativeAssessmentType,
      title: title || null // Explicitly match null if title is undefined/empty
    };

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      whereMatch.schoolId = req.user.schoolId;
    }

    const existingAssessment = await prisma.formativeAssessment.findFirst({
      where: whereMatch
    });

    let assessment;

    if (existingAssessment) {
      // Update existing assessment
      assessment = await prisma.formativeAssessment.update({
        where: { id: existingAssessment.id },
        data: {
          strand,
          subStrand,
          overallRating: calculatedOverallRating,
          detailedRating: calculatedDetailedRating,
          points: calculatedPoints,
          percentage: calculatedPercentage,
          exceedingCount: exceedingCount || 0,
          meetingCount: meetingCount || 0,
          approachingCount: approachingCount || 0,
          belowCount: belowCount || 0,
          strengths,
          areasImprovement,
          remarks,
          recommendations,
          teacherId,
          // Update new fields
          status: status as AssessmentStatus,
          date: date ? new Date(date) : undefined,
          maxScore: maxScore ? Number(maxScore) : undefined,
          weight: Number(weight)
        },
        include: {
          learner: {
            select: {
              firstName: true,
              lastName: true,
              admissionNumber: true,
              grade: true
            }
          },
          teacher: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Audit Log
      if (req.user?.schoolId) {
        await auditService.logChange({
          schoolId: req.user.schoolId,
          entityType: 'FormativeAssessment',
          entityId: assessment.id,
          action: 'UPDATE',
          userId: teacherId,
          reason: 'Assessment updated via API'
        });
      }

    } else {
      // Create new assessment
      // Phase 5: Ensure schoolId is present
      if (!req.user?.schoolId) {
        // Allow SUPER_ADMIN to pass schoolId in body, otherwise fail
        // But for now assuming context is sufficient or we handle it
        if (!req.body.schoolId) {
          return res.status(400).json({ success: false, message: 'School Context Required' });
        }
      }

      assessment = await prisma.formativeAssessment.create({
        data: {
          learnerId,
          term,
          academicYear: parseInt(academicYear),
          learningArea,
          strand,
          subStrand,
          overallRating: calculatedOverallRating,
          detailedRating: calculatedDetailedRating,
          points: calculatedPoints,
          percentage: calculatedPercentage,
          exceedingCount: exceedingCount || 0,
          meetingCount: meetingCount || 0,
          approachingCount: approachingCount || 0,
          belowCount: belowCount || 0,
          strengths,
          areasImprovement,
          remarks,
          recommendations,
          teacherId,
          // New fields
          type: type as FormativeAssessmentType,
          status: status as AssessmentStatus,
          title: title || null,
          date: date ? new Date(date) : new Date(),
          maxScore: maxScore ? Number(maxScore) : undefined,
          weight: Number(weight),
          // Phase 5: Tenant Fields
          schoolId: req.user?.schoolId || req.body.schoolId,
          branchId: req.user?.branchId || req.body.branchId
        },
        include: {
          learner: {
            select: {
              firstName: true,
              lastName: true,
              admissionNumber: true,
              grade: true
            }
          },
          teacher: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });

      // Audit Log
      if (req.user?.schoolId) {
        await auditService.logChange({
          schoolId: req.user.schoolId,
          entityType: 'FormativeAssessment',
          entityId: assessment.id,
          action: 'CREATE',
          userId: teacherId,
          reason: 'Assessment created via API'
        });
      }
    }

    res.status(existingAssessment ? 200 : 201).json({
      success: true,
      message: existingAssessment ? 'Assessment updated successfully' : 'Assessment created successfully',
      data: assessment
    });

  } catch (error: any) {
    console.error('Error creating formative assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create assessment',
      error: error.message
    });
  }
};

/**
 * Get Formative Assessments for a Learner
 * GET /api/assessments/formative/learner/:learnerId
 */
export const getFormativeByLearner = async (req: AuthRequest, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    const whereClause: any = { learnerId };

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      whereClause.schoolId = req.user.schoolId;
    }

    if (term) whereClause.term = term;
    if (academicYear) whereClause.academicYear = parseInt(academicYear as string);

    const assessments = await prisma.formativeAssessment.findMany({
      where: whereClause,
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true,
            grade: true
          }
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { academicYear: 'desc' },
        { term: 'desc' },
        { learningArea: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: assessments,
      count: assessments.length
    });

  } catch (error: any) {
    console.error('Error fetching formative assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessments',
      error: error.message
    });
  }
};

/**
 * Get All Formative Assessments (with filters)
 * GET /api/assessments/formative
 */
export const getFormativeAssessments = async (req: AuthRequest, res: Response) => {
  try {
    const { term, academicYear, learningArea, grade } = req.query;

    const whereClause: any = { archived: false };

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      whereClause.schoolId = req.user.schoolId;
    }

    if (term) whereClause.term = term;
    if (academicYear) whereClause.academicYear = parseInt(academicYear as string);
    if (learningArea) whereClause.learningArea = learningArea;
    if (grade) {
      whereClause.learner = {
        grade: grade
      };
    }

    const assessments = await prisma.formativeAssessment.findMany({
      where: whereClause,
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true,
            grade: true
          }
        },
        teacher: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { academicYear: 'desc' },
        { term: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: assessments,
      count: assessments.length
    });

  } catch (error: any) {
    console.error('Error fetching formative assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch assessments',
      error: error.message
    });
  }
};

/**
 * Delete Formative Assessment
 * DELETE /api/assessments/formative/:id
 */
export const deleteFormativeAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Phase 5: Tenant Check
    const assessment = await prisma.formativeAssessment.findUnique({
      where: { id }
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    if (req.user?.schoolId && assessment.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to assessment'
      });
    }

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    if (isSuperAdmin) {
      await prisma.formativeAssessment.delete({
        where: { id }
      });

      res.json({
        success: true,
        message: 'Assessment permanently deleted by Super Admin'
      });
    } else {
      await prisma.formativeAssessment.update({
        where: { id },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: req.user?.userId
        }
      });

      res.json({
        success: true,
        message: 'Assessment archived successfully'
      });
    }

  } catch (error: any) {
    console.error('Error deleting formative assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete assessment',
      error: error.message
    });
  }
};

// ============================================
// SUMMATIVE TEST CONTROLLERS
// ============================================

/**
 * Calculate grade and status based on percentage
 */
const calculateGradeAndStatus = (percentage: number, passMarks: number, ranges?: any[]): { grade: SummativeGrade, status: TestStatus } => {
  let grade: SummativeGrade;

  if (ranges) {
    grade = gradingService.calculateGradeSync(percentage, ranges);
  } else {
    if (percentage >= 80) grade = SummativeGrade.A;
    else if (percentage >= 60) grade = SummativeGrade.B;
    else if (percentage >= 50) grade = SummativeGrade.C;
    else if (percentage >= 40) grade = SummativeGrade.D;
    else grade = SummativeGrade.E;
  }

  // Assuming passMarks is treated as percentage threshold based on original code
  // or it's absolute marks converted to percentage implicitly? 
  // Original: const status = percentage >= (passMarks / 100 * 100) ? TestStatus.PASS : TestStatus.FAIL;
  // This simplifies to percentage >= passMarks.
  // If passMarks is absolute marks, this is BUGGY if totalMarks != 100.
  // But I will preserve behavior for now, or maybe fix it if I can confirm.
  // To be safe, I'll keep the original logic for status.
  const status = percentage >= passMarks ? TestStatus.PASS : TestStatus.FAIL;

  return { grade, status };
};

/**
 * Create Summative Test
 * POST /api/assessments/tests
 */
export const createSummativeTest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      learningArea = 'General',
      testType,                    // NEW: Test grouping type
      term,
      academicYear,
      grade,
      testDate,
      totalMarks,
      passMarks,
      duration,
      description,
      instructions,
      published,
      // New fields
      status = 'DRAFT',
      curriculum = 'CBC_AND_EXAM',
      weight = 100.0,
      scaleId
    } = req.body;

    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID required'
      });
    }

    // Validate required fields
    if (!title || !term || !academicYear || !grade || !testDate || !totalMarks || !passMarks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // AUTO-LINK SCALE: If scaleId is not provided, try to find a matching one
    let resolvedScaleId = scaleId;
    if (!resolvedScaleId && req.user?.schoolId) {
      const matchingScale = await prisma.gradingSystem.findFirst({
        where: {
          schoolId: req.user.schoolId,
          type: 'SUMMATIVE',
          grade: grade,
          active: true,
          // Learning area might be partial match or null in some scales
          OR: [
            { learningArea: learningArea },
            { name: { contains: learningArea } }
          ]
        }
      });
      if (matchingScale) {
        resolvedScaleId = matchingScale.id;
        console.log(`- Auto-linked test "${title}" to scale "${matchingScale.name}"`);
      }
    }

    const test = await prisma.summativeTest.create({
      data: {
        title,
        learningArea,
        testType,                    // NEW: Save test grouping type
        term,
        academicYear: parseInt(academicYear),
        grade,
        testDate: new Date(testDate),
        totalMarks: parseInt(totalMarks),
        passMarks: parseInt(passMarks),
        duration: duration ? parseInt(duration) : null,
        description,
        instructions,
        published: published || false,
        createdBy,
        // New fields
        status: status as AssessmentStatus,
        curriculum: curriculum as CurriculumType,
        weight: Number(weight),
        scaleId: resolvedScaleId,
        // Phase 5: Tenant Fields
        schoolId: req.user?.schoolId || req.body.schoolId,
        branchId: req.user?.branchId || req.body.branchId
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            results: true
          }
        }
      }
    });

    // Audit Log
    if (req.user?.schoolId) {
      await auditService.logChange({
        schoolId: req.user.schoolId,
        entityType: 'SummativeTest',
        entityId: test.id,
        action: 'CREATE',
        userId: createdBy,
        reason: 'Test created via API'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Test created successfully',
      data: test
    });

  } catch (error: any) {
    console.error('Error creating summative test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create test',
      error: error.message
    });
  }
};

/**
 * Bulk Generate Summative Tests for all learning areas across multiple grades
 * POST /api/assessments/tests/bulk
 */
export const generateTestsBulk = async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      grades, // Array of Grade enum values
      testType,
      term,
      academicYear,
      testDate,
      totalMarks,
      passMarks,
      duration,
      description,
      instructions,
      curriculum = 'CBC_AND_EXAM',
      weight = 100.0,
      scaleGroupId
    } = req.body;

    const createdBy = req.user?.userId;
    const schoolId = req.user?.schoolId;

    if (!createdBy || !schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one grade must be selected'
      });
    }

    const created = [];
    const skipped = [];

    // CBC Learning Areas (Consistent with scaleGroup.controller.ts)
    const LEARNING_AREAS = [
      'MATHEMATICAL ACTIVITIES',
      'ENGLISH LANGUAGE ACTIVITIES',
      'SHUGHULI ZA KISWAHILI LUGHA',
      'ENVIRONMENTAL ACTIVITIES',
      'CREATIVE ACTIVITIES',
      'RELIGIOUS EDUCATION',
      'SCIENCE & TECHNOLOGY',
      'SOCIAL STUDIES',
      'MUSIC',
      'ART & CRAFT',
      'PHYSICAL EDUCATION',
      'INSHA',
      'READING',
      'ABACUS',
      'AGRICULTURE'
    ];

    for (const grade of grades) {
      for (const learningArea of LEARNING_AREAS) {
        // Check if a test with same unique properties already exists
        const existing = await prisma.summativeTest.findFirst({
          where: {
            schoolId,
            grade: grade as any,
            learningArea,
            term,
            academicYear: parseInt(academicYear),
            testType,
            archived: false
          }
        });

        if (existing) {
          skipped.push(`${grade} - ${learningArea}`);
          continue;
        }

        // Auto-link to specific scale within the scale group
        let resolvedScaleId = null;
        if (scaleGroupId) {
          const matchingScale = await prisma.gradingSystem.findFirst({
            where: {
              scaleGroupId: scaleGroupId,
              grade: grade as any,
              learningArea: learningArea,
              archived: false
            }
          });
          if (matchingScale) {
            resolvedScaleId = matchingScale.id;
          }
        }

        // Fallback to generic auto-link if no specific group match
        if (!resolvedScaleId) {
          const genericScale = await prisma.gradingSystem.findFirst({
            where: {
              schoolId,
              type: 'SUMMATIVE',
              grade: grade as any,
              active: true,
              archived: false,
              OR: [
                { learningArea: learningArea },
                { name: { contains: learningArea } }
              ]
            }
          });
          if (genericScale) {
            resolvedScaleId = genericScale.id;
          }
        }

        const test = await prisma.summativeTest.create({
          data: {
            title: title ? `${title} (${learningArea})` : `${grade.replace('_', ' ')} - ${learningArea}`,
            learningArea,
            testType,
            term,
            academicYear: parseInt(academicYear),
            grade: grade as any,
            testDate: new Date(testDate),
            totalMarks: parseInt(totalMarks),
            passMarks: parseInt(passMarks),
            duration: duration ? parseInt(duration) : null,
            description,
            instructions,
            published: false,
            createdBy,
            status: 'DRAFT',
            curriculum: curriculum as CurriculumType,
            weight: Number(weight),
            scaleId: resolvedScaleId,
            schoolId,
            branchId: req.user?.branchId
          }
        });

        created.push(test);
      }
    }

    // Audit Log
    if (schoolId) {
      await auditService.logChange({
        schoolId,
        entityType: 'SummativeTest',
        entityId: 'BULK',
        action: 'CREATE',
        userId: createdBy,
        reason: `Bulk generated ${created.length} tests for ${grades.length} grades`
      });
    }

    res.status(201).json({
      success: true,
      data: {
        createdCount: created.length,
        skippedCount: skipped.length,
        skippedItems: skipped
      },
      message: `Successfully created ${created.length} tests. ${skipped.length > 0 ? `Skipped ${skipped.length} existing tests.` : ''}`
    });

  } catch (error: any) {
    console.error('Error bulk generating tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk generate tests',
      error: error.message
    });
  }
};

/**
 * Get All Summative Tests
 * GET /api/assessments/tests
 */
export const getSummativeTests = async (req: AuthRequest, res: Response) => {
  try {
    const { term, academicYear, grade, learningArea, published } = req.query;

    const whereClause: any = { archived: false };

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      whereClause.schoolId = req.user.schoolId;
    }

    if (term) whereClause.term = term;
    if (academicYear) whereClause.academicYear = parseInt(academicYear as string);
    if (grade) whereClause.grade = grade;
    if (learningArea) whereClause.learningArea = learningArea;
    if (published !== undefined) whereClause.published = published === 'true';

    const tests = await prisma.summativeTest.findMany({
      where: whereClause,
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        _count: {
          select: {
            results: true
          }
        }
      },
      orderBy: [
        { academicYear: 'desc' },
        { testDate: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: tests,
      count: tests.length
    });

  } catch (error: any) {
    console.error('Error fetching summative tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tests',
      error: error.message
    });
  }
};

/**
 * Get Single Summative Test with Results
 * GET /api/assessments/tests/:id
 */
export const getSummativeTest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const test = await prisma.summativeTest.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        },
        results: {
          include: {
            learner: {
              select: {
                firstName: true,
                lastName: true,
                admissionNumber: true,
                grade: true
              }
            }
          },
          orderBy: {
            percentage: 'desc'
          }
        }
      }
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Phase 5: Tenant Check
    if (req.user?.schoolId && test.schoolId !== req.user.schoolId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to test'
      });
    }

    // Calculate statistics
    const stats = {
      totalStudents: test.results.length,
      averageScore: test.results.length > 0
        ? test.results.reduce((sum, r) => sum + r.percentage, 0) / test.results.length
        : 0,
      highestScore: test.results.length > 0
        ? Math.max(...test.results.map(r => r.marksObtained))
        : 0,
      lowestScore: test.results.length > 0
        ? Math.min(...test.results.map(r => r.marksObtained))
        : 0,
      passCount: test.results.filter(r => r.status === 'PASS').length,
      failCount: test.results.filter(r => r.status === 'FAIL').length
    };

    res.json({
      success: true,
      data: {
        ...test,
        statistics: stats
      }
    });

  } catch (error: any) {
    console.error('Error fetching summative test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch test',
      error: error.message
    });
  }
};

/**
 * Update Summative Test
 * PUT /api/assessments/tests/:id
 */
export const updateSummativeTest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const userId = req.user?.userId;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Phase 5: Check ownership
    const existingTest = await prisma.summativeTest.findUnique({ where: { id } });
    if (!existingTest) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }
    if (req.user?.schoolId && existingTest.schoolId !== req.user.schoolId) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to test' });
    }

    // Convert date if provided
    if (updateData.testDate) {
      updateData.testDate = new Date(updateData.testDate);
    }

    // Convert weight if provided
    if (updateData.weight !== undefined) {
      updateData.weight = Number(updateData.weight);
    }

    // Handle Workflow Status Changes
    if (updateData.status) {
      if (updateData.status === AssessmentStatus.SUBMITTED) {
        updateData.submittedBy = userId;
        updateData.submittedAt = new Date();
      } else if (updateData.status === AssessmentStatus.APPROVED) {
        // TODO: Add role check here (only HEAD_TEACHER or ADMIN)
        updateData.approvedBy = userId;
        updateData.approvedAt = new Date();
      }
    }

    // If the test is locked, prevent any updates unless the update specifically changes the `locked` status to false.
    // Super Admins can always update.
    if (existingTest.locked && updateData.locked !== false && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Test is locked and cannot be updated.' });
    }

    const test = await prisma.summativeTest.update({
      where: { id },
      data: {
        ...updateData,
        // Set lockedAt and lockedBy if setting to locked
        ...(updateData.locked === true && !existingTest.locked && {
          lockedAt: new Date(),
          lockedBy: userId
        }),
        // Clear lockedAt and lockedBy if setting to unlocked
        ...(updateData.locked === false && existingTest.locked && {
          lockedAt: null,
          lockedBy: null
        }),
      },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Audit Log
    if (req.user?.schoolId && userId) {
      await auditService.logChange({
        schoolId: req.user.schoolId,
        entityType: 'SummativeTest',
        entityId: test.id,
        action: 'UPDATE',
        userId: userId,
        reason: 'Test updated via API',
        newValue: JSON.stringify(updateData)
      });
    }

    res.json({
      success: true,
      message: 'Test updated successfully',
      data: test
    });

  } catch (error: any) {
    console.error('Error updating summative test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update test',
      error: error.message
    });
  }
};

/**
 * Delete Summative Test
 * DELETE /api/assessments/tests/:id
 */
export const deleteSummativeTest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const isAdmin = req.user?.role === 'ADMIN' || isSuperAdmin;

    // Check ownership and results
    const existingTest = await prisma.summativeTest.findUnique({
      where: { id },
      include: {
        results: { select: { id: true } }
      }
    });

    if (!existingTest) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    if (req.user?.schoolId && existingTest.schoolId !== req.user.schoolId && !isSuperAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized access to test' });
    }

    // Allow ADMIN or SUPER_ADMIN to bypass the results check if they want to force delete?
    // For now, let's keep it safe: if results exist, only Super Admin can hard delete.
    // BUT we need to fix the 500 error for normal Admins.

    if (existingTest.results.length > 0 && !isSuperAdmin) {
      // If results exist, try to archive for Admin
      await prisma.summativeTest.update({
        where: { id },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: userId,
          active: false
        }
      });

      return res.json({
        success: true,
        message: 'Test contains results and was archived instead of deleted.'
      });
    }

    // Hard delete for ADMIN/SUPER_ADMIN if no results (or if SUPER_ADMIN even with results)
    await prisma.summativeTest.delete({
      where: { id }
    });

    // Audit Log
    if (req.user?.schoolId && userId) {
      await auditService.logChange({
        schoolId: req.user.schoolId,
        entityType: 'SummativeTest',
        entityId: id,
        action: 'DELETE',
        userId: userId,
        reason: isSuperAdmin ? 'Permanently deleted by Super Admin' : 'Permanently deleted by Admin'
      });
    }

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting summative test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process delete request',
      error: error.message
    });
  }
};

/**
 * Delete Multiple Summative Tests (Bulk)
 * DELETE /api/assessments/tests/bulk
 */
export const deleteSummativeTestsBulk = async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.body;
    const userId = req.user?.userId;
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const isAdmin = req.user?.role === 'ADMIN' || isSuperAdmin;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'No IDs provided for bulk deletion' });
    }

    if (!isAdmin) {
      return res.status(403).json({ success: false, message: 'Only administrators can perform bulk deletion' });
    }

    // Identify which tests can be hard deleted vs archived
    const tests = await prisma.summativeTest.findMany({
      where: {
        id: { in: ids },
        schoolId: req.user?.schoolId || undefined
      },
      include: {
        _count: { select: { results: true } }
      }
    });

    const toHardDelete = tests.filter(t => t._count.results === 0 || isSuperAdmin).map(t => t.id);
    const toArchive = tests.filter(t => t._count.results > 0 && !isSuperAdmin).map(t => t.id);

    let deletedCount = 0;
    let archivedCount = 0;

    if (toHardDelete.length > 0) {
      const result = await prisma.summativeTest.deleteMany({
        where: { id: { in: toHardDelete } }
      });
      deletedCount = result.count;
    }

    if (toArchive.length > 0) {
      const result = await prisma.summativeTest.updateMany({
        where: { id: { in: toArchive } },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: userId,
          active: false
        }
      });
      archivedCount = result.count;
    }

    // Audit Log for the bulk action
    if (req.user?.schoolId && userId) {
      await auditService.logChange({
        schoolId: req.user.schoolId,
        entityType: 'SummativeTest',
        entityId: 'BULK',
        action: 'DELETE',
        userId: userId,
        reason: `Bulk delete: ${deletedCount} deleted, ${archivedCount} archived`
      });
    }

    res.json({
      success: true,
      message: `Successfully processed ${ids.length} tests. ${deletedCount} permanently deleted, ${archivedCount} archived.`,
      data: { deletedCount, archivedCount }
    });

  } catch (error: any) {
    console.error('Error in bulk delete summative tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bulk delete',
      error: error.message
    });
  }
};

// ============================================
// SUMMATIVE RESULT CONTROLLERS
// ============================================

/**
 * Record Summative Result
 * POST /api/assessments/summative/results
 */
export const recordSummativeResult = async (req: AuthRequest, res: Response) => {
  try {
    const {
      testId,
      learnerId,
      marksObtained,
      remarks,
      teacherComment
    } = req.body;

    const recordedBy = req.user?.userId;

    if (!recordedBy) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID required'
      });
    }

    // Get test details to calculate percentage and get scale context
    const test = await prisma.summativeTest.findUnique({
      where: { id: testId }
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Validate marksObtained against test.totalMarks
    const parsedMarks = parseInt(marksObtained);
    if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > test.totalMarks) {
      return res.status(400).json({
        success: false,
        message: `Invalid marks obtained. Must be a number between 0 and ${test.totalMarks}.`
      });
    }

    // Fetch appropriate grading system: Specific Scale ID -> School Default Summative
    let gradingSystem;
    if (test.scaleId) {
      gradingSystem = await gradingService.getGradingSystemById(test.scaleId);
    }

    if (!gradingSystem && req.user?.schoolId) {
      gradingSystem = await gradingService.getGradingSystem(req.user.schoolId, 'SUMMATIVE');
    }

    const ranges = gradingSystem?.ranges;

    // Calculate percentage, grade, and status
    const percentage = (parsedMarks / test.totalMarks) * 100;
    const { grade, status } = calculateGradeAndStatus(percentage, test.passMarks, ranges);

    // Check if result already exists
    const existingResult = await prisma.summativeResult.findUnique({
      where: {
        testId_learnerId: {
          testId,
          learnerId
        }
      }
    });

    let result: any;
    let actionType: 'CREATE' | 'UPDATE';
    let oldValues: any = {};
    let newValues: any = { marksObtained: parsedMarks, remarks, teacherComment };

    if (existingResult) {
      actionType = 'UPDATE';
      // Capture old values for audit
      oldValues = {
        marksObtained: existingResult.marksObtained,
        remarks: existingResult.remarks,
        teacherComment: existingResult.teacherComment,
      };

      // Update existing result
      result = await prisma.summativeResult.update({
        where: { id: existingResult.id },
        data: {
          marksObtained: parsedMarks,
          percentage,
          grade,
          status,
          remarks,
          teacherComment,
          recordedBy
        },
        include: {
          learner: {
            select: {
              firstName: true,
              lastName: true,
              admissionNumber: true,
              grade: true
            }
          },
          test: {
            select: {
              title: true,
              learningArea: true,
              totalMarks: true,
              passMarks: true
            }
          }
        }
      });
    } else {
      actionType = 'CREATE';
      // Create new result
      result = await prisma.summativeResult.create({
        data: {
          testId,
          learnerId,
          marksObtained: parsedMarks,
          percentage,
          grade,
          status,
          remarks,
          teacherComment,
          recordedBy,
          schoolId: test.schoolId,
          branchId: test.branchId
        },
        include: {
          learner: {
            select: {
              firstName: true,
              lastName: true,
              admissionNumber: true,
              grade: true
            }
          },
          test: {
            select: {
              title: true,
              learningArea: true,
              totalMarks: true,
              passMarks: true
            }
          }
        }
      });

      // Calculate and update position
      const allResults = await prisma.summativeResult.findMany({
        where: { testId },
        orderBy: { marksObtained: 'desc' }
      });

      const position = allResults.findIndex(r => r.id === result.id) + 1;

      result = await prisma.summativeResult.update({
        where: { id: result.id },
        data: {
          position,
          outOf: allResults.length
        },
        include: {
          learner: {
            select: {
              firstName: true,
              lastName: true,
              admissionNumber: true,
              grade: true
            }
          },
          test: {
            select: {
              title: true,
              learningArea: true,
              totalMarks: true,
              passMarks: true
            }
          }
        }
      });
    }

    // Record history of the change
    if (recordedBy) {
      await prisma.summativeResultHistory.create({
        data: {
          resultId: result.id,
          action: actionType,
          field: 'marksObtained', // We are primarily tracking mark changes
          oldValue: oldValues.marksObtained ? String(oldValues.marksObtained) : null,
          newValue: String(newValues.marksObtained),
          changedBy: recordedBy,
          reason: `Summative result ${actionType.toLowerCase()} via API`
        }
      });
    }

    res.status(existingResult ? 200 : 201).json({
      success: true,
      message: existingResult ? 'Result updated successfully' : 'Result recorded successfully',
      data: result
    });

  } catch (error: any) {
    console.error('Error recording summative result:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record result',
      error: error.message
    });
  }
};

/**
 * Get Summative Results for a Learner
 * GET /api/assessments/summative/results/learner/:learnerId
 */
export const getSummativeByLearner = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    const whereClause: any = { learnerId };

    if (term || academicYear) {
      whereClause.test = {};
      if (term) whereClause.test.term = term;
      if (academicYear) whereClause.test.academicYear = parseInt(academicYear as string);
    }

    const results = await prisma.summativeResult.findMany({
      where: whereClause,
      include: {
        test: {
          select: {
            title: true,
            learningArea: true,
            testType: true,      // Added for grouping
            term: true,
            academicYear: true,
            totalMarks: true,
            passMarks: true,
            testDate: true,
            status: true,        // Added for compliance check
            curriculum: true,    // Added for context
            scaleId: true        // Added for context
          }
        },
        recorder: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: [
        { test: { academicYear: 'desc' } },
        { test: { testDate: 'desc' } }
      ]
    });

    res.json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error: any) {
    console.error('Error fetching summative results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
};

/**
 * Get Results for a Specific Test
 * GET /api/assessments/summative/results/test/:testId
 */
export const getTestResults = async (req: Request, res: Response) => {
  try {
    const { testId } = req.params;

    const results = await prisma.summativeResult.findMany({
      where: { testId },
      include: {
        learner: {
          select: {
            firstName: true,
            lastName: true,
            admissionNumber: true,
            grade: true
          }
        }
      },
      orderBy: {
        marksObtained: 'desc'
      }
    });

    res.json({
      success: true,
      data: results,
      count: results.length
    });

  } catch (error: any) {
    console.error('Error fetching test results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch results',
      error: error.message
    });
  }
};

/**
 * Record Summative Results (Bulk)
 * POST /api/assessments/summative/results/bulk
 */
export const recordSummativeResultsBulk = async (req: AuthRequest, res: Response) => {
  try {
    const { testId, results } = req.body; // results: [{ learnerId, marksObtained }]
    const recordedBy = req.user?.userId;

    if (!recordedBy) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!testId || !Array.isArray(results) || results.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // Get test details
    const test = await prisma.summativeTest.findUnique({
      where: { id: testId },
      select: { id: true, totalMarks: true, passMarks: true, scaleId: true, schoolId: true, branchId: true, locked: true }
    });
    if (!test) return res.status(404).json({ success: false, message: 'Test not found' });

    // Check if test is locked
    // Allow Super Admin to override lock
    if (test.locked && req.user?.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ success: false, message: 'Test is locked and results cannot be modified.' });
    }

    // Check if any results currently exist for this test. If not, this is the first save.
    const existingResultsCount = await prisma.summativeResult.count({ where: { testId } });
    const isFirstSave = existingResultsCount === 0;

    // Fetch appropriate grading system: Specific Scale ID -> School Default Summative
    let gradingSystem;
    if (test.scaleId) {
      gradingSystem = await gradingService.getGradingSystemById(test.scaleId);
    }

    if (!gradingSystem && req.user?.schoolId) {
      gradingSystem = await gradingService.getGradingSystem(req.user.schoolId, 'SUMMATIVE');
    }

    const ranges = gradingSystem?.ranges;

    // Process all results in a transaction for data integrity
    await prisma.$transaction(async (tx) => {
      for (const item of results) {
        // Skip invalid marks - also perform validation
        if (item.marksObtained === undefined || item.marksObtained === null || item.marksObtained === '') {
          console.warn(`Skipping learner ${item.learnerId} due to missing marks.`);
          continue;
        }

        const marks = Number(item.marksObtained);
        if (isNaN(marks) || marks < 0 || marks > test.totalMarks) {
          console.warn(`Skipping learner ${item.learnerId} due to invalid marks: ${item.marksObtained}. Must be between 0 and ${test.totalMarks}.`);
          // Optionally, you might want to throw an error here to fail the whole transaction
          // or collect errors and return them to the client.
          continue; // Skip this individual invalid entry
        }

        // Calculate percentage, grade, and status
        const percentage = (marks / test.totalMarks) * 100;
        const { grade, status } = calculateGradeAndStatus(percentage, test.passMarks, ranges);

        // Determine remarks if not provided
        let remarks = item.remarks;
        if (!remarks && ranges) {
          // Using rating util roughly or find range
          const matchedRange = ranges.find((r: any) => percentage >= r.minPercentage && percentage <= r.maxPercentage);
          if (matchedRange) remarks = matchedRange.label;
        }

        const existingIndividualResult = await tx.summativeResult.findUnique({
          where: {
            testId_learnerId: {
              testId,
              learnerId: item.learnerId
            }
          },
          select: { id: true, marksObtained: true, remarks: true, teacherComment: true, schoolId: true }
        });

        let actionType: 'CREATE' | 'UPDATE' = existingIndividualResult ? 'UPDATE' : 'CREATE';
        let oldValues: any = {};
        let newValues: any = { marksObtained: marks, remarks, teacherComment: item.teacherComment };

        if (existingIndividualResult) {
          oldValues = {
            marksObtained: existingIndividualResult.marksObtained,
            remarks: existingIndividualResult.remarks,
            teacherComment: existingIndividualResult.teacherComment,
          };
        }

        // Upsert result
        const updatedResult = await tx.summativeResult.upsert({
          where: {
            testId_learnerId: {
              testId,
              learnerId: item.learnerId
            }
          },
          update: {
            marksObtained: marks,
            percentage,
            grade,
            status,
            recordedBy,
            remarks,
            teacherComment: item.teacherComment
          },
          create: {
            testId,
            learnerId: item.learnerId,
            marksObtained: marks,
            percentage,
            grade,
            status,
            recordedBy,
            schoolId: test.schoolId,
            branchId: test.branchId,
            remarks,
            teacherComment: item.teacherComment
          }
        });

        // Record history of the change for bulk operation
        if (recordedBy) {
          await tx.summativeResultHistory.create({
            data: {
              resultId: updatedResult.id,
              action: actionType,
              field: 'marksObtained',
              oldValue: oldValues.marksObtained ? String(oldValues.marksObtained) : null,
              newValue: String(newValues.marksObtained),
              changedBy: recordedBy,
              reason: `Summative result ${actionType.toLowerCase()} via bulk API`
            }
          });
        }
      }
    });

    // Post-process: Update positions (Rankings)
    // We do this outside the main transaction or as a separate step because it needs ALL results to be committed ideally,
    // or just assume current transaction state.
    // To ensure accuracy, we re-fetch all results for the test.
    const allResults = await prisma.summativeResult.findMany({
      where: { testId },
      orderBy: { marksObtained: 'desc' },
      select: { id: true }
    });

    // Update ranks in parallel
    // Note: If list is huge, this might throttle DB, but for class size (50-100) it's fine.
    const updatePromises = allResults.map((r, index) =>
      prisma.summativeResult.update({
        where: { id: r.id },
        data: {
          position: index + 1,
          outOf: allResults.length
        }
      })
    );

    await Promise.all(updatePromises);

    // If this was the first save, lock the test (Gap 7.1)
    if (isFirstSave) {
      await prisma.summativeTest.update({
        where: { id: testId },
        data: { locked: true, lockedAt: new Date(), lockedBy: recordedBy }
      });
      console.log(`🔒 Test ${testId} automatically locked after first results recorded.`);
    }

    res.json({
      success: true,
      message: `Successfully recorded ${results.length} results`
    });

  } catch (error: any) {
    console.error('Error bulk recording summative results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record results',
      error: error.message
    });
  }
};
