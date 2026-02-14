
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function renameTests() {
    console.log('🔄 Renaming "zzzz" tests to "Timer National Exams"...');

    // Find all tests with title 'zzzz' (case insensitive or exact)
    const tests = await prisma.summativeTest.findMany({
        where: {
            OR: [
                { title: 'zzzz' },
                { title: 'ZZZZ' },
                { title: { startsWith: 'zzzz' } }
            ]
        }
    });

    console.log(`FOUND: ${tests.length} tests to rename.`);

    for (const test of tests) {
        // Construct new title. 
        // If we just set it to "Timer National Exams", we lose subject info if it wasn't in the title.
        // However, the user asked to rename "zzzz" to "Timer National Exams".
        // I will append the learning area to ensure uniqueness and clarity: "Timer National Exams - Mathematics"

        // Check if learning area is already part of the name? No, title was just "zzzz"
        const newTitle = `Timer National Exams - ${test.learningArea}`;

        console.log(`   Renaming "${test.title}" (${test.learningArea}) -> "${newTitle}"`);

        await prisma.summativeTest.update({
            where: { id: test.id },
            data: {
                title: newTitle
            }
        });
    }
}

renameTests()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
