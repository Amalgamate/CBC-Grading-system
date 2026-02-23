/**
 * Bulk Setup Functions - Called from CLI or Admin UI
 * These functions create scales and tests in bulk to eliminate repetitive setup
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import { Grade, Term } from '@prisma/client';
import prisma from '../config/database';

// Define learning areas for each grade
const LEARNING_AREAS_CONFIG: Record<string, string[]> = {
  'PLAYGROUP': ['Child Development Activity', 'Language Activity', 'Mathematical Activity', 'Environmental Activity', 'Creative Activity'],
  'PP1': ['Mathematical Activities', 'Language Activities', 'Literacy & Reading', 'Environmental Activities', 'Creative Activities'],
  'PP2': ['Mathematical Activities', 'Language Activities', 'Literacy & Reading', 'Environmental Activities', 'Creative Activities'],
  'GRADE_1': ['English', 'Mathematics', 'Environmental Activities', 'Creative Activities', 'Physical Education'],
  'GRADE_2': ['English', 'Mathematics', 'Science & Technology', 'Social Studies', 'Creative Activities'],
  'GRADE_3': ['English', 'Mathematics', 'Science & Technology', 'Social Studies', 'Creative Activities'],
  'GRADE_4': ['English', 'Mathematics', 'Science & Technology', 'Social Studies', 'Kenya Sign Language'],
  'GRADE_5': ['English', 'Mathematics', 'Science & Technology', 'Social Studies', 'Kenya Sign Language'],
  'GRADE_6': ['English', 'Mathematics', 'Science & Technology', 'Social Studies', 'Kenya Sign Language'],
};

/**
 * Bulk Create Grading Scales for entire school
 * POST /api/assessments/setup/create-scales
 */
export const bulkCreateGradingScales = async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId;
    if (!schoolId) {
      return res.status(401).json({
        success: false,
        message: 'School ID required'
      });
    }

    const { overwrite = false } = req.body;

    let scaledCreated = 0;
    let scaleSSkipped = 0;
    const logs: string[] = [];

    const gradeRange = [
      'PLAYGROUP',
      'PP1', 
      'PP2', 
      'GRADE_1', 
      'GRADE_2', 
      'GRADE_3', 
      'GRADE_4', 
      'GRADE_5', 
      'GRADE_6'
    ] as const;

    // Standard grading ranges for all scales
    const gradingRanges = [
      { minPercentage: 80, maxPercentage: 100, minMarks: 80, maxMarks: 100, points: 4, grade: 'A', label: 'Excellent', color: '#10b981' },
      { minPercentage: 60, maxPercentage: 79, minMarks: 60, maxMarks: 79, points: 3, grade: 'B', label: 'Good', color: '#3b82f6' },
      { minPercentage: 50, maxPercentage: 59, minMarks: 50, maxMarks: 59, points: 2, grade: 'C', label: 'Average', color: '#f59e0b' },
      { minPercentage: 40, maxPercentage: 49, minMarks: 40, maxMarks: 49, points: 1, grade: 'D', label: 'Pass', color: '#f97316' },
      { minPercentage: 0, maxPercentage: 39, minMarks: 0, maxMarks: 39, points: 0, grade: 'E', label: 'Below Average', color: '#ef4444' }
    ];

    for (const grade of gradeRange) {
      const learningAreas = LEARNING_AREAS_CONFIG[grade] || [];

      for (const learningArea of learningAreas) {
        const scaleName = `${grade} - ${learningArea}`;

        // Check if already exists
        const existing = await prisma.gradingSystem.findFirst({
          where: {
            schoolId,
            name: scaleName
          }
        });

        if (existing && !overwrite) {
          scaleSSkipped++;
          logs.push(`⏭️  Skipped: ${scaleName} (already exists)`);
          continue;
        }

        if (existing && overwrite) {
          // Delete existing and recreate
          await prisma.gradingSystem.delete({
            where: { id: existing.id }
          });
        }

        // Create new scale
        const newScale = await prisma.gradingSystem.create({
          data: {
            name: scaleName,
            schoolId,
            grade: grade as Grade,
            learningArea,
            type: 'SUMMATIVE',
            active: true,
            ranges: {
              create: gradingRanges.map((range) => ({
                minPercentage: range.minPercentage,
                maxPercentage: range.maxPercentage,
                minMarks: range.minMarks,
                maxMarks: range.maxMarks,
                points: range.points,
                grade: range.grade,
                label: range.label,
                color: range.color
              }))
            }
          }
        });

        scaledCreated++;
        logs.push(`✅ Created: ${scaleName}`);
      }
    }

    const message = `Successfully created ${scaledCreated} grading scales for the school`;
    logs.unshift(`\n${'='.repeat(70)}`);
    logs.unshift(`📊 GRADING SCALES BULK CREATION\n`);
    logs.push(`\n${'='.repeat(70)}`);
    logs.push(`✅ Total Created: ${scaledCreated}`);
    logs.push(`⏭️  Total Skipped: ${scaleSSkipped}`);

    console.log(logs.join('\n'));

    res.json({
      success: true,
      message,
      data: {
        created: scaledCreated,
        skipped: scaleSSkipped,
        logs
      }
    });

  } catch (error: any) {
    console.error('Error bulk creating grading scales:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create grading scales',
      error: error.message
    });
  }
};

