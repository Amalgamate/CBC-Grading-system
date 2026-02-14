import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const learner = await prisma.learner.findFirst({
        where: { admissionNumber: { contains: '100' } },
        include: {
            summativeResults: {
                include: {
                    test: true
                }
            }
        }
    });

    if (!learner) {
        console.log('Learner not found');
        return;
    }

    console.log(`Learner: ${learner.firstName} ${learner.lastName} (ADM: ${learner.admissionNumber})`);
    console.log(`Grade: ${learner.grade}, Stream: ${learner.stream}`);
    console.log('--- Results ---');
    learner.summativeResults.forEach(r => {
        console.log(`- ${r.test.learningArea} (${r.test.testType}): ${r.marksObtained}/${r.test.totalMarks}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
