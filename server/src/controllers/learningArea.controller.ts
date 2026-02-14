/**
 * Learning Area Controller
 * Handles CRUD operations for learning areas
 */

import { Request, Response, Router } from 'express';
import { AuthRequest } from '../middleware/permissions.middleware';
import prisma from '../config/database';

const router = Router();

/**
 * GET /api/learning-areas
 * Get all learning areas for a school
 */
export const getLearningAreas = async (req: AuthRequest, res: Response) => {
  try {
    let schoolId = (req.query.schoolId as string) || req.user?.schoolId;

    // Phase 5: Tenant Isolation
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.schoolId) {
      schoolId = req.user.schoolId;
    }

    if (!schoolId) {
      return res.status(400).json({ error: 'School ID is required' });
    }

    const learningAreas = await prisma.learningArea.findMany({
      where: {
        OR: [
          { schoolId },
          { schoolId: null } // Include global learning areas
        ]
      },
      orderBy: [
        { gradeLevel: 'asc' },
        { name: 'asc' }
      ]
    });

    res.json(learningAreas);
  } catch (error: any) {
    console.error('Error fetching learning areas:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/learning-areas/:id
 * Get a specific learning area
 */
export const getLearningArea = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const learningArea = await prisma.learningArea.findUnique({
      where: { id }
    });

    if (!learningArea) {
      return res.status(404).json({ error: 'Learning area not found' });
    }

    // Phase 5: Tenant Check
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.schoolId && learningArea.schoolId && learningArea.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Unauthorized access to learning area' });
    }

    res.json(learningArea);
  } catch (error: any) {
    console.error('Error fetching learning area:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/learning-areas
 * Create a new learning area
 */
export const createLearningArea = async (req: AuthRequest, res: Response) => {
  try {
    const { name, shortName, gradeLevel, icon, color, description } = req.body;
    const schoolId = req.user?.schoolId;

    if (!name || !gradeLevel) {
      return res.status(400).json({ error: 'Name and grade level are required' });
    }

    // Check for duplicates
    const existing = await prisma.learningArea.findFirst({
      where: {
        name,
        schoolId
      }
    });

    if (existing) {
      return res.status(409).json({ error: 'Learning area already exists for this school' });
    }

    const learningArea = await prisma.learningArea.create({
      data: {
        name,
        shortName: shortName || name.split(' ')[0],
        gradeLevel,
        icon: icon || '📚',
        color: color || '#3b82f6',
        description,
        schoolId
      }
    });

    res.status(201).json(learningArea);
  } catch (error: any) {
    console.error('Error creating learning area:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * PUT /api/learning-areas/:id
 * Update a learning area
 */
export const updateLearningArea = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, shortName, gradeLevel, icon, color, description } = req.body;

    const learningArea = await prisma.learningArea.findUnique({
      where: { id }
    });

    if (!learningArea) {
      return res.status(404).json({ error: 'Learning area not found' });
    }

    // Phase 5: Tenant Check
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.schoolId && learningArea.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Cannot update learning areas from another school' });
    }

    // Check if name already exists for this school (excluding current record)
    if (name && name !== learningArea.name) {
      const existing = await prisma.learningArea.findFirst({
        where: {
          name,
          schoolId: learningArea.schoolId,
          NOT: { id }
        }
      });

      if (existing) {
        return res.status(409).json({ error: 'Learning area name already exists' });
      }
    }

    const updated = await prisma.learningArea.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(shortName && { shortName }),
        ...(gradeLevel && { gradeLevel }),
        ...(icon && { icon }),
        ...(color && { color }),
        ...(description !== undefined && { description })
      }
    });

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating learning area:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * DELETE /api/learning-areas/:id
 * Delete a learning area
 */