/**
 * Bulk Create Summative Tests for entire school
 * POST /api/assessments/setup/create-tests
 * Creates tests for all grades and learning areas where scales exist
 */
export const bulkCreateSummativeTests = async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId;
    const createdBy = req.user?.userId;

    if (!schoolId || !createdBy) {
      return res.status(401).json({
        success: false,
        message: 'School ID and User ID required'
      });
    }

    const {
      term = 'TERM_1',
      academicYear = new Date().getFullYear(),
      testType = 'SUMMATIVE',
      overwrite = false
    } = req.body;

    let testsCreated = 0;
    let testsSkipped = 0;
    const logs: string[] = [];

    // Get all grading scales for this school
    const scales = await prisma.gradingSystem.findMany({
      where: {
        schoolId,
        active: true,
        type: 'SUMMATIVE'
      }
    });

    if (scales.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No grading scales found. Please create scales first using /setup/create-scales endpoint.'
      });
    }

    // Create a test for each scale
    for (const scale of scales) {
      // Skip if grade or learning area is missing
      if (!scale.grade || !scale.learningArea) continue;
      
      const testTitle = `${scale.learningArea} Test - ${term}`;
      
      const existing = await prisma.summativeTest.findFirst({
        where: {
          schoolId,
          grade: scale.grade as Grade,
          learningArea: scale.learningArea as string,
          term: term as Term,
          academicYear: parseInt(academicYear.toString())
        }
      });

      if (existing && !overwrite) {
        testsSkipped++;
        logs.push(`⏭️  Skipped: ${testTitle} (already exists)`);
        continue;
      }

      if (existing && overwrite) {
        // Delete existing test and its results
        await prisma.summativeResult.deleteMany({
          where: { testId: existing.id }
        });
        await prisma.summativeTest.delete({
          where: { id: existing.id }
        });
      }

      // Create new test
      const newTest = await prisma.summativeTest.create({
        data: {
          title: testTitle,
          learningArea: scale.learningArea as string,
          term: term as Term,
          academicYear: parseInt(academicYear.toString()),
          grade: scale.grade as Grade,
          testDate: new Date(),
          totalMarks: 100,
          passMarks: 40,
          schoolId,
          createdBy,
          scaleId: scale.id, // AUTO-LINK THE SCALE!
          testType,
          status: 'PUBLISHED',
          published: true,
          active: true,
          description: `Summative assessment for ${scale.learningArea}`
        }
      });

      testsCreated++;
      logs.push(`✅ Created: ${testTitle} (linked to ${scale.name})`);
    }

    const message = `Successfully created ${testsCreated} summative tests for the school`;
    logs.unshift(`\n${'='.repeat(70)}`);
    logs.unshift(`🧪 SUMMATIVE TESTS BULK CREATION\n`);
    logs.push(`\n${'='.repeat(70)}`);
    logs.push(`✅ Total Created: ${testsCreated}`);
    logs.push(`⏭️  Total Skipped: ${testsSkipped}`);
    logs.push(`📊 All created tests are pre-linked to their grading scales`);

    console.log(logs.join('\n'));

    res.json({
      success: true,
      message,
      data: {
        created: testsCreated,
        skipped: testsSkipped,
        logs
      }
    });

  } catch (error: any) {
    console.error('Error bulk creating summative tests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create summative tests',
      error: error.message
    });
  }
};

/**
 * Complete School Setup - Creates BOTH scales and tests in one operation
 * POST /api/assessments/setup/complete
 * This is the recommended endpoint for initial school setup
 */
