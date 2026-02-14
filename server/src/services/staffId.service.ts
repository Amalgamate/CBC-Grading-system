import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Generates a unique, human-readable staff number scoped per school
 * 
 * Format: STF-{SEQUENCE} (e.g., STF-0001, STF-0002)
 *
 * Uses database-level locking via transaction to prevent race conditions
 * Staff numbers are unique per SCHOOL.
 */
export async function generateStaffId(
    schoolId: string
): Promise<string> {
    try {
        // Lock and update sequence in a transaction to prevent race conditions
        const result = await prisma.$transaction(async (tx) => {
            // Try to find existing sequence for this school
            let sequence = await (tx as any).staffSequence.findUnique({
                where: {
                    schoolId
                }
            });

            // If sequence doesn't exist, create it
            if (!sequence) {
                sequence = await (tx as any).staffSequence.create({
                    data: {
                        schoolId,
                        currentValue: 0
                    }
                });
            }

            // Increment the sequence value
            const updated = await (tx as any).staffSequence.update({
                where: {
                    schoolId
                },
                data: {
                    currentValue: {
                        increment: 1
                    }
                }
            });

            return updated;
        });

        // Format the staff number
        // Using STF prefix and padding to 4 digits for a professional look
        const paddedNumber = String(result.currentValue).padStart(4, '0');
        const staffId = `STF-${paddedNumber}`;

        console.log(
            `✓ Generated staff ID: ${staffId} for school ID: ${schoolId}`
        );

        return staffId;
    } catch (error) {
        console.error('✗ Error generating staff ID:', error);
        throw error;
    }
}

/**
 * Gets the current sequence value for a school
 */
export async function getCurrentStaffSequenceValue(
    schoolId: string
): Promise<number | null> {
    try {
        const sequence = await (prisma as any).staffSequence.findUnique({
            where: {
                schoolId
            }
        });

        if (!sequence) {
            return null;
        }

        return sequence.currentValue;
    } catch (error) {
        console.error('✗ Error fetching current staff sequence value:', error);
        throw error;
    }
}

/**
 * Resets the staff sequence for a school
 * Use with caution
 */
export async function resetStaffSequence(
    schoolId: string,
    newValue: number = 0
): Promise<void> {
    try {
        await (prisma as any).staffSequence.upsert({
            where: {
                schoolId
            },
            update: {
                currentValue: newValue
            },
            create: {
                schoolId,
                currentValue: newValue
            }
        });

        console.log(
            `✓ Staff sequence reset for school ${schoolId} to ${newValue}`
        );
    } catch (error) {
        console.error('✗ Error resetting staff sequence:', error);
        throw error;
    }
}