export const deleteLearningArea = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const learningArea = await prisma.learningArea.findUnique({
      where: { id }
    });

    if (!learningArea) {
      return res.status(404).json({ error: 'Learning area not found' });
    }

    // Phase 5: Tenant Check
    if (req.user?.role !== 'SUPER_ADMIN' && req.user?.schoolId && learningArea.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: 'Unauthorized: Cannot delete learning areas from another school' });
    }

    await prisma.learningArea.delete({
      where: { id }
    });

    res.json({ message: 'Learning area deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting learning area:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/learning-areas/seed
 * Seed learning areas from constants (for initial setup)
 */
export const seedLearningAreas = async (req: AuthRequest, res: Response) => {
  try {
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      return res.status(400).json({ error: 'School ID is required' });
    }

    // Grade level mappings and default areas
    const gradeLevelMappings: { [key: string]: string[] } = {
      'Early Years': [
        'Literacy Activities', 'Mathematical Activities', 'English Language Activities',
        'Environmental Activities', 'Creative Arts Activities', 'Christian Religious Education',
        'Islamic Religious Education', 'Computer Studies Activities'
      ],
      'Pre-Primary': [
        'Literacy', 'English Language Activities', 'Mathematical Activities',
        'Environmental Activities', 'Creative Activities', 'Christian Religious Education',
        'Islamic Religious Education', 'Computer Studies (Interactive)', 'Kiswahili Lugha'
      ],
      'Lower Primary': [
        'Mathematics', 'English', 'Kiswahili', 'Environmental Studies',
        'Creative Activities', 'Religious Education', 'Information Communications Technology'
      ],
      'Upper Primary': [
        'English Language', 'Kiswahili Lugha', 'Mathematics', 'Science and Technology',
        'Social Studies', 'Agriculture', 'Creative Arts', 'Christian Religious Education',
        'Islamic Religious Education', 'Computer Studies', 'Coding and Robotics', 'French'
      ],
      'Junior School': [
        'English Language', 'Kiswahili Lugha', 'Mathematics', 'Integrated Science',
        'Social Studies', 'Pre-Technical Studies', 'Agriculture', 'Creative Arts and Sports',
        'Christian Religious Education', 'Islamic Religious Education', 'Computer Studies',
        'Coding and Robotics', 'French'
      ],
      'Senior School': [
        'Community Service Learning', 'Physical Education and Sports', 'ICT / Digital Literacy',
        'Life Skills Education', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography',
        'Literature in English'
      ]
    };

    const colors: { [key: string]: string } = {
      'Early Years': '#ec4899',
      'Pre-Primary': '#8b5cf6',
      'Lower Primary': '#3b82f6',
      'Upper Primary': '#10b981',
      'Junior School': '#f59e0b',
      'Senior School': '#f43f5e'
    };

    const icons: { [key: string]: string } = {
      'Early Years': '🧸',
      'Pre-Primary': '🎨',
      'Lower Primary': '📚',
      'Upper Primary': '🧪',
      'Junior School': '🧬',
      'Senior School': '🎓'
    };

    let created = 0;
    let skipped = 0;

    for (const [gradeLevel, areas] of Object.entries(gradeLevelMappings)) {
      for (const area of areas) {
        const existing = await prisma.learningArea.findFirst({
          where: {
            name: area,
            schoolId
          }
        });

        if (existing) {
          skipped++;
          continue;
        }

        // Specific short names for Lower Primary
        let shortName = area.split(' ')[0];
        if (gradeLevel === 'Lower Primary') {
          const mapping: { [key: string]: string } = {
            'Mathematics': 'Maths',
            'English': 'ENG',
            'Kiswahili': 'Kiswa',
            'Environmental Studies': 'ENV',
            'Creative Activities': 'CA',
            'Religious Education': 'RE',
            'Information Communications Technology': 'ICT'
          };
          shortName = mapping[area] || shortName;
        }

        await prisma.learningArea.create({
          data: {
            name: area,
            shortName,
            gradeLevel,
            icon: icons[gradeLevel] || '📚',
            color: colors[gradeLevel] || '#3b82f6',
            schoolId
          }
        });

        created++;
      }
    }

    res.json({
      message: 'Learning areas seeded successfully',
      created,
      skipped
    });
  } catch (error: any) {
    console.error('Error seeding learning areas:', error);
    res.status(500).json({ error: error.message });
  }
};

export default router;