export const completeSchoolSetup = async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId;
    const createdBy = req.user?.userId;

    if (!schoolId || !createdBy) {
      return res.status(401).json({
        success: false,
        message: 'School ID and User ID required'
      });
    }

    const {
      term = 'TERM_1',
      academicYear = new Date().getFullYear(),
      overwrite = false
    } = req.body;

    console.log(`\n🚀 Starting Complete School Setup for ${schoolId}...`);
    const logs: string[] = [];
    
    // STEP 1: Create Grading Scales
    logs.push('\n' + '='.repeat(70));
    logs.push('STEP 1: Creating Grading Scales');
    logs.push('='.repeat(70));

    let scalesCreated = 0;
    const gradeRange = ['PLAYGROUP', 'PP1', 'PP2', 'GRADE_1', 'GRADE_2', 'GRADE_3', 'GRADE_4', 'GRADE_5', 'GRADE_6'] as const;
    const gradingRanges = [
      { minPercentage: 80, maxPercentage: 100, minMarks: 80, maxMarks: 100, points: 4, grade: 'A', label: 'Excellent', color: '#10b981' },
      { minPercentage: 60, maxPercentage: 79, minMarks: 60, maxMarks: 79, points: 3, grade: 'B', label: 'Good', color: '#3b82f6' },
      { minPercentage: 50, maxPercentage: 59, minMarks: 50, maxMarks: 59, points: 2, grade: 'C', label: 'Average', color: '#f59e0b' },
      { minPercentage: 40, maxPercentage: 49, minMarks: 40, maxMarks: 49, points: 1, grade: 'D', label: 'Pass', color: '#f97316' },
      { minPercentage: 0, maxPercentage: 39, minMarks: 0, maxMarks: 39, points: 0, grade: 'E', label: 'Below Average', color: '#ef4444' }
    ];

    for (const grade of gradeRange) {
      const learningAreas = LEARNING_AREAS_CONFIG[grade] || [];

      for (const learningArea of learningAreas) {
        const scaleName = `${grade} - ${learningArea}`;
        const existing = await prisma.gradingSystem.findFirst({
          where: { schoolId, name: scaleName }
        });

        if (existing && !overwrite) {
          continue;
        }

        if (existing && overwrite) {
          await prisma.gradingSystem.delete({ where: { id: existing.id } });
        }

        await prisma.gradingSystem.create({
          data: {
            name: scaleName,
            schoolId,
            grade: grade as Grade,
            learningArea,
            type: 'SUMMATIVE',
            active: true,
            ranges: {
              create: gradingRanges.map((range) => ({
                minPercentage: range.minPercentage,
                maxPercentage: range.maxPercentage,
                minMarks: range.minMarks,
                maxMarks: range.maxMarks,
                points: range.points,
                grade: range.grade,
                label: range.label,
                color: range.color
              }))
            }
          }
        });
        scalesCreated++;
        logs.push(`✅ ${scaleName}`);
      }
    }

    logs.push(`\n✅ Grading Scales Created: ${scalesCreated}`);

    // STEP 2: Create Tests
    logs.push('\n' + '='.repeat(70));
    logs.push('STEP 2: Creating Summative Tests (with linked scales)');
    logs.push('='.repeat(70));

    let testsCreated = 0;
    const scales = await prisma.gradingSystem.findMany({
      where: { schoolId, active: true, type: 'SUMMATIVE' }
    });

    for (const scale of scales) {
      if (!scale.grade || !scale.learningArea) continue; // Skip if grade or learning area is missing
      
      const testTitle = `${scale.learningArea} Test - ${term}`;
      const existing = await prisma.summativeTest.findFirst({
        where: {
          schoolId,
          grade: scale.grade as Grade,
          learningArea: scale.learningArea as string,
          term: term as Term,
          academicYear: parseInt(academicYear.toString())
        }
      });

      if (existing && !overwrite) {
        continue;
      }

      if (existing && overwrite) {
        await prisma.summativeResult.deleteMany({ where: { testId: existing.id } });
        await prisma.summativeTest.delete({ where: { id: existing.id } });
      }

      await prisma.summativeTest.create({
        data: {
          title: testTitle,
          learningArea: scale.learningArea as string,
          term: term as Term,
          academicYear: parseInt(academicYear.toString()),
          grade: scale.grade as Grade,
          testDate: new Date(),
          totalMarks: 100,
          passMarks: 40,
          schoolId,
          createdBy,
          scaleId: scale.id,
          status: 'PUBLISHED',
          published: true,
          active: true
        }
      });
      testsCreated++;
      logs.push(`✅ ${testTitle}`);
    }

    logs.push(`\n✅ Summative Tests Created: ${testsCreated}`);

    // SUMMARY
    logs.push('\n' + '='.repeat(70));
    logs.push('🎉 COMPLETE SCHOOL SETUP SUCCESSFUL');
    logs.push('='.repeat(70));
    logs.push(`✅ Grading Scales: ${scalesCreated}`);
    logs.push(`✅ Summative Tests: ${testsCreated} (all pre-linked to scales)`);
    logs.push(`✅ Teachers can now create assessments and record results`);
    logs.push(`✅ Performance descriptors will display in all reports`);
    logs.push('='.repeat(70) + '\n');

    const fullLog = logs.join('\n');
    console.log(fullLog);

    res.json({
      success: true,
      message: 'Complete school setup successful',
      data: {
        scalesCreated,
        testsCreated,
        logs
      }
    });

  } catch (error: any) {
    console.error('Error in complete school setup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete school setup',
      error: error.message
    });
  }
};

export default {
  bulkCreateGradingScales,
  bulkCreateSummativeTests,
  completeSchoolSetup
};
