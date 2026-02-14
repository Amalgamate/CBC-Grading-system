import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const tests = await prisma.summativeTest.findMany({
        select: {
            id: true,
            title: true,
            schoolId: true,
            status: true,
            grade: true,
            term: true,
            academicYear: true
        }
    });
    console.log('SUMMATIVE_TESTS_START');
    console.log(JSON.stringify(tests, null, 2));
    console.log('SUMMATIVE_TESTS_END');

    const schools = await prisma.school.findMany({
        select: { id: true, name: true }
    });
    console.log('SCHOOLS_START');
    console.log(JSON.stringify(schools, null, 2));
    console.log('SCHOOLS_END');
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
