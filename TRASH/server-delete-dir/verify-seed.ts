
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verify() {
    console.log('🔍 Verifying seeded learners...\n');

    const school = await prisma.school.findFirst({
        where: { name: 'ZAWADI JUNIOR ACADEMY' }
    });

    if (!school) {
        console.error('❌ School not found!');
        return;
    }

    const grades = ['PP1', 'PP2'];

    for (const grade of grades) {
        console.log(`--- Grade: ${grade} ---`);
        const count = await prisma.learner.count({
            where: {
                schoolId: school.id,
                grade: grade as any
            }
        });
        console.log(`Total Learners: ${count}`);

        const learners = await prisma.learner.findMany({
            where: {
                schoolId: school.id,
                grade: grade as any
            },
            take: 5,
            include: {
                enrollments: {
                    include: {
                        class: true
                    }
                }
            }
        });

        learners.forEach(l => {
            const className = l.enrollments[0]?.class?.name || 'No Class';
            console.log(`   - ${l.firstName} ${l.lastName} (${l.admissionNumber}) -> ${className}`);
        });
        console.log('');
    }
}

verify()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
