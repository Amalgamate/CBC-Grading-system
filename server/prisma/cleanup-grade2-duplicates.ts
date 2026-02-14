import { PrismaClient, Grade } from '@prisma/client';

const prisma = new PrismaClient();

const SCHOOL_ID = '3e435fdf-2439-4329-b8c5-8245f6041cb2';
const GRADE = Grade.GRADE_2;

const STUDENTS_TO_KEEP = [
    { firstName: 'Omar', lastName: 'Ibrahim' },
    { firstName: 'Salman', lastName: 'Abdi' },
    { firstName: 'Hudheyfa', lastName: 'Mohamed' },
    { firstName: 'Robin', lastName: 'Munene' },
    { firstName: 'Mohamed', lastName: 'Abdi' },
    { firstName: 'Mahir', lastName: 'Ahmed' },
    { firstName: 'Mumtaz', lastName: 'Mohamed' },
    { firstName: 'Samiira', lastName: 'Abdirahman' },
    { firstName: 'Ramzia', lastName: 'Issack' },
    { firstName: 'Shinaz', lastName: 'Abdirizack' },
    { firstName: 'Amina', lastName: 'Osman' },
    { firstName: 'Adan', lastName: 'Bishar' },
    { firstName: 'Abigael', lastName: 'Mukiri' },
    { firstName: 'Muzni', lastName: 'Abdikadir' },
    { firstName: 'Zeitun', lastName: 'Hassan' },
    { firstName: 'Evaline', lastName: 'Ntinyari' },
    { firstName: 'Ramadhan', lastName: 'Mohamud' },
    { firstName: 'Ilhaal', lastName: 'Issack' },
    { firstName: 'Abdulahi', lastName: 'Biliau' },
    { firstName: 'Sumeya', lastName: 'Ibrahim' },
    { firstName: 'Hassan', lastName: 'Noor' },
    { firstName: 'Sahman', lastName: 'Shaban' },
    { firstName: 'Mohamed', lastName: 'Rashid' },
    { firstName: 'Jabir', lastName: 'Abdi' },
    { firstName: 'Ilhan', lastName: 'Salat' },
    { firstName: 'Khalif', lastName: 'Hussein' }
];

async function cleanup() {
    console.log('🧹 Starting cleanup of duplicate Grade 2 learners...');

    // 1. Get all Grade 2 learners for this school
    const allGrade2Learners = await prisma.learner.findMany({
        where: {
            schoolId: SCHOOL_ID,
            grade: GRADE
        },
        select: {
            id: true,
            firstName: true,
            lastName: true
        }
    });

    console.log(`🔍 Found ${allGrade2Learners.length} total Grade 2 learners.`);

    const learnersToDelete = [];
    const learnersToKeep = [];

    for (const learner of allGrade2Learners) {
        const shouldKeep = STUDENTS_TO_KEEP.some(s =>
            s.firstName.toLowerCase() === learner.firstName.toLowerCase() &&
            s.lastName.toLowerCase() === learner.lastName.toLowerCase()
        );

        if (shouldKeep) {
            // Check if we already kept this name (to handle duplicates of students we WANT to keep)
            const alreadyKept = learnersToKeep.some(k =>
                k.firstName.toLowerCase() === learner.firstName.toLowerCase() &&
                k.lastName.toLowerCase() === learner.lastName.toLowerCase()
            );

            if (alreadyKept) {
                learnersToDelete.push(learner);
            } else {
                learnersToKeep.push(learner);
            }
        } else {
            learnersToDelete.push(learner);
        }
    }

    console.log(`🗑️ Identified ${learnersToDelete.length} learners to delete.`);
    console.log(`✅ Keeping ${learnersToKeep.length} learners.`);

    if (learnersToDelete.length > 0) {
        const idsToDelete = learnersToDelete.map(l => l.id);

        // Use a transaction to ensure all related records are cleaned up if necessary
        // although Prisma cascade delete should handle most if defined in schema.
        await prisma.$transaction([
            prisma.summativeResult.deleteMany({
                where: { learnerId: { in: idsToDelete } }
            }),
            prisma.formativeAssessment.deleteMany({
                where: { learnerId: { in: idsToDelete } }
            }),
            prisma.classEnrollment.deleteMany({
                where: { learnerId: { in: idsToDelete } }
            }),
            prisma.attendance.deleteMany({
                where: { learnerId: { in: idsToDelete } }
            }),
            prisma.learner.deleteMany({
                where: { id: { in: idsToDelete } }
            })
        ]);

        console.log('✨ Deletion completed.');
    } else {
        console.log('ℹ️ No learners found to delete.');
    }

    // Final verification
    const finalCount = await prisma.learner.count({
        where: {
            schoolId: SCHOOL_ID,
            grade: GRADE
        }
    });
    console.log(`📊 Final Grade 2 learner count: ${finalCount}`);
}

cleanup()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
