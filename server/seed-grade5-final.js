const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 30 students with 7 corrections applied
const correctedGrade5Data = [
  { name: "Serafine Kawira", scores: { ENG: 77, MAT: 96, KISWA: 86, AGRI: 77, SST: 32, SCI: 70, CA: 60, RE: 83 } },
  { name: "Rayan Abdi", scores: { ENG: 70, MAT: 82, KISWA: 82, AGRI: 82, SST: 80, SCI: 82, CA: 71, RE: 84 } },
  { name: "Habiba Said", scores: { ENG: 80, MAT: 84, KISWA: 82, AGRI: 84, SST: 80, SCI: 88, CA: 84, RE: 93 } },
  { name: "RIDHWAN ADAN MOHAMED", scores: { ENG: 72, MAT: 78, KISWA: 26, AGRI: 76, SST: 77, SCI: 76, CA: 84, RE: 90 } },
  { name: "Ruweidha Dahir", scores: { ENG: 77, MAT: 70, KISWA: 82, AGRI: 28, SST: 73, SCI: 68, CA: 80, RE: 87 } },
  { name: "ABDIRIZAK IBRAEN ADAN", scores: { ENG: 90, MAT: 92, KISWA: 70, AGRI: 84, SST: 33, SCI: 64, CA: 60, RE: 89 } },
  { name: "SWALEHA IBRAHIM", scores: { ENG: 60, MAT: 62, KISWA: 82, AGRI: 72, SST: 80, SCI: 80, CA: 72, RE: 76 } },
  { name: "MUAD ABDI YUSSUF", scores: { ENG: 60, MAT: 60, KISWA: 74, AGRI: 38, SST: 73, SCI: 52, CA: 76, RE: 80 } },
  { name: "Farhiya Mohamed", scores: { ENG: 67, MAT: 84, KISWA: 63, AGRI: 60, SST: 70, SCI: 63, CA: 76, RE: 85 } },
  { name: "SAMIRA SHUKRI MOHAMMED", scores: { ENG: 57, MAT: 26, KISWA: 54, AGRI: 60, SST: 67, SCI: 72, CA: 60, RE: 87 } },
  { name: "RUWEIDHA MOHAMED KHELEF", scores: { ENG: 67, MAT: 66, KISWA: 72, AGRI: 77, SST: 60, SCI: 76, CA: 68, RE: 72 } },
  { name: "Hamun Mohamed Abdi", scores: { ENG: 67, MAT: 72, KISWA: 70, AGRI: 70, SST: 70, SCI: 53, CA: 76, RE: 84 } },
  { name: "Shurymi Mohamed", scores: { ENG: 63, MAT: 44, KISWA: 44, AGRI: 72, SST: 65, SCI: 60, CA: 60, RE: 80 } },
  { name: "Uthman Hassan", scores: { ENG: 63, MAT: 56, KISWA: 62, AGRI: 80, SST: 87, SCI: 54, CA: 52, RE: 84 } },
  { name: "YASMIN ROBA WARIO", scores: { ENG: 73, MAT: 68, KISWA: 52, AGRI: 87, SST: 84, SCI: 54, CA: 32, RE: 67 } },
  { name: "TUNIS NASIR ABDIRAHMAN", scores: { ENG: 37, MAT: 72, KISWA: 56, AGRI: 56, SST: 63, SCI: 68, CA: 52, RE: 80 } },
  { name: "Shuila Bashir", scores: { ENG: 53, MAT: 60, KISWA: 60, AGRI: 70, SST: 72, SCI: 56, CA: 60, RE: 73 } },
  { name: "ANAB HUSSEIN MOHAMED", scores: { ENG: 53, MAT: 54, KISWA: 64, AGRI: 48, SST: 73, SCI: 48, CA: 44, RE: 64 } },
  { name: "Abuhubeida Issack", scores: { ENG: 53, MAT: 56, KISWA: 60, AGRI: 56, SST: 47, SCI: 4, CA: 60, RE: 60 } },
  { name: "BILAL ROBA SONKOLO", scores: { ENG: 53, MAT: 58, KISWA: 60, AGRI: 60, SST: 53, SCI: 66, CA: 56, RE: 70 } },
  { name: "Mohamed Faraj", scores: { ENG: 63, MAT: 50, KISWA: 52, AGRI: 48, SST: 73, SCI: 48, CA: 44, RE: 64 } },
  { name: "Suleiman Barre", scores: { ENG: 63, MAT: 54, KISWA: 66, AGRI: 56, SST: 73, SCI: 52, CA: 44, RE: 68 } },
  { name: "SAIMA ABDULRAHMAN ALI", scores: { ENG: 63, MAT: 56, KISWA: 56, AGRI: 76, SST: 72, SCI: 56, CA: 56, RE: 73 } },
  { name: "abdallah abdi guracha", scores: { ENG: 70, MAT: 58, KISWA: 60, AGRI: 34, SST: 62, SCI: 66, CA: 76, RE: 82 } },
  { name: "IFRA HUSSEIN", scores: { ENG: 73, MAT: 12, KISWA: 64, AGRI: 56, SST: 67, SCI: 64, CA: 30, RE: 84 } },
  { name: "NAJMA HASSAN BONAYA", scores: { ENG: 63, MAT: 56, KISWA: 56, AGRI: 70, SST: 72, SCI: 52, CA: 48, RE: 73 } },
  { name: "AMINA GUYO SHUNU", scores: { ENG: 57, MAT: 52, KISWA: 50, AGRI: 70, SST: 65, SCI: 52, CA: 52, RE: 70 } },
  { name: "Abdijabar Ali", scores: { ENG: 67, MAT: 56, KISWA: 60, AGRI: 76, SST: 80, SCI: 60, CA: 60, RE: 80 } }
];

