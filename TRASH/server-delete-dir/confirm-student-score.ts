
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function confirmStudentScore() {
    const admissionNumber = "ADM-PP2-002"; // Ayub Abdi (New Excel record)

    console.log(`🔍 Searching for scores for Admission No: "${admissionNumber}"...`);

    const student = await prisma.learner.findFirst({
        where: {
            admissionNumber: admissionNumber
        },
        include: {
            summativeResults: {
                include: {
                    test: true
                }
            }
        }
    });

    if (!student) {
        console.log('❌ Student not found.');
        return;
    }

    console.log(`\n👤 Student Found: ${student.firstName} ${student.lastName}`);
    console.log(`🆔 Admission No: ${student.admissionNumber}`);
    console.log(`📚 Grade: ${student.grade}`);
    console.log(`\n📝 Opener Test Scores (Term 1 2025):`);

    if (student.summativeResults.length === 0) {
        console.log('   ⚠️ No scores found.');
    } else {
        student.summativeResults.forEach(result => {
            console.log(`   - ${result.test.learningArea}: ${result.marksObtained}% (${result.grade})`);
        });
    }
}

confirmStudentScore()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
