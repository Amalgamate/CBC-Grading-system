/**
 * Scale Group Controller - ENHANCED VERSION
 * Handles scale group management operations
 * FIX Applied: 2026-01-29
 * - Now creates grading systems for ALL 14 learning areas
 * - Enhanced delete with dependency checking and better feedback
 * - Fixed TypeScript errors
 */

import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/permissions.middleware';

const prisma = new PrismaClient();

// All CBC Learning Areas - MUST match frontend
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

// ============================================
// SCALE GROUP CRUD
// ============================================

/**
 * Get all scale groups for a school
 * GET /api/grading/scale-groups
 */
export const getScaleGroups = async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - School ID required'
      });
    }

    const scaleGroups = await prisma.scaleGroup.findMany({
      where: {
        schoolId: schoolId, // TypeScript now knows it's not null
        archived: false
      },
      include: {
        gradingSystems: {
          where: { archived: false },
          include: {
            ranges: {
              orderBy: { minPercentage: 'desc' }
            }
          },
          orderBy: [
            { grade: 'asc' },
            { learningArea: 'asc' }
          ]
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: scaleGroups
    });

  } catch (error: any) {
    console.error('Error fetching scale groups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scale groups',
      error: error.message
    });
  }
};

/**
 * Get a single scale group by ID
 * GET /api/grading/scale-groups/:id
 */
export const getScaleGroupById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - School ID required'
      });
    }

    const scaleGroup = await prisma.scaleGroup.findFirst({
      where: {
        id,
        schoolId, // Now safe to use
        archived: false
      },
      include: {
        gradingSystems: {
          where: { archived: false },
          include: {
            ranges: {
              orderBy: { minPercentage: 'desc' }
            }
          },
          orderBy: [
            { grade: 'asc' },
            { learningArea: 'asc' }
          ]
        }
      }
    });

    if (!scaleGroup) {
      return res.status(404).json({
        success: false,
        message: 'Scale group not found'
      });
    }

    res.json({
      success: true,
      data: scaleGroup
    });

  } catch (error: any) {
    console.error('Error fetching scale group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scale group',
      error: error.message
    });
  }
};

/**
 * Create a new scale group
 * POST /api/grading/scale-groups
 */
export const createScaleGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - School ID required'
      });
    }

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Scale group name is required'
      });
    }

    // Check if name already exists
    const existing = await prisma.scaleGroup.findFirst({
      where: {
        schoolId: schoolId, // TypeScript now knows it's not null
        name,
        archived: false
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A scale group with this name already exists'
      });
    }

    const scaleGroup = await prisma.scaleGroup.create({
      data: {
        name,
        description,
        schoolId: schoolId, // TypeScript now knows it's not null
        active: true
      }
    });

    res.json({
      success: true,
      data: scaleGroup,
      message: 'Scale group created successfully'
    });

  } catch (error: any) {
    console.error('Error creating scale group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create scale group',
      error: error.message
    });
  }
};

/**
 * Update a scale group
 * PUT /api/grading/scale-groups/:id
 */
export const updateScaleGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, active, isDefault } = req.body;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - School ID required'
      });
    }

    // Verify ownership
    const existing = await prisma.scaleGroup.findFirst({
      where: { id, schoolId, archived: false } // Now safe to use
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Scale group not found'
      });
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      await prisma.scaleGroup.updateMany({
        where: {
          schoolId, // Now safe to use
          archived: false,
          id: { not: id }
        },
        data: { isDefault: false }
      });
    }

    const updated = await prisma.scaleGroup.update({
      where: { id },
      data: {
        name,
        description,
        active,
        isDefault
      }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Scale group updated successfully'
    });

  } catch (error: any) {
    console.error('Error updating scale group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update scale group',
      error: error.message
    });
  }
};

/**
 * Delete a scale group - ENHANCED VERSION
 * DELETE /api/grading/scale-groups/:id
 * Query param: ?force=true to skip dependency check
 * 
 * This now handles:
 * 1. Scale groups with multiple learning areas (new system)
 * 2. Scale groups with single learningArea: null (old system)
 * 3. Checks for dependencies (tests using these scales)
 * 4. Provides detailed feedback on what was deleted
 */
