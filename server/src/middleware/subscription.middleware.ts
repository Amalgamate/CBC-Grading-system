import { Response, NextFunction } from 'express';
import { AuthRequest } from './permissions.middleware';
import prisma from '../config/database';
import { ApiError } from '../utils/error.util';

/**
 * Subscription Enforcement Middleware
 * Ensures schools have active subscriptions before accessing premium features
 * 
 * Features:
 * - Check subscription status and expiration
 * - Feature-based access control by plan
 * - SUPER_ADMIN bypass
 * - Grace period handling
 */

export interface SubscriptionInfo {
    id: string;
    status: string;
    expiresAt: Date;
    plan: {
        id: string;
        name: string;
        modules: any;
        maxBranches: number;
    };
}

/**
 * Middleware to enforce active subscription
 * Blocks access if school subscription is expired or inactive
 */
export const requireActiveSubscription = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        const schoolId = req.user?.schoolId;

        // SUPER_ADMIN bypass
        if (req.user?.role === 'SUPER_ADMIN') {
            return next();
        }

        if (!schoolId) {
            throw new ApiError(403, 'No school association found');
        }

        // Check for active subscription
        const activeSubscription = await prisma.schoolSubscription.findFirst({
            where: {
                schoolId,
                status: 'ACTIVE',
                expiresAt: {
                    gte: new Date()
                }
            },
            include: {
                plan: true
            }
        });

        if (!activeSubscription) {
            // Check if there's an expired subscription (for grace period)
            const expiredSubscription = await prisma.schoolSubscription.findFirst({
                where: { schoolId },
                orderBy: { expiresAt: 'desc' },
                include: { plan: true }
            });

            if (expiredSubscription) {
                const daysExpired = Math.floor(
                    (Date.now() - expiredSubscription.expiresAt.getTime()) / (1000 * 60 * 60 * 24)
                );

                // Allow 7-day grace period
                if (daysExpired <= 7) {
                    console.warn(`⚠️  School ${schoolId} in grace period (${daysExpired} days expired)`);
                    (req as any).subscription = expiredSubscription;
                    (req as any).subscriptionGracePeriod = true;
                    return next();
                }
            }

            // Subscription expired or not found
            return res.status(402).json({
                success: false,
                error: 'Subscription expired or inactive',
                message: 'Your school subscription has expired. Please contact support to renew.',
                code: 'SUBSCRIPTION_EXPIRED',
                contactEmail: 'support@elimcrown.com'
            });
        }

        // Attach subscription info to request
        (req as any).subscription = activeSubscription;
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware to check if a specific feature is available in the school's plan
 * Usage: requireFeature('CBC_ASSESSMENTS')
 */
export const requireFeature = (featureName: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void | Response => {
        try {
            // SUPER_ADMIN bypass
            if (req.user?.role === 'SUPER_ADMIN') {
                return next();
            }

            const subscription = (req as any).subscription as SubscriptionInfo | undefined;

            if (!subscription) {
                throw new ApiError(403, 'No subscription information found. Please ensure requireActiveSubscription middleware runs first.');
            }

            // Check if feature is included in plan
            const modules = subscription.plan.modules;

            // Support both object and array format for modules
            let hasFeature = false;

            if (typeof modules === 'object' && modules !== null) {
                if (Array.isArray(modules)) {
                    // Array format: ['FEATURE1', 'FEATURE2']
                    hasFeature = modules.includes(featureName);
                } else {
                    // Object format: { FEATURE1: true, FEATURE2: false }
                    hasFeature = modules[featureName] === true;
                }
            }

            if (!hasFeature) {
                return res.status(403).json({
                    success: false,
                    error: 'Feature not available in your plan',
                    feature: featureName,
                    currentPlan: subscription.plan.name,
                    message: `The feature "${featureName}" is not available in your current plan (${subscription.plan.name}). Please upgrade to access this feature.`,
                    code: 'FEATURE_NOT_AVAILABLE',
                    upgradeUrl: `${process.env.FRONTEND_URL}/subscription/upgrade`
                });
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

/**
 * Middleware to check branch limit
 * Prevents creating branches beyond plan limit
 */
export const checkBranchLimit = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void | Response> => {
    try {
        // SUPER_ADMIN bypass
        if (req.user?.role === 'SUPER_ADMIN') {
            return next();
        }

        const subscription = (req as any).subscription as SubscriptionInfo | undefined;
        const schoolId = req.user?.schoolId;

        if (!subscription || !schoolId) {
            return next();
        }

        // Count existing branches
        const branchCount = await prisma.branch.count({
            where: { schoolId, active: true }
        });

        // Check against plan limit
        if (branchCount >= subscription.plan.maxBranches) {
            return res.status(403).json({
                success: false,
                error: 'Branch limit reached',
                message: `Your current plan (${subscription.plan.name}) allows up to ${subscription.plan.maxBranches} branches. You currently have ${branchCount} active branches.`,
                currentBranches: branchCount,
                maxBranches: subscription.plan.maxBranches,
                code: 'BRANCH_LIMIT_EXCEEDED',
                upgradeUrl: `${process.env.FRONTEND_URL}/subscription/upgrade`
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Get subscription info for the current user's school
 */
export async function getSchoolSubscription(schoolId: string): Promise<SubscriptionInfo | null> {
    const subscription = await prisma.schoolSubscription.findFirst({
        where: {
            schoolId,
            status: 'ACTIVE',
            expiresAt: {
                gte: new Date()
            }
        },
        include: {
            plan: true
        }
    });

    return subscription;
}

/**
 * Check if subscription is expiring soon (within 7 days)
 */
export async function isSubscriptionExpiringSoon(schoolId: string): Promise<{
    expiringSoon: boolean;
    daysRemaining: number;
}> {
    const subscription = await getSchoolSubscription(schoolId);

    if (!subscription) {
        return { expiringSoon: false, daysRemaining: 0 };
    }

    const daysRemaining = Math.floor(
        (subscription.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return {
        expiringSoon: daysRemaining <= 7,
        daysRemaining
    };
}
