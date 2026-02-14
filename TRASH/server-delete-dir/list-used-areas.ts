
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsedLearningAreas() {
    console.log('📋 Listing unique learning areas used in SummativeTest...');

    const tests = await prisma.summativeTest.findMany({
        select: {
            learningArea: true,
            grade: true
        },
        distinct: ['learningArea', 'grade']
    });

    const grouped: Record<string, string[]> = {};
    tests.forEach(t => {
        const grade = t.grade || 'UNKNOWN';
        if (!grouped[grade]) grouped[grade] = [];
        grouped[grade].push(t.learningArea);
    });

    for (const grade in grouped) {
        console.log(`\nGrade: ${grade}`);
        grouped[grade].forEach(name => console.log(`  - ${name}`));
    }
}

listUsedLearningAreas()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
