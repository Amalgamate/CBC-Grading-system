const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking Grade 5 learners...');
        // Try both formats just in case
        let learners = await prisma.learner.findMany({
            where: { grade: 'GRADE_5' },
            include: { parent: true },
            take: 5
        });

        if (learners.length === 0) {
            console.log('No learners found for GRADE_5. Trying "Grade 5"...');
            learners = await prisma.learner.findMany({
                where: { grade: 'Grade 5' },
                include: { parent: true },
                take: 5
            });
        }

        console.log(`Found ${learners.length} learners.`);
        learners.forEach(l => {
            console.log(`- ${l.firstName} ${l.lastName} (Adm: ${l.admissionNumber})`);
            console.log(`  Guardian Phone: ${l.guardianPhone}`);
            console.log(`  Parent Phone: ${l.parent?.phone}`);
            console.log(`  Guardian Name: ${l.guardianName}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