const subjectMap = {
  ENG: 'English',
  MAT: 'Mathematics',
  KISWA: 'Kiswahili',
  AGRI: 'Agriculture',
  SST: 'Social Studies',
  SCI: 'Science',
  CA: 'Creative Activities',
  RE: 'Religious Education'
};

async function seedGrade5Scores() {
  try {
    // Get school
    const school = await prisma.school.findUnique({
      where: { name: 'ZAWADI JUNIOR ACADEMY' }
    });

    if (!school) {
      console.error('❌ School not found');
      return;
    }

    // Get all grade 5 learners
    const grade5Learners = await prisma.learner.findMany({
      where: {
        schoolId: school.id,
        grade: 'GRADE_5'
      }
    });

    console.log('\n' + '═'.repeat(120));
    console.log('🌱 SEEDING GRADE 5 SCORES - 30 STUDENTS (WITH 7 CORRECTIONS APPLIED)');
    console.log('═'.repeat(120) + '\n');

    console.log(`📚 School: ${school.name}`);
    console.log(`📊 Database has ${grade5Learners.length} Grade 5 students`);
    console.log(`📝 Ready to seed ${correctedGrade5Data.length} student scores\n`);

    let successCount = 0;
    let errorCount = 0;
    let duplicateCount = 0;
    const results = [];

    for (const student of correctedGrade5Data) {
      // Find matching learner
      const learner = grade5Learners.find(l =>
        [l.firstName, l.lastName, l.middleName].filter(Boolean).join(' ').toLowerCase() ===
        student.name.toLowerCase()
      );

      if (!learner) {
        results.push({
          name: student.name,
          status: '❌ NOT FOUND IN DATABASE'
        });
        errorCount++;
        continue;
      }

      let studentSuccessCount = 0;

      // For each subject, create a FormativeAssessment record
      for (const [subjectCode, points] of Object.entries(student.scores)) {
        try {
          const subjectName = subjectMap[subjectCode];
          const percentage = Math.round((points / 100) * 100);

          // Check if record already exists
          const existing = await prisma.formativeAssessment.findFirst({
            where: {
              learnerId: learner.id,
              learningArea: subjectName,
              term: 'TERM_1'
            }
          });

          if (existing) {
            duplicateCount++;
            continue;
          }

          // Create new assessment
          await prisma.formativeAssessment.create({
            data: {
              learnerId: learner.id,
              schoolId: school.id,
              learningArea: subjectName,
              points: points,
              percentage: percentage,
              term: 'TERM_1',
              academicYear: '2026',
              type: 'OPENER',
              overallRating: 'PROFICIENCY'  // Default rating
            }
          });

          successCount++;
          studentSuccessCount++;
        } catch (err) {
          console.error(`Error for ${learner.firstName} - ${subjectMap[subjectCode]}:`, err.message);
        }
      }

      results.push({
        name: learner.firstName,
        status: studentSuccessCount > 0 ? `✅ SEEDED (${studentSuccessCount} subjects)` : '⚠️ FAILED'
      });
    }

    console.log('\n' + '─'.repeat(120));
    console.log('📊 SEEDING RESULTS:\n');

    results.forEach(result => {
      console.log(`${result.status} - ${result.name}`);
    });

    console.log('\n' + '═'.repeat(120));
    console.log('\n✅ SUMMARY:\n');
    console.log(`✅ Total records created: ${successCount}`);
    console.log(`✅ Students seeded: ${results.filter(r => r.status.includes('✅')).length}`);
    console.log(`⚠️  Duplicate records skipped: ${duplicateCount}`);
    console.log(`❌ Students not found in DB: ${results.filter(r => r.status.includes('❌')).length}`);
    console.log(`\n📌 STILL MISSING (Not in handwritten scores):\n`);
    
    const unseededStudents = grade5Learners.filter(dbStudent => 
      !correctedGrade5Data.some(scoredStudent => 
        scoredStudent.name.toLowerCase() === 
        [dbStudent.firstName, dbStudent.lastName, dbStudent.middleName]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
      )
    );

    unseededStudents.forEach((student, idx) => {
      const fullName = [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ');
      console.log(`${String(idx + 1).padStart(2, '0')}. ${fullName}`);
    });

    console.log('\n═'.repeat(120) + '\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedGrade5Scores();
