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

    // Seed default fee types for a school (idempotent - only creates missing types)
    static async seedDefaults(req: Request, res: Response) {
        const schoolId = (req as any).user.schoolId as string;

        const defaultFeeTypes = [
            { code: 'TUITION', name: 'Tuition', category: 'ACADEMIC' as const, description: 'School tuition fees' },
            { code: 'ACTIVITY', name: 'Activity Fee', category: 'EXTRA_CURRICULAR' as const, description: 'Co-curricular activities' },
            { code: 'TRANSPORT', name: 'Transport', category: 'TRANSPORT' as const, description: 'School transport' },
            { code: 'MEALS', name: 'Meals', category: 'BOARDING' as const, description: 'School meals and catering' },
            { code: 'EXAM', name: 'Examination Fee', category: 'ACADEMIC' as const, description: 'Examination fees' },
            { code: 'LIBRARY', name: 'Library', category: 'ACADEMIC' as const, description: 'Library resources and materials' },
            { code: 'SPORTS', name: 'Sports Fee', category: 'EXTRA_CURRICULAR' as const, description: 'Sports programs and facilities' },
            { code: 'TECHNOLOGY', name: 'Technology Fee', category: 'ACADEMIC' as const, description: 'Computer lab and tech resources' },
            { code: 'MISC', name: 'Miscellaneous', category: 'OTHER' as const, description: 'Other school charges' }
        ];

        try {
            let createdCount = 0;
            let skippedCount = 0;
            const created = [];

            // Idempotent seeding - only create missing fee types
            for (const feeType of defaultFeeTypes) {
                try {
                    // Check if this fee type already exists
                    const existing = await prisma.feeType.findFirst({
                        where: { schoolId, code: feeType.code }
                    });

                    if (existing) {
                        skippedCount++;
                        console.log(`Fee type ${feeType.code} already exists (skipped)`);
                        continue;
                    }

                    const newType = await prisma.feeType.create({
                        data: {
                            schoolId,
                            code: feeType.code,
                            name: feeType.name,
                            category: feeType.category,
                            description: feeType.description,
                            isActive: true
                        }
                    });
                    created.push(newType);
                    createdCount++;
                } catch (error: any) {
                    if (error.code === 'P2002') {
                        // Unique constraint violation - skip
                        skippedCount++;
                        console.log(`Fee type ${feeType.code} already exists (skipped)`);
                    } else {
                        throw error;
                    }
                }
            }

            const allMessage = skippedCount > 0 
                ? `Created ${createdCount} new fee types (${skippedCount} already existed)`
                : createdCount === 0 
                ? 'All 9 default fee types already exist'
                : `Successfully seeded ${createdCount} default fee types`;

            res.json({
                message: allMessage,
                created: createdCount,
                skipped: skippedCount,
                total: defaultFeeTypes.length,
                feeTypes: created
            });
        } catch (error: any) {
            if (error instanceof ApiError) {
                throw error;
            }
            throw new ApiError(500, `Error seeding fee types: ${error.message}`);
        }
    }
}
