import { Request, Response } from 'express';
import prisma from '../config/database';
import { gradingService } from '../services/grading.service';
import { AuthRequest } from '../middleware/permissions.middleware';
import { ApiError } from '../utils/error.util';

export const gradingController = {
  // Get grading systems for a school
  getGradingSystems: async (req: AuthRequest, res: Response) => {
    try {
      let { schoolId } = req.params;

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId) {
        // If user is tenant-scoped, force their schoolId
        if (schoolId && schoolId !== req.user.schoolId) {
          // Optional: allow if checking own school, but block other schools
          throw new ApiError(403, 'Unauthorized access to school grading systems');
        }
        schoolId = req.user.schoolId;
      }

      // Check if schoolId exists and is valid
      if (!schoolId || schoolId === 'null' || schoolId === 'undefined') {
        console.warn('Invalid schoolId:', schoolId);
        return res.json([]);
      }

      // Verify school exists before creating defaults
      const school = await prisma.school.findUnique({
        where: { id: schoolId }
      });

      if (!school) {
        console.warn('School not found:', schoolId);
        return res.json([]);
      }

      // Ensure defaults exist
      await gradingService.getGradingSystem(schoolId, 'SUMMATIVE');
      await gradingService.getGradingSystem(schoolId, 'CBC');

      const systems = await prisma.gradingSystem.findMany({
        where: { schoolId, archived: false },
        include: { ranges: { orderBy: { minPercentage: 'desc' } } }
      });

      res.json(systems);
    } catch (error) {
      console.error('Error fetching grading systems:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch grading systems', message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  },

  // Create grading system
  createGradingSystem: async (req: AuthRequest, res: Response) => {
    try {
      let { schoolId, name, type, ranges, grade, learningArea } = req.body;

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId) {
        if (schoolId && schoolId !== req.user.schoolId) {
          throw new ApiError(403, 'Cannot create grading system for another school');
        }
        schoolId = req.user.schoolId;
      }

      const system = await prisma.gradingSystem.create({
        data: {
          schoolId,
          name,
          type,
          grade,
          learningArea,
          active: true,
          ranges: {
            create: ranges.map((r: any) => ({
              minPercentage: parseFloat(r.minPercentage),
              maxPercentage: parseFloat(r.maxPercentage),
              label: r.label,
              points: r.points ? parseInt(r.points) : null,
              color: r.color,
              description: r.description,
              summativeGrade: r.summativeGrade,
              rubricRating: r.rubricRating
            }))
          }
        },
        include: { ranges: true }
      });

      res.json(system);
    } catch (error) {
      console.error('Error creating grading system:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create grading system', message: error instanceof Error ? error.message : 'Unknown error' });
      }
    }
  },

  // Update grading system
  updateGradingSystem: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { name, active, isDefault, type, ranges, grade, learningArea } = req.body;

      const current = await prisma.gradingSystem.findUnique({ where: { id } });
      if (!current) {
        throw new ApiError(404, 'Grading system not found');
      }

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId && current.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to grading system');
      }

      // If setting as default, unset others of same type/school
      if (isDefault) {
        await prisma.gradingSystem.updateMany({
          where: {
            schoolId: current.schoolId,
            type: current.type,
            id: { not: id }
          },
          data: { isDefault: false }
        });
      }

      // Use transaction to ensure consistency
      const system = await prisma.$transaction(async (tx) => {
        // Update system details
        const updatedSystem = await tx.gradingSystem.update({
          where: { id },
          data: {
            name,
            active,
            isDefault,
            type,
            grade,
            learningArea
          }
        });

        // If ranges are provided, replace them
        if (ranges) {
          // Delete existing ranges
          await tx.gradingRange.deleteMany({
            where: { systemId: id }
          });

          // Create new ranges
          if (ranges.length > 0) {
            await tx.gradingRange.createMany({
              data: ranges.map((r: any) => ({
                systemId: id,
                minPercentage: parseFloat(r.minPercentage),
                maxPercentage: parseFloat(r.maxPercentage),
                label: r.label,
                points: r.points ? parseInt(r.points) : null,
                color: r.color,
                description: r.description,
                summativeGrade: r.summativeGrade,
                rubricRating: r.rubricRating
              }))
            });
          }
        }

        return tx.gradingSystem.findUnique({
          where: { id },
          include: { ranges: { orderBy: { minPercentage: 'desc' } } }
        });
      });

      res.json(system);
    } catch (error) {
      console.error('Error updating grading system:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update grading system' });
      }
    }
  },

  // Delete grading system
  deleteGradingSystem: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const current = await prisma.gradingSystem.findUnique({ where: { id } });
      if (!current) {
        throw new ApiError(404, 'Grading system not found');
      }

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId && current.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to grading system');
      }

      const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

      if (isSuperAdmin) {
        await prisma.gradingSystem.delete({ where: { id } });
        res.json({ success: true, message: 'Grading system permanently deleted by Super Admin' });
      } else {
        await prisma.gradingSystem.update({
          where: { id },
          data: {
            archived: true,
            archivedAt: new Date(),
            archivedBy: req.user?.userId,
            active: false
          }
        });
        res.json({ success: true, message: 'Grading system archived successfully' });
      }
    } catch (error) {
      console.error('Error deleting grading system:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete grading system' });
      }
    }
  },

  // Update grading range
  updateGradingRange: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { minPercentage, maxPercentage, label, points, color, description } = req.body;

      const range = await prisma.gradingRange.findUnique({
        where: { id },
        include: { system: true }
      });
      if (!range) {
        throw new ApiError(404, 'Grading range not found');
      }

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId && range.system.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to grading range');
      }

      const updatedRange = await prisma.gradingRange.update({
        where: { id },
        data: {
          minPercentage: parseFloat(minPercentage),
          maxPercentage: parseFloat(maxPercentage),
          label,
          points: points ? parseInt(points) : null,
          color,
          description
        }
      });

      res.json(updatedRange);
    } catch (error) {
      console.error('Error updating grading range:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to update grading range' });
      }
    }
  },

  // Create grading range
  createGradingRange: async (req: AuthRequest, res: Response) => {
    try {
      const { systemId, minPercentage, maxPercentage, label, points, color, description, summativeGrade, rubricRating } = req.body;

      const system = await prisma.gradingSystem.findUnique({ where: { id: systemId } });
      if (!system) {
        throw new ApiError(404, 'Grading system not found');
      }

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId && system.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to grading system');
      }

      const range = await prisma.gradingRange.create({
        data: {
          systemId,
          minPercentage: parseFloat(minPercentage),
          maxPercentage: parseFloat(maxPercentage),
          label,
          points: points ? parseInt(points) : null,
          color,
          description,
          summativeGrade,
          rubricRating
        }
      });

      res.json(range);
    } catch (error) {
      console.error('Error creating grading range:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to create grading range' });
      }
    }
  },

  // Delete grading range
  deleteGradingRange: async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const range = await prisma.gradingRange.findUnique({
        where: { id },
        include: { system: true }
      });
      if (!range) {
        throw new ApiError(404, 'Grading range not found');
      }

      // Phase 5: Tenant Scoping
      if (req.user?.schoolId && range.system.schoolId !== req.user.schoolId) {
        throw new ApiError(403, 'Unauthorized access to grading range');
      }

      await prisma.gradingRange.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting grading range:', error);
      if (error instanceof ApiError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Failed to delete grading range' });
      }
    }
  }
};
