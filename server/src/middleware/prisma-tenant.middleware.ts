import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

/**
 * Automatic Tenant Filtering Middleware for Prisma
 * Prevents cross-tenant data leaks by automatically injecting schoolId filters
 * 
 * Features:
 * - Auto-injects schoolId in read operations (findMany, findFirst, findUnique)
 * - Auto-injects schoolId in create operations
 * - SUPER_ADMIN bypass for system-wide operations
 * - Uses AsyncLocalStorage for request-scoped context
 */

export interface TenantContext {
    schoolId: string | null;
    branchId?: string | null;
    isSuperAdmin: boolean;
    userId?: string;
}

// Create AsyncLocalStorage for tenant context
const tenantContext = new AsyncLocalStorage<TenantContext>();

// Models that require automatic tenant filtering
const TENANT_SCOPED_MODELS = [
    'Learner',
    'User',
    'Class',
    'ClassEnrollment',
    'Attendance',
    'FormativeAssessment',
    'SummativeTest',
    'SummativeResult',
    'FeeInvoice',
    'FeeStructure',
    'FeePayment',
    'CoreCompetency',
    'ValuesAssessment',
    'CoCurricularActivity',
    'TermlyReportComment',
    'Branch',
    'StreamConfig',
    'TermConfig',
    'AggregationConfig',
    'GradingSystem',
    'AdmissionSequence'
    // TODO: Add LearningArea after production database migration is run
];

/**
 * Apply automatic tenant filtering to Prisma client
 */
export function applyTenantMiddleware(prisma: PrismaClient): void {
    prisma.$use(async (params, next) => {
        // Skip if not a tenant-scoped model
        if (!params.model || !TENANT_SCOPED_MODELS.includes(params.model)) {
            return next(params);
        }

        // Get current tenant context
        const context = tenantContext.getStore();

        // Skip auto-filtering for SUPER_ADMIN or if no context
        if (!context || context.isSuperAdmin || !context.schoolId) {
            return next(params);
        }

        // AUTO-INJECT schoolId filter for READ operations
        if (['findMany', 'findFirst', 'findUnique', 'count', 'aggregate'].includes(params.action)) {
            // Ensure where clause exists
            params.args.where = params.args.where || {};

            // Only inject if schoolId not already specified
            if (!params.args.where.schoolId) {
                params.args.where.schoolId = context.schoolId;
            }
        }

        // AUTO-INJECT schoolId for CREATE operations
        if (params.action === 'create') {
            // Only inject if schoolId not already specified
            if (!params.args.data.schoolId) {
                params.args.data.schoolId = context.schoolId;
            }
        }

        // AUTO-INJECT schoolId for BATCH CREATE
        if (params.action === 'createMany') {
            if (Array.isArray(params.args.data)) {
                params.args.data = params.args.data.map((item: any) => ({
                    ...item,
                    schoolId: item.schoolId || context.schoolId
                }));
            }
        }

        // VALIDATE schoolId for UPDATE/DELETE operations
        if (['update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
            params.args.where = params.args.where || {};

            // Ensure operation is scoped to tenant's school
            if (!params.args.where.schoolId) {
                params.args.where.schoolId = context.schoolId;
            }
        }

        return next(params);
    });

    console.log('✅ Automatic tenant filtering middleware enabled');
    console.log(`   - Protected models: ${TENANT_SCOPED_MODELS.length}`);
}

/**
 * Express middleware to set tenant context from authenticated request
 * This MUST be used after authentication middleware
 */
export function setTenantContext(req: any, res: any, next: any): void {
    const context: TenantContext = {
        schoolId: req.user?.schoolId || req.tenant?.schoolId || null,
        branchId: req.user?.branchId || req.tenant?.branchId || null,
        isSuperAdmin: req.user?.role === 'SUPER_ADMIN',
        userId: req.user?.id
    };

    // Run the request within tenant context
    tenantContext.run(context, () => {
        next();
    });
}

/**
 * Get current tenant context (for use in services)
 */
export function getTenantContext(): TenantContext | undefined {
    return tenantContext.getStore();
}

/**
 * Manually set tenant context (for testing or background jobs)
 */
export function runWithTenantContext<T>(
    context: TenantContext,
    callback: () => Promise<T>
): Promise<T> {
    return new Promise((resolve, reject) => {
        tenantContext.run(context, async () => {
            try {
                const result = await callback();
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    });
}
