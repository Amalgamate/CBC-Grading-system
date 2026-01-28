import { PrismaClient, Term, Grade } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const tests = await prisma.summativeTest.findMany({
        where: {
            term: 'TERM_1' as Term,
            academicYear: 2026,
            grade: 'GRADE_1' as Grade
        }
    });

    console.log('Query result for Term 1, 2026, Grade 1:');
    console.log(JSON.stringify(tests, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
