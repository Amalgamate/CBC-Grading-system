/**
 * Assessment Controller
 * Handles formative and summative assessment operations
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import { PrismaClient, RubricRating, DetailedRubricRating, SummativeGrade, TestStatus } from '@prisma/client';
import * as rubricUtil from '../utils/rubric.util';

const prisma = new PrismaClient();

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
      recommendations
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

    // Calculate detailed rating and points if percentage is provided
    let calculatedDetailedRating: DetailedRubricRating | undefined = detailedRating;
    let calculatedPoints: number | undefined;
    let calculatedPercentage: number | undefined = percentage;
    let calculatedOverallRating: RubricRating | undefined = overallRating;

    if (detailedRating) {
      // If detailed rating is provided, calculate points and general rating
      calculatedPoints = rubricUtil.ratingToPoints(detailedRating as DetailedRubricRating);
      calculatedOverallRating = rubricUtil.detailedToGeneralRating(detailedRating as DetailedRubricRating);
      if (!percentage) {
        calculatedPercentage = rubricUtil.getAveragePercentage(detailedRating as DetailedRubricRating);
      }
    } else if (percentage !== undefined) {
      // If percentage is provided, calculate detailed rating and points
      calculatedDetailedRating = rubricUtil.percentageToDetailedRating(percentage);
      calculatedPoints = rubricUtil.ratingToPoints(calculatedDetailedRating);
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

    // Check if assessment already exists (upsert)
    const existingAssessment = await prisma.formativeAssessment.findUnique({
      where: {
        learnerId_term_academicYear_learningArea: {
          learnerId,
          term,
          academicYear: parseInt(academicYear),
          learningArea
        }
      }
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
          teacherId
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
    } else {
      // Create new assessment
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
          teacherId
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
export const getFormativeByLearner = async (req: Request, res: Response) => {
  try {
    const { learnerId } = req.params;
    const { term, academicYear } = req.query;

    const whereClause: any = { learnerId };

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
export const getFormativeAssessments = async (req: Request, res: Response) => {
  try {
    const { term, academicYear, learningArea, grade } = req.query;

    const whereClause: any = {};

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
export const deleteFormativeAssessment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.formativeAssessment.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });

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
const calculateGradeAndStatus = (percentage: number, passMarks: number): { grade: SummativeGrade, status: TestStatus } => {
  let grade: SummativeGrade;
  
  if (percentage >= 80) grade = SummativeGrade.A;
  else if (percentage >= 60) grade = SummativeGrade.B;
  else if (percentage >= 50) grade = SummativeGrade.C;
  else if (percentage >= 40) grade = SummativeGrade.D;
  else grade = SummativeGrade.E;

  const status = percentage >= (passMarks / 100 * 100) ? TestStatus.PASS : TestStatus.FAIL;

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
      learningArea,
      term,
      academicYear,
      grade,
      testDate,
      totalMarks,
      passMarks,
      duration,
      description,
      instructions,
      published
    } = req.body;

    const createdBy = req.user?.userId;

    if (!createdBy) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - User ID required'
      });
    }

    // Validate required fields
    if (!title || !learningArea || !term || !academicYear || !grade || !testDate || !totalMarks || !passMarks) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const test = await prisma.summativeTest.create({
      data: {
        title,
        learningArea,
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
        createdBy
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
 * Get All Summative Tests
 * GET /api/assessments/tests
 */
export const getSummativeTests = async (req: Request, res: Response) => {
  try {
    const { term, academicYear, grade, learningArea, published } = req.query;

    const whereClause: any = {};

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
export const getSummativeTest = async (req: Request, res: Response) => {
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
export const updateSummativeTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.createdBy;
    delete updateData.createdAt;

    // Convert date if provided
    if (updateData.testDate) {
      updateData.testDate = new Date(updateData.testDate);
    }

    const test = await prisma.summativeTest.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

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
export const deleteSummativeTest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // This will also delete all associated results (cascade)
    await prisma.summativeTest.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Test deleted successfully'
    });

  } catch (error: any) {
    console.error('Error deleting summative test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete test',
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

    // Validate required fields
    if (!testId || !learnerId || marksObtained === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: testId, learnerId, marksObtained'
      });
    }

    // Get test details to calculate percentage
    const test = await prisma.summativeTest.findUnique({
      where: { id: testId }
    });

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Test not found'
      });
    }

    // Calculate percentage, grade, and status
    const percentage = (parseInt(marksObtained) / test.totalMarks) * 100;
    const { grade, status } = calculateGradeAndStatus(percentage, test.passMarks);

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

    if (existingResult) {
      // Update existing result
      result = await prisma.summativeResult.update({
        where: { id: existingResult.id },
        data: {
          marksObtained: parseInt(marksObtained),
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
      // Create new result
      result = await prisma.summativeResult.create({
        data: {
          testId,
          learnerId,
          marksObtained: parseInt(marksObtained),
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
            term: true,
            academicYear: true,
            totalMarks: true,
            passMarks: true,
            testDate: true
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
