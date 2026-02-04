import { Request, Response } from 'express';
import prisma from '../config/database';
import { generateAccessToken } from '../utils/jwt.util';
import { provisionNewSchool } from '../services/school-provisioning.service';
import { deleteSchoolSafely, restoreSchool, getDeletedSchools } from '../services/school-deletion.service';
import { encrypt } from '../utils/encryption.util';

export class AdminController {
  async listSchools(_req: Request, res: Response) {
    try {
      const schools = await prisma.school.findMany({
        include: {
          branches: { select: { id: true, name: true, code: true, active: true } },
          _count: { select: { learners: true, branches: true } },
          subscriptions: {
            where: { status: 'ACTIVE' },
            take: 1,
            orderBy: { expiresAt: 'desc' },
            include: { plan: true }
          },
        },
        orderBy: { name: 'asc' },
      });
      res.json({ success: true, data: schools, count: schools.length });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to list schools' });
    }
  }

  async listPlans(_req: Request, res: Response) {
    try {
      const plans = await prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { maxBranches: 'asc' },
      });
      res.json({ success: true, data: plans });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to list plans' });
    }
  }

  async reactivateSchool(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: { active: true },
      });
      res.json({ success: true, data: updated });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'School not found' });
      }
      res.status(500).json({ success: false, error: 'Failed to reactivate school' });
    }
  }

  async approvePayment(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const { planId, durationDays = 365 } = req.body;
      if (!planId) {
        return res.status(400).json({ success: false, error: 'planId is required' });
      }
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
      if (!plan || !plan.isActive) {
        return res.status(400).json({ success: false, error: 'Invalid or inactive plan' });
      }
      const now = new Date();
      const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);
      const sub = await prisma.schoolSubscription.create({
        data: {
          schoolId,
          planId,
          startedAt: now,
          expiresAt: expires,
          status: 'ACTIVE',
        },
      });
      const updated = await prisma.school.update({
        where: { id: schoolId },
        data: { active: true, status: 'ACTIVE' as any, trialStart: null },
      });

      res.json({ success: true, data: { subscription: sub, school: updated } });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return res.status(404).json({ success: false, error: 'School not found' });
      }
      res.status(500).json({ success: false, error: 'Failed to approve payment' });
    }
  }

  async trialMetrics(_req: Request, res: Response) {
    try {
      const [active, inactive] = await Promise.all([
        prisma.school.count({ where: { active: true } }),
        prisma.school.count({ where: { active: false } }),
      ]);

      res.json({
        success: true,
        data: {
          trial: 0,
          active,
          inactive,
          conversionRate: active + inactive > 0 ? active / (active + 0) : 0,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: 'Failed to fetch trial metrics' });
    }
  }

  async getSchoolModules(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const sub = await prisma.schoolSubscription.findFirst({
        where: { schoolId, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
        include: { plan: true },
      });
      const defaultModules = {
        ASSESSMENT: true,
        LEARNERS: true,
        TUTORS: false,
        PARENTS: false,
        ATTENDANCE: true,
        FEES: true,
        REPORTS: true,
        SECURITY: false,
        LIBRARY: false,
        TRANSPORT: false,
        HEALTH: false,
        SETTINGS: true,
      };
      const modules =
        (sub && (sub.plan.modules as any)) && typeof sub.plan.modules === 'object'
          ? sub.plan.modules
          : defaultModules;
      res.json({ success: true, data: modules });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch modules' });
    }
  }

  async setSchoolModule(req: Request, res: Response) {
    try {
      const { schoolId, moduleKey } = req.params;
      const { active } = req.body;
      const sub = await prisma.schoolSubscription.findFirst({
        where: { schoolId, status: 'ACTIVE' },
        orderBy: { startedAt: 'desc' },
      });
      if (!sub) {
        return res.status(404).json({ success: false, error: 'Active subscription not found' });
      }
      const plan = await prisma.subscriptionPlan.findUnique({ where: { id: sub.planId } });
      if (!plan) {
        return res.status(404).json({ success: false, error: 'Plan not found' });
      }
      const current = (plan.modules as any) || {};
      const updatedModules = { ...current, [moduleKey]: Boolean(active) };
      const updated = await prisma.subscriptionPlan.update({
        where: { id: plan.id },
        data: { modules: updatedModules },
      });
      res.json({ success: true, data: updated.modules });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to update module' });
    }
  }

  async switchSchool(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      if (!user || user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ success: false, error: 'Only SUPER_ADMIN can switch schools' });
      }
      const { schoolId } = req.params as any;
      const school = await prisma.school.findUnique({ where: { id: schoolId } });
      if (!school) {
        return res.status(404).json({ success: false, error: 'School not found' });
      }
      // Issue a new access token bound to the selected schoolId
      const newToken = generateAccessToken({
        id: user.userId || user.id,
        email: user.email,
        role: 'SUPER_ADMIN' as any,
        schoolId: schoolId,
        branchId: null,
      });
      return res.json({ success: true, token: newToken, data: { school: { id: school.id, name: school.name } } });
    } catch (error) {
      return res.status(500).json({ success: false, error: 'Failed to switch school' });
    }
  }

  /**
   * Provision a new school with complete setup
   * POST /api/admin/schools/provision
   */
  async provisionSchool(req: Request, res: Response) {
    try {
      const {
        schoolName,
        admissionFormatType,
        branchSeparator,
        adminEmail,
        adminFirstName,
        adminLastName,
        adminPhone,
        planId,
        trialDays,
        registrationNo,
        address,
        county,
        subCounty,
        ward,
        phone,
        email,
        website,
        principalName,
        principalPhone,
        motto,
        vision,
        mission
      } = req.body;

      // Validation
      if (!schoolName || !adminEmail || !adminFirstName || !adminLastName) {
        return res.status(400).json({
          success: false,
          error: 'Required fields: schoolName, adminEmail, adminFirstName, adminLastName'
        });
      }

      // Check if school name already exists
      const existingSchool = await prisma.school.findFirst({
        where: { name: schoolName }
      });

      if (existingSchool) {
        return res.status(400).json({
          success: false,
          error: 'A school with this name already exists'
        });
      }

      // Check if admin email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'A user with this email already exists'
        });
      }

      // Provision the school
      const result = await provisionNewSchool({
        schoolName,
        admissionFormatType: admissionFormatType || 'BRANCH_PREFIX_START',
        branchSeparator,
        adminEmail,
        adminFirstName,
        adminLastName,
        adminPhone,
        planId,
        trialDays,
        registrationNo,
        address,
        county,
        subCounty,
        ward,
        phone,
        email,
        website,
        principalName,
        principalPhone,
        motto,
        vision,
        mission
      });

      // Don't send temp password in response for security
      // It's already been logged/emailed to the admin
      const { tempPassword, ...safeResult } = result;

      res.status(201).json({
        success: true,
        message: 'School provisioned successfully. Welcome email sent to admin.',
        data: safeResult
      });

    } catch (error: any) {
      console.error('Error provisioning school:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to provision school',
        details: error.message
      });
    }
  }

  /**
   * Delete school with options (soft/hard delete, export, notify)
   * DELETE /api/admin/schools/:schoolId
   */
  async deleteSchoolWithOptions(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const {
        hardDelete = false,
        exportData = true,
        notifyUsers = true,
        reason
      } = req.body;

      // Validate school exists
      const school = await prisma.school.findUnique({
        where: { id: schoolId }
      });

      if (!school) {
        return res.status(404).json({
          success: false,
          error: 'School not found'
        });
      }

      // Perform safe deletion
      const user = (req as any).user;
      const result = await deleteSchoolSafely(schoolId, {
        hardDelete,
        exportData,
        notifyUsers,
        reason,
        deletedBy: user?.userId || user?.id || 'admin'
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('Error deleting school:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete school',
        details: error.message
      });
    }
  }

  /**
   * Restore a soft-deleted school
   * POST /api/admin/schools/:schoolId/restore
   */
  async restoreSchool(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;

      const restored = await restoreSchool(schoolId);

      res.json({
        success: true,
        message: 'School restored successfully',
        data: restored
      });

    } catch (error: any) {
      console.error('Error restoring school:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to restore school',
        details: error.message
      });
    }
  }

  /**
   * Get list of deleted schools
   * GET /api/admin/schools/deleted
   */
  async listDeletedSchools(_req: Request, res: Response) {
    try {
      const deletedSchools = await getDeletedSchools();

      res.json({
        success: true,
        data: deletedSchools,
        count: deletedSchools.length
      });

    } catch (error: any) {
      console.error('Error listing deleted schools:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list deleted schools',
        details: error.message
      });
    }
  }

  /**
   * Get detailed school statistics
   * GET /api/admin/schools/:schoolId/statistics
   */
  async getSchoolStatistics(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;

      const stats = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
          _count: {
            select: {
              learners: true,
              users: true,
              branches: true,
              formativeAssessments: true,
              summativeTests: true,
              feeStructures: true
            }
          },
          subscriptions: {
            where: { status: 'ACTIVE' },
            include: { plan: true },
            orderBy: { startedAt: 'desc' },
            take: 1
          },
          branches: {
            select: {
              id: true,
              name: true,
              code: true,
              active: true,
              _count: {
                select: {
                  learners: true,
                  classes: true
                }
              }
            }
          }
        }
      });

      if (!stats) {
        return res.status(404).json({
          success: false,
          error: 'School not found'
        });
      }

      // Calculate additional statistics
      const activeSubscription = stats.subscriptions[0];
      const daysRemaining = activeSubscription
        ? Math.ceil((new Date(activeSubscription.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0;

      res.json({
        success: true,
        data: {
          school: {
            id: stats.id,
            name: stats.name,
            status: stats.status,
            active: stats.active,
            trialDays: stats.trialDays,
            createdAt: stats.createdAt
          },
          counts: stats._count,
          subscription: activeSubscription ? {
            plan: activeSubscription.plan.name,
            status: activeSubscription.status,
            expiresAt: activeSubscription.expiresAt,
            daysRemaining
          } : null,
          branches: stats.branches
        }
      });

    } catch (error: any) {
      console.error('Error fetching school statistics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch school statistics',
        details: error.message
      });
    }
  }

  /**
   * Get school communication configuration
   * GET /api/admin/schools/:schoolId/communication
   */
  async getSchoolCommunication(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const config = await prisma.communicationConfig.findUnique({
        where: { schoolId }
      });

      if (!config) {
        return res.json({
          success: true,
          data: {
            smsEnabled: true, // Default to true as per request
            smsProvider: 'mobilesasa',
            emailProvider: 'resend',
            mpesaProvider: 'intasend'
          }
        });
      }

      res.json({ success: true, data: config });
    } catch (error: any) {
      res.status(500).json({ success: false, error: 'Failed to fetch communication config' });
    }
  }

  /**
   * Update school communication configuration
   * PUT /api/admin/schools/:schoolId/communication
   */
  async updateSchoolCommunication(req: Request, res: Response) {
    try {
      const { schoolId } = req.params;
      const updateData = { ...req.body };

      // Encrypt sensitive keys if provided
      if (updateData.smsApiKey) updateData.smsApiKey = encrypt(updateData.smsApiKey);
      if (updateData.emailApiKey) updateData.emailApiKey = encrypt(updateData.emailApiKey);
      if (updateData.mpesaSecretKey) updateData.mpesaSecretKey = encrypt(updateData.mpesaSecretKey);
      if (updateData.mpesaPublicKey) updateData.mpesaPublicKey = encrypt(updateData.mpesaPublicKey);
      if (updateData.smsCustomToken) updateData.smsCustomToken = encrypt(updateData.smsCustomToken);

      const config = await prisma.communicationConfig.upsert({
        where: { schoolId },
        create: {
          ...updateData,
          schoolId
        },
        update: updateData
      });

      res.json({ success: true, data: config });
    } catch (error: any) {
      console.error('Update communication error:', error);
      res.status(500).json({ success: false, error: 'Failed to update communication config' });
    }
  }
}
