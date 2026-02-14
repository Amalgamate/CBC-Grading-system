import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const pp1Results = await prisma.summativeResult.findMany({
        where: {
            learner: {
                grade: 'PP1'
            }
        },
        include: {
            learner: {
                select: { firstName: true, lastName: true, admissionNumber: true }
            },
            test: {
                select: { learningArea: true, testType: true, totalMarks: true, title: true }
            }
        }
    });

    console.log(`Found ${pp1Results.length} PP1 results.`);

    // Group by learner
    const byLearner = {};
    pp1Results.forEach(r => {
        const key = `${r.learner.firstName} ${r.learner.lastName} (${r.learner.admissionNumber})`;
        if (!byLearner[key]) byLearner[key] = [];
        byLearner[key].push({
            area: r.test.learningArea,
            type: r.test.testType,
            score: r.marksObtained,
            total: r.test.totalMarks,
            title: r.test.title
        });
    });

    Object.entries(byLearner).slice(0, 5).forEach(([learner, results]) => {
        console.log(`\nLearner: ${learner}`);
        results.forEach(res => {
            console.log(`  - ${res.area} (${res.type}): ${res.score}/${res.total} [${res.title}]`);
        });
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
