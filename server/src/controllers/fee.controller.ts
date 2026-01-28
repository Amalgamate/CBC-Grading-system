/**
 * Fee Management Controller
 * Handles fee structures, invoices, and payments
 */

import { Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';
import { AuthRequest } from '../middleware/permissions.middleware';

export class FeeController {
  /**
   * Get all fee structures
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async getAllFeeStructures(req: AuthRequest, res: Response) {
    const { academicYear, term, grade, active } = req.query;

    const where: any = {};

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      where.schoolId = req.user.schoolId;
    }

    if (academicYear) where.academicYear = parseInt(academicYear as string);
    if (term) where.term = term;
    if (grade) where.grade = grade;
    if (active !== undefined) where.active = active === 'true';

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      orderBy: [
        { academicYear: 'desc' },
        { term: 'asc' },
        { grade: 'asc' }
      ]
    });

    res.json({
      success: true,
      data: feeStructures,
      count: feeStructures.length
    });
  }

  /**
   * Create fee structure
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async createFeeStructure(req: AuthRequest, res: Response) {
    const { name, description, feeType, amount, grade, term, academicYear, mandatory, active } = req.body;
    const userId = req.user!.userId;

    // Phase 5: Tenant Scoping
    const schoolId = req.user?.schoolId;
    // Allow SUPER_ADMIN to potentially set schoolId if needed, or enforce context
    if (!schoolId && req.user?.role !== 'SUPER_ADMIN') {
      throw new ApiError(400, 'School context required');
    }
    const targetSchoolId = schoolId || req.body.schoolId;
    if (!targetSchoolId) {
      throw new ApiError(400, 'School ID is required');
    }

    // Validate required fields
    if (!name || !feeType || !amount || !academicYear) {
      throw new ApiError(400, 'Missing required fields: name, feeType, amount, academicYear');
    }

    // Check for duplicate
    const existing = await prisma.feeStructure.findFirst({
      where: {
        name,
        academicYear,
        term: term || null,
        grade: grade || null,
        schoolId: targetSchoolId
      }
    });

    if (existing) {
      throw new ApiError(400, 'Fee structure with this name already exists for this period');
    }

    const feeStructure = await prisma.feeStructure.create({
      data: {
        name,
        description,
        feeType,
        amount,
        grade: grade || null,
        term: term || null,
        academicYear,
        mandatory: mandatory !== undefined ? mandatory : true,
        active: active !== undefined ? active : true,
        createdBy: userId,
        schoolId: targetSchoolId,
        branchId: req.user?.branchId || req.body.branchId
      }
    });

    res.status(201).json({
      success: true,
      data: feeStructure,
      message: 'Fee structure created successfully'
    });
  }

  /**
   * Update fee structure
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async updateFeeStructure(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { name, description, feeType, amount, grade, term, mandatory, active } = req.body;

    const existing = await prisma.feeStructure.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Fee structure not found');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && existing.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to fee structure');
    }

    const updated = await prisma.feeStructure.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(feeType && { feeType }),
        ...(amount && { amount }),
        ...(grade !== undefined && { grade }),
        ...(term !== undefined && { term }),
        ...(mandatory !== undefined && { mandatory }),
        ...(active !== undefined && { active })
      }
    });

    res.json({
      success: true,
      data: updated,
      message: 'Fee structure updated successfully'
    });
  }

  /**
   * Delete fee structure
   * Access: ADMIN, SUPER_ADMIN only
   */
  async deleteFeeStructure(req: AuthRequest, res: Response) {
    const { id } = req.params;

    const existing = await prisma.feeStructure.findUnique({
      where: { id },
      include: { invoices: true }
    });

    if (!existing) {
      throw new ApiError(404, 'Fee structure not found');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && existing.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to fee structure');
    }

    if (existing.invoices.length > 0) {
      throw new ApiError(400, 'Cannot delete fee structure with existing invoices. Deactivate it instead.');
    }

    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    if (isSuperAdmin) {
      await prisma.feeStructure.delete({ where: { id } });

      res.json({
        success: true,
        message: 'Fee structure permanently deleted by Super Admin'
      });
    } else {
      await prisma.feeStructure.update({
        where: { id },
        data: {
          archived: true,
          archivedAt: new Date(),
          archivedBy: req.user?.userId,
          active: false
        }
      });

      res.json({
        success: true,
        message: 'Fee structure archived successfully'
      });
    }
  }

  /**
   * Get all invoices
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async getAllInvoices(req: AuthRequest, res: Response) {
    const { status, term, academicYear, grade, learnerId } = req.query;

    const where: any = {};

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId) {
      where.learner = {
        schoolId: req.user.schoolId
      };
    }

    if (status) where.status = status;
    if (term) where.term = term;
    if (academicYear) where.academicYear = parseInt(academicYear as string);
    if (learnerId) where.learnerId = learnerId;
    if (grade) {
      where.learner = {
        ...where.learner,
        grade
      };
    }

    const invoices = await prisma.feeInvoice.findMany({
      where,
      include: {
        learner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            grade: true,
            stream: true,
            parent: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
                email: true
              }
            }
          }
        },
        feeStructure: true,
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: invoices,
      count: invoices.length
    });
  }

  /**
   * Get invoices for a specific learner
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN, PARENT (own child only)
   */
  async getLearnerInvoices(req: AuthRequest, res: Response) {
    const { learnerId } = req.params;
    const currentUserId = req.user!.userId;
    const currentUserRole = req.user!.role;

    // Check if learner exists
    const learner = await prisma.learner.findUnique({
      where: { id: learnerId },
      include: { parent: true }
    });

    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && learner.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to learner');
    }

    // If parent, check if this is their child
    if (currentUserRole === 'PARENT' && learner.parentId !== currentUserId) {
      throw new ApiError(403, 'You can only view invoices for your own children');
    }

    const invoices = await prisma.feeInvoice.findMany({
      where: { learnerId },
      include: {
        feeStructure: true,
        payments: {
          orderBy: { paymentDate: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: invoices,
      learner: {
        id: learner.id,
        name: `${learner.firstName} ${learner.lastName}`,
        admissionNumber: learner.admissionNumber,
        grade: learner.grade,
        stream: learner.stream
      }
    });
  }

  /**
   * Create invoice for a learner
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async createInvoice(req: AuthRequest, res: Response) {
    const { learnerId, feeStructureId, term, academicYear, dueDate } = req.body;
    const userId = req.user!.userId;

    if (!learnerId || !feeStructureId || !term || !academicYear || !dueDate) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Check if learner exists
    const learner = await prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }

    // Check if fee structure exists
    const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
    if (!feeStructure) {
      throw new ApiError(404, 'Fee structure not found');
    }

    // Check for duplicate invoice
    const existing = await prisma.feeInvoice.findFirst({
      where: {
        learnerId,
        feeStructureId,
        term,
        academicYear
      }
    });

    if (existing) {
      throw new ApiError(400, 'Invoice already exists for this learner, fee structure, and period');
    }

    // Generate invoice number
    const count = await prisma.feeInvoice.count();
    const invoiceNumber = `INV-${academicYear}-${String(count + 1).padStart(6, '0')}`;

    const invoice = await prisma.feeInvoice.create({
      data: {
        invoiceNumber,
        learnerId,
        feeStructureId,
        term,
        academicYear,
        dueDate: new Date(dueDate),
        totalAmount: feeStructure.amount,
        paidAmount: 0,
        balance: feeStructure.amount,
        status: 'PENDING',
        issuedBy: userId
      },
      include: {
        learner: true,
        feeStructure: true
      }
    });

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    });
  }

  /**
   * Record payment
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async recordPayment(req: AuthRequest, res: Response) {
    const { invoiceId, amount, paymentMethod, referenceNumber, notes } = req.body;
    const userId = req.user!.userId;

    if (!invoiceId || !amount || !paymentMethod) {
      throw new ApiError(400, 'Missing required fields: invoiceId, amount, paymentMethod');
    }

    // Get invoice
    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }

    // Validate amount
    if (amount <= 0) {
      throw new ApiError(400, 'Amount must be greater than zero');
    }

    // Generate receipt number
    const count = await prisma.feePayment.count();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    // Create payment
    const payment = await prisma.feePayment.create({
      data: {
        receiptNumber,
        invoiceId,
        amount,
        paymentMethod,
        referenceNumber,
        notes,
        recordedBy: userId
      }
    });

    // Update invoice
    const newPaidAmount = Number(invoice.paidAmount) + Number(amount);
    const newBalance = Number(invoice.totalAmount) - newPaidAmount;

    let newStatus = invoice.status;
    if (newBalance === 0) {
      newStatus = 'PAID';
    } else if (newBalance < 0) {
      newStatus = 'OVERPAID';
    } else if (newPaidAmount > 0) {
      newStatus = 'PARTIAL';
    }

    const updatedInvoice = await prisma.feeInvoice.update({
      where: { id: invoiceId },
      data: {
        paidAmount: newPaidAmount,
        balance: newBalance,
        status: newStatus
      },
      include: {
        learner: {
          include: {
            parent: true
          }
        },
        feeStructure: true,
        payments: true
      }
    });

    res.status(201).json({
      success: true,
      data: {
        payment,
        invoice: updatedInvoice
      },
      message: 'Payment recorded successfully'
    });
  }

  /**
   * Get payment statistics
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async getPaymentStats(req: AuthRequest, res: Response) {
    const { academicYear, term } = req.query;

    const where: any = {};
    if (academicYear) where.academicYear = parseInt(academicYear as string);
    if (term) where.term = term;

    // Total invoices
    const totalInvoices = await prisma.feeInvoice.count({ where });

    // Invoices by status
    const invoicesByStatus = await prisma.feeInvoice.groupBy({
      by: ['status'],
      where,
      _count: true,
      _sum: {
        totalAmount: true,
        paidAmount: true,
        balance: true
      }
    });

    // Recent payments
    const recentPayments = await prisma.feePayment.findMany({
      where: {
        invoice: where
      },
      include: {
        invoice: {
          include: {
            learner: {
              select: {
                firstName: true,
                lastName: true,
                admissionNumber: true
              }
            }
          }
        }
      },
      orderBy: { paymentDate: 'desc' },
      take: 10
    });

    // Payment methods breakdown
    const paymentsByMethod = await prisma.feePayment.groupBy({
      by: ['paymentMethod'],
      where: {
        invoice: where
      },
      _sum: {
        amount: true
      },
      _count: true
    });

    res.json({
      success: true,
      data: {
        totalInvoices,
        invoicesByStatus,
        recentPayments,
        paymentsByMethod,
        summary: {
          totalExpected: invoicesByStatus.reduce((sum, item) => sum + (Number(item._sum.totalAmount) || 0), 0),
          totalCollected: invoicesByStatus.reduce((sum, item) => sum + (Number(item._sum.paidAmount) || 0), 0),
          totalOutstanding: invoicesByStatus.reduce((sum, item) => sum + (Number(item._sum.balance) || 0), 0)
        }
      }
    });
  }

  /**
   * Bulk generate invoices for a class/grade
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async bulkGenerateInvoices(req: AuthRequest, res: Response) {
    const { feeStructureId, term, academicYear, dueDate, grade, stream } = req.body;
    const userId = req.user!.userId;

    if (!feeStructureId || !term || !academicYear || !dueDate || !grade) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Get fee structure
    const feeStructure = await prisma.feeStructure.findUnique({ where: { id: feeStructureId } });
    if (!feeStructure) {
      throw new ApiError(404, 'Fee structure not found');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && feeStructure.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to fee structure');
    }

    // Get learners
    const where: any = { grade, status: 'ACTIVE' };
    if (stream) where.stream = stream;
    // Phase 5: Tenant Scoping for learners
    if (req.user?.schoolId) {
      where.schoolId = req.user.schoolId;
    }

    const learners = await prisma.learner.findMany({ where });

    if (learners.length === 0) {
      throw new ApiError(400, 'No active learners found for the specified criteria');
    }

    // Generate invoices
    const invoices = [];
    const startCount = await prisma.feeInvoice.count();

    for (let i = 0; i < learners.length; i++) {
      const learner = learners[i];

      // Check if invoice already exists
      const existing = await prisma.feeInvoice.findFirst({
        where: {
          learnerId: learner.id,
          feeStructureId,
          term,
          academicYear
        }
      });

      if (existing) continue;

      const invoiceNumber = `INV-${academicYear}-${String(startCount + i + 1).padStart(6, '0')}`;

      const invoice = await prisma.feeInvoice.create({
        data: {
          invoiceNumber,
          learnerId: learner.id,
          feeStructureId,
          term,
          academicYear,
          dueDate: new Date(dueDate),
          totalAmount: feeStructure.amount,
          paidAmount: 0,
          balance: feeStructure.amount,
          status: 'PENDING',
          issuedBy: userId
        }
      });

      invoices.push(invoice);
    }

    res.status(201).json({
      success: true,
      data: invoices,
      count: invoices.length,
      message: `${invoices.length} invoices generated successfully`
    });
  }
}
