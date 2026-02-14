
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSequence() {
    try {
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

        console.log(`Checking sequence for School: ${schoolId}, Year: ${currentYear}`);

        // 1. Get Sequence
        const sequence = await prisma.admissionSequence.findUnique({
            where: { schoolId_academicYear: { schoolId, academicYear: currentYear } }
        });

        console.log('Current Sequence Value:', sequence ? sequence.currentValue : 'None');

        // 2. Get All Learners and find max adm no suffix
        // Assuming format like ADM-2026-001 or similar, looking for the last digits
        const learners = await prisma.learner.findMany({
            where: { schoolId },
            select: { admissionNumber: true }
        });

        console.log(`Found ${learners.length} learners.`);

        let maxSeq = 0;
        learners.forEach(l => {
            // Simple regex to find last digits
            const match = l.admissionNumber.match(/(\d+)$/);
            if (match) {
                const val = parseInt(match[1]);
                if (val > maxSeq && l.admissionNumber.includes(currentYear.toString())) {
                    maxSeq = val;
                }
            }
        });

        console.log('Max Sequence found in Learners:', maxSeq);

        if (sequence && maxSeq >= sequence.currentValue) {
            console.log('❌ ISSUE DETECTED: Sequence is behind actual learners! Next generation will collide.');
        } else {
            console.log('✅ Sequence looks okay.');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSequence();