export const deleteScaleGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { force } = req.query; // Optional force parameter
    const schoolId = req.user?.schoolId;
    const userId = req.user?.userId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - School ID required'
      });
    }

    console.log(`\n🗑️  Delete request for scale group: ${id}${force === 'true' ? ' (FORCED)' : ''}`);

    // Verify ownership and get details
    const existing = await prisma.scaleGroup.findFirst({
      where: { id, schoolId, archived: false }, // Now safe to use
      include: {
        gradingSystems: {
          where: { archived: false },
          select: {
            id: true,
            name: true,
            learningArea: true,
            grade: true
          }
        }
      }
    });

    if (!existing) {
      console.log('❌ Scale group not found or already deleted');
      return res.status(404).json({
        success: false,
        message: 'Scale group not found or already deleted'
      });
    }

    console.log(`📊 Found scale group: "${existing.name}"`);
    console.log(`📝 Contains ${existing.gradingSystems.length} grading systems`);

    // Check for tests/assessments using any of these grading systems (unless force=true)
    if (force !== 'true') {
      const systemIds = existing.gradingSystems.map((gs: any) => gs.id);

      if (systemIds.length > 0) {
        const testsUsingScales = await prisma.summativeTest.findMany({
          where: {
            scaleId: { in: systemIds },
            archived: false
          },
          select: {
            id: true,
            title: true,
            scaleId: true
          },
          take: 10 // Limit to first 10 for display
        });

        if (testsUsingScales.length > 0) {
          console.log(`⚠️  Warning: ${testsUsingScales.length} tests are using these scales`);
          console.log('Tests:', testsUsingScales.map((t: any) => t.title).join(', '));

          return res.status(409).json({
            success: false,
            message: `Cannot delete scale group "${existing.name}". ${testsUsingScales.length} test(s) are currently using these grading scales.`,
            details: {
              testsCount: testsUsingScales.length,
              testNames: testsUsingScales.map((t: any) => t.title),
              scaleGroupName: existing.name,
              systemsAffected: existing.gradingSystems.length,
              suggestion: 'Please delete or reassign the tests first, or add ?force=true to the URL to force deletion (tests will keep their scales but they will be marked as archived)'
            }
          });
        }
      }
    } else {
      console.log('⚠️  Force mode enabled - skipping dependency check');
    }

    // Perform the deletion in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const systemIds = existing.gradingSystems.map((gs: any) => gs.id);
      let rangesCount = 0;

      // 1. Archive all grading ranges for these systems
      if (systemIds.length > 0) {
        const rangesResult = await tx.gradingRange.updateMany({
          where: {
            systemId: { in: systemIds }
          },
          data: {
            archived: true,
            archivedAt: new Date(),
            archivedBy: userId
          }
        });
        rangesCount = rangesResult.count;
        console.log(`✅ Archived ${rangesCount} grading ranges`);
      }

      // 2. Archive all grading systems in this group
      const systemsResult = await tx.gradingSystem.updateMany({
        where: {
          scaleGroupId: id,
          archived: false
        },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: userId
        }
      });
      console.log(`✅ Archived ${systemsResult.count} grading systems`);

      // 3. Archive the scale group itself
      await tx.scaleGroup.update({
        where: { id },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: userId
        }
      });
      console.log(`✅ Archived scale group: "${existing.name}"`);

      return {
        scaleGroupName: existing.name,
        systemsDeleted: systemsResult.count,
        rangesDeleted: rangesCount,
        learningAreas: existing.gradingSystems.map((gs: any) => gs.learningArea || 'All Subjects')
      };
    });

    console.log(`\n🎉 Deletion completed successfully!`);
    console.log(`Summary: ${result.systemsDeleted} systems, ${result.rangesDeleted} ranges archived\n`);

    res.json({
      success: true,
      message: `Scale group "${result.scaleGroupName}" deleted successfully`,
      details: {
        scaleGroupName: result.scaleGroupName,
        gradingSystemsDeleted: result.systemsDeleted,
        gradingRangesDeleted: result.rangesDeleted,
        learningAreasAffected: result.learningAreas.length,
        learningAreas: result.learningAreas
      }
    });

  } catch (error: any) {
    console.error('❌ Error deleting scale group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete scale group',
      error: error.message
    });
  }
};

// ============================================
// SCALE GROUP OPERATIONS
// ============================================

/**
 * Generate grading systems for all grades AND all learning areas in a scale group
 * POST /api/grading/scale-groups/:id/generate-grades
 * 
 * FIXED: Now creates 14 grading systems (one per learning area) instead of just 1
 */
