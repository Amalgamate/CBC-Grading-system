import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { gradingService } from '../services/grading.service';

const prisma = new PrismaClient();

export const gradingController = {
  // Get grading systems for a school
  getGradingSystems: async (req: Request, res: Response) => {
    try {
      const { schoolId } = req.params;
      
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
        where: { schoolId },
        include: { ranges: { orderBy: { minPercentage: 'desc' } } }
      });
      
      res.json(systems);
    } catch (error) {
      console.error('Error fetching grading systems:', error);
      res.status(500).json({ error: 'Failed to fetch grading systems', message: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  // Create grading system
  createGradingSystem: async (req: Request, res: Response) => {
    try {
      const { schoolId, name, type, ranges } = req.body;
      
      const system = await prisma.gradingSystem.create({
        data: {
          schoolId,
          name,
          type,
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
      res.status(500).json({ error: 'Failed to create grading system' });
    }
  },

  // Update grading system
  updateGradingSystem: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, active, isDefault, type, ranges } = req.body;

      // If setting as default, unset others of same type/school
      if (isDefault) {
        const current = await prisma.gradingSystem.findUnique({ where: { id } });
        if (current) {
          await prisma.gradingSystem.updateMany({
            where: { 
              schoolId: current.schoolId, 
              type: current.type,
              id: { not: id }
            },
            data: { isDefault: false }
          });
        }
      }

      // If ranges are provided, we need to handle them transactionally
      if (ranges) {
        // Use transaction to ensure consistency
        const system = await prisma.$transaction(async (tx) => {
          // Update system details
          const updatedSystem = await tx.gradingSystem.update({
            where: { id },
            data: { 
              name, 
              active, 
              isDefault,
              type // Allow updating type (e.g. for metadata)
            }
          });

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

          return tx.gradingSystem.findUnique({
            where: { id },
            include: { ranges: { orderBy: { minPercentage: 'desc' } } }
          });
        });

        res.json(system);
      } else {
        // Simple update without ranges
        const system = await prisma.gradingSystem.update({
          where: { id },
          data: { name, active, isDefault, type },
          include: { ranges: { orderBy: { minPercentage: 'desc' } } }
        });
        res.json(system);
      }
    } catch (error) {
      console.error('Error updating grading system:', error);
      res.status(500).json({ error: 'Failed to update grading system' });
    }
  },

  // Delete grading system
  deleteGradingSystem: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.gradingSystem.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting grading system:', error);
      res.status(500).json({ error: 'Failed to delete grading system' });
    }
  },

  // Update grading range
  updateGradingRange: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { minPercentage, maxPercentage, label, points, color, description } = req.body;

      const range = await prisma.gradingRange.update({
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

      res.json(range);
    } catch (error) {
      console.error('Error updating grading range:', error);
      res.status(500).json({ error: 'Failed to update grading range' });
    }
  },
  
  // Create grading range
  createGradingRange: async (req: Request, res: Response) => {
     try {
       const { systemId, minPercentage, maxPercentage, label, points, color, description, summativeGrade, rubricRating } = req.body;
       
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
       res.status(500).json({ error: 'Failed to create grading range' });
     }
  },

  // Delete grading range
  deleteGradingRange: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await prisma.gradingRange.delete({ where: { id } });
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting grading range:', error);
      res.status(500).json({ error: 'Failed to delete grading range' });
    }
  }
};
