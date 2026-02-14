
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixSequence() {
    try {
        console.log('Starting Sequence Fix...');

        // 1. Get Context
        const adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            include: { school: true }
        });

        if (!adminUser || !adminUser.schoolId) {
            console.error('❌ No Admin user with School found for context.');
            return;
        }

        const schoolId = adminUser.schoolId;
        const currentYear = new Date().getFullYear();

        console.log(`Fixing sequence for School: ${schoolId}, Year: ${currentYear}`);

        // 2. Get All Learners to find max
        const learners = await prisma.learner.findMany({
            where: { schoolId },
            select: { admissionNumber: true }
        });

        let maxSeq = 0;
        learners.forEach(l => {
            // Look for digits at the end
            const match = l.admissionNumber.match(/(\d+)$/);
            if (match) {
                const val = parseInt(match[1]);
                // Only consider if it looks like it belongs to this year (contains 2026 or whatever)
                // Or just trust the suffix if checking sequence for current year
                if (l.admissionNumber.includes(currentYear.toString()) && val > maxSeq) {
                    maxSeq = val;
                }
            }
        });

        console.log('Max Sequence found in Learners:', maxSeq);

        // 3. Update Sequence
        const currentSeq = await prisma.admissionSequence.findUnique({
            where: { schoolId_academicYear: { schoolId, academicYear: currentYear } }
        });

        if (currentSeq && currentSeq.currentValue < maxSeq) {
            console.log(`Updating sequence from ${currentSeq.currentValue} to ${maxSeq}...`);
            await prisma.admissionSequence.update({
                where: { schoolId_academicYear: { schoolId, academicYear: currentYear } },
                data: { currentValue: maxSeq }
            });
            console.log('✅ Sequence updated successfully.');
        } else if (!currentSeq) {
            console.log(`Creating new sequence starting at ${maxSeq}...`);
            await prisma.admissionSequence.create({
                data: {
                    schoolId,
                    academicYear: currentYear,
                    currentValue: maxSeq
                }
            });
            console.log('✅ Sequence created.');
        } else {
            console.log('✅ Sequence is already ahead or equal. No action needed.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fixSequence();
