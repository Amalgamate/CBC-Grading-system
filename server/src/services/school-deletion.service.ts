import prisma from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

import { auditService } from './audit.service';

export interface DeletionOptions {
    hardDelete?: boolean;      // true = permanent delete, false = soft delete
    exportData?: boolean;      // Export data before deletion
    notifyUsers?: boolean;     // Send notification to all users
    reason?: string;           // Reason for deletion
    deletedBy: string;         // User ID performing the deletion
}

export interface DeletionResult {
    success: boolean;
    message: string;
    exportUrl?: string;
    deletedAt: Date;
    stats: {
        usersAffected: number;
        learnersAffected: number;
        branchesDeleted: number;
        assessmentsDeleted: number;
    };
}

/**
 * Safely delete a school with proper cleanup
 */
export async function deleteSchoolSafely(
    schoolId: string,
    options: DeletionOptions
): Promise<DeletionResult> {

    console.log('🗑️  Starting school deletion process...');
    console.log('School ID:', schoolId);

    // 1. Validate school exists and can be deleted
    const school = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
            _count: {
                select: {
                    learners: true,
                    users: true,
                    branches: true,
                    formativeAssessments: true,
                    summativeTests: true
                }
            },
            users: {
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    role: true
                }
            }
        }
    });

    if (!school) {
        throw new Error('School not found');
    }

    if (school.status === 'TEMPLATE') {
        throw new Error('Cannot delete template school');
    }

    // 2. Export data if requested
    let exportUrl: string | undefined;
    if (options.exportData) {
        console.log('📦 Exporting school data...');
        exportUrl = await exportSchoolData(schoolId, school.name);
        console.log('✅ Data exported to:', exportUrl);
    }

    // 3. Notify users if requested
    if (options.notifyUsers && school.users.length > 0) {
        console.log('📧 Notifying users...');
        await notifySchoolUsers(school, options.reason);
    }

    // 4. Perform deletion
    const deletedAt = new Date();

    if (options.hardDelete) {
        // Log audit before permanent deletion
        await auditService.logChange({
            schoolId: schoolId,
            entityType: 'School',
            entityId: schoolId,
            action: 'DELETE',
            userId: options.deletedBy,
            reason: options.reason || 'Hard Delete',
            oldValue: JSON.stringify({ name: school.name, status: school.status })
        });

        await prisma.school.delete({
            where: { id: schoolId }
        });
    } else {
        // Soft delete
        await prisma.school.update({
            where: { id: schoolId },
            data: {
                active: false,
                status: 'DELETED'
            }
        });

        // Log audit
        await auditService.logChange({
            schoolId: schoolId,
            entityType: 'School',
            entityId: schoolId,
            action: 'UPDATE',
            userId: options.deletedBy,
            field: 'status',
            oldValue: 'ACTIVE',
            newValue: 'DELETED',
            reason: options.reason || 'Soft Delete'
        });
    }

    return {
        success: true,
        message: options.hardDelete
            ? 'School permanently deleted'
            : 'School deactivated (soft delete)',
        exportUrl,
        deletedAt,
        stats: {
            usersAffected: school._count.users,
            learnersAffected: school._count.learners,
            branchesDeleted: school._count.branches,
            assessmentsDeleted: school._count.formativeAssessments + school._count.summativeTests
        }
    };
}

/**
 * Export all school data to JSON
 */
async function exportSchoolData(schoolId: string, schoolName: string): Promise<string> {
    console.log('📥 Fetching all school data for export...');

    // Fetch all school data with related records
    const schoolData = await prisma.school.findUnique({
        where: { id: schoolId },
        include: {
            branches: {
                include: {
                    learners: {
                        include: {
                            attendances: true,
                            formativeAssessments: true,
                            summativeResults: true,
                            enrollments: {
                                include: {
                                    class: true
                                }
                            }
                        }
                    },
                    classes: {
                        include: {
                            enrollments: true,
                            attendances: true
                        }
                    }
                }
            },
            users: {
                select: {
                    id: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    middleName: true,
                    phone: true,
                    role: true,
                    status: true,
                    staffId: true,
                    createdAt: true
                    // Exclude password for security
                }
            },
            learners: {
                include: {
                    attendances: true,
                    formativeAssessments: true,
                    summativeResults: true
                }
            },
            formativeAssessments: true,
            summativeTests: {
                include: {
                    results: true
                }
            },
            feeStructures: true,
            subscriptions: {
                include: {
                    plan: true
                }
            },
            admissionSequences: true,
            gradingSystems: true,
            termConfigs: true,
            aggregationConfigs: true,
            streamConfigs: true
        }
    });

    // Create exports directory if it doesn't exist
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedName = schoolName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `school_${sanitizedName}_${timestamp}.json`;
    const filepath = path.join(exportDir, filename);

    // Write data to file
    fs.writeFileSync(filepath, JSON.stringify(schoolData, null, 2));

    console.log(`📁 Export saved to: ${filepath}`);
    console.log(`📊 File size: ${(fs.statSync(filepath).size / 1024).toFixed(2)} KB`);

    // Return relative URL (in production, this would be a cloud storage URL)
    return `/exports/${filename}`;
}

/**
 * Notify all school users about deletion
 */
async function notifySchoolUsers(
    school: any,
    reason?: string
): Promise<void> {
    const users = school.users;

    console.log(`📧 Sending notifications to ${users.length} users...`);

    for (const user of users) {
        try {
            // TODO: Implement actual email sending with nodemailer
            // For now, just log
            console.log(`  ✉️  Notifying ${user.email} (${user.role})`);

            // Actual implementation would use nodemailer:
            /*
            await sendEmail({
              to: user.email,
              subject: `Important: ${school.name} Account Closure`,
              html: `
                <h1>Account Closure Notification</h1>
                <p>Dear ${user.firstName} ${user.lastName},</p>
                <p>We regret to inform you that <strong>${school.name}</strong> will be closing its account in our system.</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                <p>All your data has been exported and will be available for download for the next 30 days.</p>
                <p>If you have any questions, please contact support.</p>
                <p>Best regards,<br>School Management System Team</p>
              `
            });
            */
        } catch (error) {
            console.error(`  ❌ Failed to notify ${user.email}:`, error);
            // Continue with other users even if one fails
        }
    }
}

/**
 * Restore a soft-deleted school
 */
export async function restoreSchool(schoolId: string): Promise<any> {
    console.log('♻️  Restoring school:', schoolId);

    const school = await prisma.school.findUnique({
        where: { id: schoolId }
    });

    if (!school) {
        throw new Error('School not found');
    }

    if (school.status !== 'DELETED') {
        throw new Error('School is not deleted');
    }

    const restored = await prisma.school.update({
        where: { id: schoolId },
        data: {
            active: true,
            status: 'ACTIVE'
        }
    });

    console.log('✅ School restored successfully');

    return restored;
}

/**
 * Get list of deleted schools (soft deleted)
 */
export async function getDeletedSchools(): Promise<any[]> {
    return await prisma.school.findMany({
        where: {
            status: 'DELETED',
            active: false
        },
        include: {
            _count: {
                select: {
                    learners: true,
                    users: true,
                    branches: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
}
