import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const schoolId = '373edb5d-fc33-466d-8eb0-75cfb8d56712'; // Zawadi Junior Academy
    const tests = await prisma.summativeTest.findMany({
        where: { schoolId },
        include: {
            creator: {
                select: { firstName: true, lastName: true }
            }
        }
    });
    console.log(`Found ${tests.length} tests for Zawadi Junior Academy`);
    console.log(JSON.stringify(tests, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
