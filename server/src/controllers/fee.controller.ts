/**
 * Fee Management Controller
 * Handles fee structures, invoices, and payments
 */

import { Response } from 'express';
import { PaymentStatus } from '@prisma/client';
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
      include: {
        feeItems: {
          include: {
            feeType: true
          }
        }
      } as any, // Cast to any to bypass type error
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
    const { name, description, feeItems, grade, term, academicYear, mandatory, active } = req.body;
    const userId = req.user!.userId;

    // Phase 5: Tenant Scoping
    const schoolId = req.user?.schoolId;
    if (!schoolId && req.user?.role !== 'SUPER_ADMIN') {
      throw new ApiError(400, 'School context required');
    }
    const targetSchoolId = schoolId || req.body.schoolId;
    if (!targetSchoolId) {
      throw new ApiError(400, 'School ID is required');
    }

    // Validate required fields
    if (!name || !feeItems || !Array.isArray(feeItems) || feeItems.length === 0 || !academicYear) {
      throw new ApiError(400, 'Missing required fields: name, feeItems (array), academicYear');
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

    // Create structure with items
    const feeStructure = await prisma.feeStructure.create({
      data: {
        name,
        description,
        grade: grade || null,
        term: term || null,
        academicYear,
        mandatory: mandatory !== undefined ? mandatory : true,
        active: active !== undefined ? active : true,
        createdBy: userId,
        schoolId: targetSchoolId,
        branchId: req.user?.branchId || req.body.branchId,
        feeItems: {
          create: feeItems.map((item: any) => ({
            feeTypeId: item.feeTypeId,
            amount: item.amount,
            mandatory: item.mandatory !== undefined ? item.mandatory : true
          }))
        } as any // Cast to any
      },
      include: {
        feeItems: {
          include: { feeType: true }
        }
      } as any // Cast to any
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
    const { name, description, feeItems, grade, term, mandatory, active } = req.body;

    const existing = await prisma.feeStructure.findUnique({ where: { id } });
    if (!existing) {
      throw new ApiError(404, 'Fee structure not found');
    }

    // Phase 5: Tenant Scoping
    if (req.user?.schoolId && existing.schoolId !== req.user.schoolId) {
      throw new ApiError(403, 'Unauthorized access to fee structure');
    }

    // Use transaction to update structure and replace items if provided
    const updated = await prisma.$transaction(async (tx: any) => {
      // 1. Update basic fields
      const structure = await tx.feeStructure.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description !== undefined && { description }),
          ...(grade !== undefined && { grade }),
          ...(term !== undefined && { term }),
          ...(mandatory !== undefined && { mandatory }),
          ...(active !== undefined && { active })
        }
      });

      // 2. If feeItems provided, replace existing items
      if (feeItems && Array.isArray(feeItems)) {
        // Delete existing items
        await tx.feeStructureItem.deleteMany({
          where: { feeStructureId: id }
        });

        // Create new items
        if (feeItems.length > 0) {
          await tx.feeStructureItem.createMany({
            data: feeItems.map((item: any) => ({
              feeStructureId: id,
              feeTypeId: item.feeTypeId,
              amount: item.amount,
              mandatory: item.mandatory !== undefined ? item.mandatory : true
            }))
          });
        }
      }

      return await tx.feeStructure.findUnique({
        where: { id },
        include: {
          feeItems: {
            include: { feeType: true }
          }
        } as any
      });
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
    const schoolId = req.user?.schoolId;

    if (!learnerId || !feeStructureId || !term || !academicYear || !dueDate) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Get learner
    const learner = await prisma.learner.findUnique({ where: { id: learnerId } });
    if (!learner) {
      throw new ApiError(404, 'Learner not found');
    }
    if (schoolId && learner.schoolId !== schoolId) {
      throw new ApiError(403, 'Unauthorized access to learner');
    }

    // Get fee structure with items
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      include: { feeItems: true }
    });

    if (!feeStructure) {
      throw new ApiError(404, 'Fee structure not found');
    }
    if (schoolId && feeStructure.schoolId !== schoolId) {
      throw new ApiError(403, 'Unauthorized access to fee structure');
    }

    // Calculate total amount
    const totalAmount = (feeStructure as any).feeItems?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0;

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
        totalAmount,
        paidAmount: 0,
        balance: totalAmount,
        status: 'PENDING',
        issuedBy: userId
      },
      include: {
        learner: true,
        feeStructure: {
          include: { feeItems: { include: { feeType: true } } }
        } as any
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
    const { invoiceId, amount: rawAmount, paymentMethod, referenceNumber, notes } = req.body;
    const userId = req.user!.userId;
    const schoolId = req.user?.schoolId;

    if (!invoiceId || !rawAmount || !paymentMethod) {
      throw new ApiError(400, 'Missing required fields: invoiceId, amount, paymentMethod');
    }

    const amount = Number(rawAmount);

    // Get invoice with tenant check
    const invoice = await prisma.feeInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        learner: { select: { schoolId: true } }
      }
    });

    if (!invoice) {
      throw new ApiError(404, 'Invoice not found');
    }

    // Phase 5: Tenant Scoping
    if (schoolId && invoice.learner.schoolId !== schoolId) {
      throw new ApiError(403, 'Unauthorized access to invoice');
    }

    // Guardrail: Block payments for inactive/waived invoices
    if (invoice.status === 'PAID') {
      throw new ApiError(400, 'Invoice is already fully paid');
    }
    if (invoice.status === 'WAIVED') {
      throw new ApiError(400, 'Cannot record payment for a waived invoice');
    }

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      throw new ApiError(400, 'Amount must be a positive number');
    }

    // Process payment in a transaction to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
      // 1. Generate receipt number (atomic within transaction)
      const count = await tx.feePayment.count();
      const receiptNumber = `RCP-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

      // 2. Create the payment record
      const payment = await tx.feePayment.create({
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

      // 3. Increment paidAmount and update status/balance on invoice
      // Note: We re-fetch to get most current values or use atomic increment
      const updatedInvoice = await tx.feeInvoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: { increment: amount },
          balance: { decrement: amount }
        },
        include: {
          learner: {
            include: {
              parent: true
            }
          },
          feeStructure: true,
          payments: {
            orderBy: { paymentDate: 'asc' }
          }
        }
      });

      // 4. Recalculate status based on new balance
      let newStatus: PaymentStatus = updatedInvoice.status;
      const balance = Number(updatedInvoice.balance);
      const paid = Number(updatedInvoice.paidAmount);

      if (balance <= 0) {
        newStatus = balance < 0 ? 'OVERPAID' : 'PAID';
      } else if (paid > 0) {
        newStatus = 'PARTIAL';
      }

      // 5. Update status if changed
      if (newStatus !== updatedInvoice.status) {
        return await tx.feeInvoice.update({
          where: { id: invoiceId },
          data: { status: newStatus },
          include: {
            learner: { include: { parent: true } },
            feeStructure: true,
            payments: true
          }
        });
      }

      return { payment, invoice: updatedInvoice };
    });

    res.status(201).json({
      success: true,
      data: result,
      message: 'Payment recorded successfully'
    });
  }

  /**
   * Get payment statistics
   * Access: ACCOUNTANT, ADMIN, SUPER_ADMIN
   */
  async getPaymentStats(req: AuthRequest, res: Response) {
    const { academicYear, term, grade, startDate, endDate } = req.query;
    const schoolId = req.user?.schoolId;

    if (!schoolId) {
      throw new ApiError(403, 'School context required');
    }

    const where: any = {
      learner: {
        schoolId: schoolId
      }
    };

    if (academicYear) where.academicYear = parseInt(academicYear as string);
    if (term && term !== 'all') where.term = term;
    if (grade && grade !== 'all') {
      where.learner = {
        ...where.learner,
        grade: grade as string
      };
    }

    // Date range filtering for payments (recent payments and breakdown)
    const paymentDateFilter: any = {};
    if (startDate || endDate) {
      paymentDateFilter.paymentDate = {};
      if (startDate) paymentDateFilter.paymentDate.gte = new Date(startDate as string);
      if (endDate) paymentDateFilter.paymentDate.lte = new Date(endDate as string);
    }

    // Total invoices
    const totalInvoices = await prisma.feeInvoice.count({
      where
    });

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
        ...paymentDateFilter,
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
        ...paymentDateFilter,
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
          totalOutstanding: invoicesByStatus.reduce((sum, item) => sum + (Number(item._sum.balance) || 0), 0),
          collectionRate: invoicesByStatus.length > 0 ? Math.round((invoicesByStatus.reduce((sum, item) => sum + (Number(item._sum.paidAmount) || 0), 0) / invoicesByStatus.reduce((sum, item) => sum + (Number(item._sum.totalAmount) || 0), 0)) * 100) : 0
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
    const schoolId = req.user?.schoolId;

    if (!feeStructureId || !term || !academicYear || !dueDate || !grade) {
      throw new ApiError(400, 'Missing required fields');
    }

    // Get and validate fee structure with items
    const feeStructure = await prisma.feeStructure.findUnique({
      where: { id: feeStructureId },
      include: { feeItems: true } as any
    });

    if (!feeStructure) {
      throw new ApiError(404, 'Fee structure not found');
    }

    // Phase 5: Tenant Scoping
    if (schoolId && feeStructure.schoolId !== schoolId) {
      throw new ApiError(403, 'Unauthorized access to fee structure');
    }

    // Calculate total amount
    const totalAmount = (feeStructure as any).feeItems?.reduce((sum: number, item: any) => sum + Number(item.amount), 0) || 0;

    // Get learners for the specific grade/stream and tenant
    const learnerWhere: any = { grade, status: 'ACTIVE' };
    if (stream) learnerWhere.stream = stream;
    if (schoolId) learnerWhere.schoolId = schoolId;

    const learners = await prisma.learner.findMany({ where: learnerWhere });

    if (learners.length === 0) {
      throw new ApiError(400, 'No active learners found for the specified criteria');
    }

    // Generate invoices in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const invoices = [];
      const startCount = await tx.feeInvoice.count();

      for (let i = 0; i < learners.length; i++) {
        const learner = learners[i];

        // Ensure we don't duplicate for this period/type
        const existing = await tx.feeInvoice.findFirst({
          where: {
            learnerId: learner.id,
            feeStructureId,
            term,
            academicYear
          }
        });

        if (existing) continue;

        const invoiceNumber = `INV-${academicYear}-${String(startCount + i + 1).padStart(6, '0')}`;

        const invoice = await tx.feeInvoice.create({
          data: {
            invoiceNumber,
            learnerId: learner.id,
            feeStructureId,
            term,
            academicYear,
            dueDate: new Date(dueDate),
            totalAmount,
            paidAmount: 0,
            balance: totalAmount,
            status: 'PENDING',
            issuedBy: userId
          }
        });

        invoices.push(invoice);
      }
      return invoices;
    });

    res.status(201).json({
      success: true,
      data: results,
      count: results.length,
      message: `${results.length} invoices generated successfully`
    });
  }
}
