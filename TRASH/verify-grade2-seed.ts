import { PrismaClient, Grade } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    const schoolId = '3e435fdf-2439-4329-b8c5-8245f6041cb2';
    const grade = Grade.GRADE_2;

    console.log(`Verifying Grade 2 data for school: ${schoolId}`);

    const learners = await prisma.learner.findMany({
        where: { schoolId, grade }
    });
    console.log(`Total Grade 2 learners found: ${learners.length}`);

    const tests = await prisma.summativeTest.findMany({
        where: { schoolId, grade, term: 'TERM_1', academicYear: 2026 }
    });
    console.log(`Total Term 1 2026 tests found: ${tests.length}`);
    tests.forEach(t => console.log(` - ${t.learningArea}: ${t.title}`));

    const resultsCount = await prisma.summativeResult.count({
        where: { schoolId, test: { grade } }
    });
    console.log(`Total summative results found for Grade 2: ${resultsCount}`);

    if (learners.length === 26 && tests.length === 6 && resultsCount >= 156) {
        console.log('✅ Verification successful: All Grade 2 data seeded correctly.');
    } else {
        console.log('⚠️ Verification warning: Some data might be missing or already existed.');
    }
}

verify()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
