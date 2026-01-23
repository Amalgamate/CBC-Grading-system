/**
 * Schools Routes
 * Handles school and branch listings
 */

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

/**
 * GET /api/schools
 * List all schools with their branches
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const schools = await prisma.school.findMany({
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            code: true,
            active: true
          },
          where: {
            active: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      },
      where: {
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    res.status(500).json({ error: 'Failed to fetch schools' });
  }
});

/**
 * GET /api/schools/:id
 * Get a single school with branches
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        branches: {
          select: {
            id: true,
            name: true,
            code: true,
            address: true,
            phone: true,
            email: true,
            active: true
          },
          orderBy: {
            name: 'asc'
          }
        }
      }
    });

    if (!school) {
      return res.status(404).json({ error: 'School not found' });
    }

    res.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    res.status(500).json({ error: 'Failed to fetch school' });
  }
});

export default router;
