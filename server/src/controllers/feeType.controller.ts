import { Request, Response } from 'express';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';
import { FeeCategory } from '@prisma/client';

export class FeeTypeController {
    // Get all fee types for a school
    static async getAll(req: Request, res: Response) {
        // Assert schoolId is string (from AuthRequest)
        const schoolId = (req as any).user.schoolId as string;
        const { category, active } = req.query;

        const where: any = { schoolId };

        if (category) {
            where.category = category as FeeCategory;
        }

        if (active !== undefined) {
            where.isActive = active === 'true';
        }

        const feeTypes = await prisma.feeType.findMany({
            where,
            orderBy: { name: 'asc' }
        });

        res.json(feeTypes);
    }

    // Create a new fee type
    static async create(req: Request, res: Response) {
        const schoolId = (req as any).user.schoolId as string;
        const { code, name, description, category, isActive } = req.body;

        // Check if code already exists
        const existing = await prisma.feeType.findFirst({
            where: { schoolId, code }
        });

        if (existing) {
            throw new ApiError(400, 'Fee type code already exists');
        }

        const feeType = await prisma.feeType.create({
            data: {
                schoolId,
                code,
                name,
                description,
                category: category || FeeCategory.ACADEMIC,
                isActive: isActive !== undefined ? isActive : true
            }
        });

        res.status(201).json(feeType);
    }

    // Update a fee type
    static async update(req: Request, res: Response) {
        const { id } = req.params;
        const schoolId = (req as any).user.schoolId as string;
        const { name, description, category, isActive } = req.body;

        const feeType = await prisma.feeType.findFirst({
            where: { id, schoolId }
        });

        if (!feeType) {
            throw new ApiError(404, 'Fee type not found');
        }

        const updated = await prisma.feeType.update({
            where: { id },
            data: {
                name,
                description,
                category,
                isActive
            }
        });

        res.json(updated);
    }

    // Delete a fee type
    static async delete(req: Request, res: Response) {
        const { id } = req.params;
        const schoolId = (req as any).user.schoolId as string;

        const feeType = await prisma.feeType.findFirst({
            where: { id, schoolId },
            include: {
                _count: {
                    select: { feeStructureItems: true }
                }
            }
        });

        if (!feeType) {
            throw new ApiError(404, 'Fee type not found');
        }

        // Safe access to _count with type guard or assertion if needed, 
        // but Prisma should infer it. If not, we check existence.
        const structureCount = feeType._count ? feeType._count.feeStructureItems : 0;

        if (structureCount > 0) {
            throw new ApiError(400, 'Cannot delete fee type because it is used in fee structures');
        }

        await prisma.feeType.delete({
            where: { id }
        });

        res.json({ message: 'Fee type deleted successfully' });
    }
}
