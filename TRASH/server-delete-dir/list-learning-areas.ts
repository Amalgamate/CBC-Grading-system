
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listLearningAreas() {
    console.log('📋 Listing all Learning Areas in DB...');

    const areas = await prisma.learningArea.findMany({
        orderBy: [
            { gradeLevel: 'asc' },
            { name: 'asc' }
        ]
    });

    if (areas.length === 0) {
        console.log('❌ No learning areas found in DB.');
        return;
    }

    const grouped: Record<string, string[]> = {};
    areas.forEach(a => {
        const grade = a.gradeLevel || 'GLOBAL';
        if (!grouped[grade]) grouped[grade] = [];
        grouped[grade].push(a.name);
    });

    for (const grade in grouped) {
        console.log(`\nGrade: ${grade}`);
        grouped[grade].forEach(name => console.log(`  - ${name}`));
    }
}

listLearningAreas()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