export const generateGradesForScaleGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { grades, ranges } = req.body;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // Verify scale group ownership
    const scaleGroup = await prisma.scaleGroup.findFirst({
      where: { id, schoolId: schoolId, archived: false } // TypeScript now knows it's not null
    });

    if (!scaleGroup) {
      return res.status(404).json({
        success: false,
        message: 'Scale group not found'
      });
    }

    if (!grades || !Array.isArray(grades) || grades.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Grades array is required'
      });
    }

    if (!ranges || !Array.isArray(ranges) || ranges.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Ranges array is required'
      });
    }

    // FIX: Optimized Bulk Creation logic
    // 1. Identify existing systems to avoid duplicates
    const existingSystems = await prisma.gradingSystem.findMany({
      where: {
        scaleGroupId: id,
        grade: { in: grades },
        schoolId: schoolId,
        archived: false
      },
      select: {
        grade: true,
        learningArea: true
      }
    });

    const existingSet = new Set(existingSystems.map(s => `${s.grade}|${s.learningArea}`));
    const systemsToCreate: any[] = [];

    // 2. Prepare systems for bulk creation
    for (const grade of grades) {
      for (const learningArea of LEARNING_AREAS) {
        if (!existingSet.has(`${grade}|${learningArea}`)) {
          systemsToCreate.push({
            name: `${grade.replace('_', ' ')} - ${learningArea}`,
            type: 'SUMMATIVE',
            scaleGroupId: id,
            grade,
            learningArea,
            schoolId: schoolId,
            active: true
          });
        } else {
          console.log(`⏭️  Skipping ${grade} - ${learningArea} (already exists)`);
        }
      }
    }

    if (systemsToCreate.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'All grading systems already exist. No new systems created.'
      });
    }

    // 3. Execute Bulk Creation Transaction
    const createdCount = await prisma.$transaction(async (tx) => {
      // A. Bulk Create Systems
      const createSystemsResult = await tx.gradingSystem.createMany({
        data: systemsToCreate
      });

      // B. Fetch the newly created systems (or all systems in scope needed for ranges)
      // We look for systems in this group/grades that don't have ranges yet?
      // Or simply all systems we just "intended" to create.
      // Since createMany doesn't return IDs, we fetch all relevant ones and check if they need ranges.
      const systemsNeedingRanges = await tx.gradingSystem.findMany({
        where: {
          scaleGroupId: id,
          grade: { in: grades },
          schoolId: schoolId,
          archived: false,
          ranges: {
            none: {} // Only find those with NO ranges
          }
        },
        select: { id: true }
      });

      if (systemsNeedingRanges.length === 0) return createSystemsResult.count;

      // C. Prepare Ranges for Bulk Creation
      const rangesToCreate: any[] = [];
      const templateRanges = ranges.map((r: any) => ({
        label: r.label || r.rating,
        minPercentage: parseFloat(r.minPercentage || r.mark || 0),
        maxPercentage: parseFloat(r.maxPercentage || 100),
        points: parseInt(r.points || r.score || 0),
        description: r.description || r.desc || '',
        rubricRating: r.rubricRating || r.rating || null
      }));

      for (const system of systemsNeedingRanges) {
        for (const template of templateRanges) {
          rangesToCreate.push({
            ...template,
            systemId: system.id
          });
        }
      }

      // D. Bulk Create Ranges
      if (rangesToCreate.length > 0) {
        await tx.gradingRange.createMany({
          data: rangesToCreate
        });
      }

      return createSystemsResult.count;
    });

    console.log(`\n🎉 Successfully created ${createdCount} grading systems via bulk op!`);

    res.json({
      success: true,
      message: `Successfully created ${createdCount} grading systems (${LEARNING_AREAS.length} learning areas × ${grades.length} grade(s))`
    });

  } catch (error: any) {
    console.error('Error generating grades for scale group:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate grading systems',
      error: error.message
    });
  }
};

/**
 * Get grading system for a test based on scale group and grade
 * GET /api/grading/scale-groups/:id/for-test?grade=GRADE_1&learningArea=Mathematics
 */
export const getScaleForTest = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { grade, learningArea } = req.query;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!grade) {
      return res.status(400).json({
        success: false,
        message: 'Grade parameter is required'
      });
    }

    // Try to find a scale specific to the learning area
    let scale = await prisma.gradingSystem.findFirst({
      where: {
        scaleGroupId: id,
        grade: grade as any,
        learningArea: learningArea as string,
        schoolId: schoolId, // TypeScript now knows it's not null
        active: true,
        archived: false
      },
      include: {
        ranges: {
          orderBy: { minPercentage: 'desc' }
        }
      }
    });

    // If not found, look for a grade-wide scale (learningArea = null) - backwards compatibility
    if (!scale) {
      scale = await prisma.gradingSystem.findFirst({
        where: {
          scaleGroupId: id,
          grade: grade as any,
          learningArea: null,
          schoolId: schoolId, // TypeScript now knows it's not null
          active: true,
          archived: false
        },
        include: {
          ranges: {
            orderBy: { minPercentage: 'desc' }
          }
        }
      });
    }

    if (!scale) {
      return res.status(404).json({
        success: false,
        message: `No grading scale found for ${grade}${learningArea ? ` - ${learningArea}` : ''} in this scale group`
      });
    }

    res.json({
      success: true,
      data: scale
    });

  } catch (error: any) {
    console.error('Error fetching scale for test:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch grading scale',
      error: error.message
    });
  }
};
