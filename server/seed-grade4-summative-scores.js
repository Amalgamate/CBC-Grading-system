const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Grade 4 Summative Scores - 32 students
const grade4SummativeData = [
  { name: "Sumeya Mohamed", scores: { MAT: 88, ENG: 85, KISWA: 85, SCI: 96, SST: 92, AGRI: 88, CA: 76, RE: 80 } },
  { name: "Rahma Dida", scores: { MAT: 84, ENG: 90, KISWA: 70, SCI: 96, SST: 92, AGRI: 80, CA: 76, RE: 87 } },
  { name: "Harith Said", scores: { MAT: 92, ENG: 83, KISWA: 63, SCI: 84, SST: 92, AGRI: 80, CA: 76, RE: 93 } },
  { name: "Zeid Rashid", scores: { MAT: 84, ENG: 83, KISWA: 75, SCI: 96, SST: 76, AGRI: 92, CA: 64, RE: 73 } },
  { name: "Mohamed Adan", scores: { MAT: 76, ENG: 85, KISWA: 73, SCI: 88, SST: 80, AGRI: 80, CA: 72, RE: 80 } },
  { name: "Wario Juma", scores: { MAT: 88, ENG: 70, KISWA: 83, SCI: 88, SST: 80, AGRI: 76, CA: 64, RE: 73 } },
  { name: "Jarso Dida", scores: { MAT: 88, ENG: 76, KISWA: 63, SCI: 96, SST: 76, AGRI: 76, CA: 60, RE: 80 } },
  { name: "Abdisamad Adan", scores: { MAT: 82, ENG: 75, KISWA: 60, SCI: 96, SST: 80, AGRI: 72, CA: 60, RE: 80 } },
  { name: "Mubarak Mohamed", scores: { MAT: 80, ENG: 83, KISWA: 63, SCI: 84, SST: 84, AGRI: 84, CA: 64, RE: 67 } },
  { name: "Asmahan Abdirahman", scores: { MAT: 64, ENG: 60, KISWA: 68, SCI: 96, SST: 88, AGRI: 92, CA: 48, RE: 80 } },
  { name: "Basra Omar", scores: { MAT: 80, ENG: 73, KISWA: 65, SCI: 68, SST: 83, AGRI: 76, CA: 56, RE: 80 } },
  { name: "Umeyma Rashid", scores: { MAT: 76, ENG: 66, KISWA: 73, SCI: 96, SST: 76, AGRI: 88, CA: 52, RE: 47 } },
  { name: "Abdulamin Jattani", scores: { MAT: 76, ENG: 60, KISWA: 70, SCI: 76, SST: 76, AGRI: 72, CA: 76, RE: 67 } },
  { name: "Abdulrashid Hussein", scores: { MAT: 44, ENG: 68, KISWA: 60, SCI: 92, SST: 72, AGRI: 72, CA: 64, RE: 100 } },
  { name: "Sumeya Abdirazak", scores: { MAT: 76, ENG: 63, KISWA: 53, SCI: 100, SST: 76, AGRI: 84, CA: 52, RE: 67 } },
  { name: "Nazmin Jamal", scores: { MAT: 72, ENG: 65, KISWA: 68, SCI: 92, SST: 68, AGRI: 68, CA: 64, RE: 73 } },
  { name: "Masuud Mohamed", scores: { MAT: 60, ENG: 73, KISWA: 73, SCI: 76, SST: 72, AGRI: 72, CA: 56, RE: 87 } },
  { name: "Mohamed Rashid", scores: { MAT: 80, ENG: 68, KISWA: 45, SCI: 92, SST: 64, AGRI: 76, CA: 60, RE: 80 } },
  { name: "Miraj Sirat", scores: { MAT: 84, ENG: 60, KISWA: 68, SCI: 72, SST: 68, AGRI: 64, CA: 56, RE: 93 } },
  { name: "Farhan Abdi", scores: { MAT: 76, ENG: 73, KISWA: 65, SCI: 80, SST: 80, AGRI: 72, CA: 44, RE: 60 } },
  { name: "Muktar Mohamed", scores: { MAT: 68, ENG: 65, KISWA: 48, SCI: 80, SST: 60, AGRI: 72, CA: 72, RE: 87 } },
  { name: "Ali Abdow", scores: { MAT: 48, ENG: 65, KISWA: 65, SCI: 92, SST: 80, AGRI: 68, CA: 48, RE: 80 } },
  { name: "Nusra Omar", scores: { MAT: 60, ENG: 50, KISWA: 50, SCI: 80, SST: 80, AGRI: 72, CA: 64, RE: 73 } },
  { name: "Bilal Abdi", scores: { MAT: 36, ENG: 60, KISWA: 65, SCI: 68, SST: 80, AGRI: 68, CA: 60, RE: 73 } },
  { name: "Hudheifa Hassan", scores: { MAT: 76, ENG: 73, KISWA: 53, SCI: 68, SST: 64, AGRI: 72, CA: 44, RE: 53 } },
  { name: "Yassir Alinoor", scores: { MAT: 68, ENG: 66, KISWA: 60, SCI: 60, SST: 72, AGRI: 56, CA: 60, RE: 60 } },
  { name: "Nurdin Ibrahim", scores: { MAT: 40, ENG: 63, KISWA: 75, SCI: 72, SST: 60, AGRI: 48, CA: 64, RE: 60 } },
  { name: "Sadia Issack", scores: { MAT: 56, ENG: 45, KISWA: 50, SCI: 56, SST: 72, AGRI: 64, CA: 48, RE: 73 } },
  { name: "Derrick Simiyu", scores: { MAT: 64, ENG: 55, KISWA: 55, SCI: 64, SST: 64, AGRI: 44, CA: 48, RE: 60 } },
  { name: "Umulkheri Sahal", scores: { MAT: 52, ENG: 50, KISWA: 58, SCI: 52, SST: 52, AGRI: 44, CA: 52, RE: 53 } },
  { name: "Manzur Ahmed", scores: { MAT: 32, ENG: 40, KISWA: 53, SCI: 48, SST: 60, AGRI: 52, CA: 52, RE: 33 } },
  { name: "Najib Adan", scores: { MAT: 28, ENG: 20, KISWA: 18, SCI: 36, SST: 56, AGRI: 52, CA: 48, RE: 40 } }
];

const subjectMap = {
  MAT: 'Mathematics',
  ENG: 'English',
  KISWA: 'Kiswahili',
  SCI: 'Science',
  SST: 'Social Studies',
  AGRI: 'Agriculture',
  CA: 'Creative Activities',
  RE: 'Religious Education'
};

// Levenshtein distance for fuzzy matching
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;

  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  return matrix[len2][len1];
}

function findBestMatch(providedName, databaseLearners) {
  const normalized = providedName.toLowerCase().trim();
  
  let bestMatch = null;
  let bestScore = Infinity;

  databaseLearners.forEach(learner => {
    const fullName = `${learner.firstName} ${learner.lastName}`.toLowerCase().trim();
    const score = levenshteinDistance(normalized, fullName);
    
    if (score < bestScore) {
      bestScore = score;
      bestMatch = learner;
    }
  });

  return bestScore <= 6 ? { learner: bestMatch, score: bestScore } : null;
}

function getGrade(percentage) {
  if (percentage >= 80) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'E';
}

async function seedGrade4SummativeScores() {
  try {
    console.log('\n' + '═'.repeat(130));
    console.log('🌱 SEEDING GRADE 4 SUMMATIVE SCORES - 32 STUDENTS');
    console.log('═'.repeat(130) + '\n');

    // Get school
    const school = await prisma.school.findUnique({
      where: { name: 'ZAWADI JUNIOR ACADEMY' }
    });

    if (!school) {
      console.error('❌ School not found');
      process.exit(1);
    }

    // Get a teacher from the school
    const teacher = await prisma.user.findFirst({
      where: {
        schoolId: school.id,
        role: 'TEACHER'
      }
    });

    if (!teacher) {
      console.error('❌ Teacher not found in school');
      process.exit(1);
    }

    // Get all grade 4 learners
    const grade4Learners = await prisma.learner.findMany({
      where: {
        schoolId: school.id,
        grade: 'GRADE_4'
      }
    });

    console.log(`📚 School: ${school.name}`);
    console.log(`👨‍🏫 Teacher: ${teacher.firstName} ${teacher.lastName}`);
    console.log(`📊 Database has ${grade4Learners.length} Grade 4 students`);
    console.log(`📝 Ready to seed ${grade4SummativeData.length} student scores for 8 subjects\n`);

    const testDate = new Date('2026-01-20');
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Create or get summative tests for each subject
    const tests = {};
    console.log('📋 Creating/fetching summative tests for each subject...\n');

    for (const [subjectCode, subjectName] of Object.entries(subjectMap)) {
      let test = await prisma.summativeTest.findFirst({
        where: {
          schoolId: school.id,
          learningArea: subjectName,
          grade: 'GRADE_4',
          term: 'TERM_1'
        }
      });

      if (!test) {
        test = await prisma.summativeTest.create({
          data: {
            title: `Grade 4 - ${subjectName} Term 1 Test`,
            learningArea: subjectName,
            grade: 'GRADE_4',
            term: 'TERM_1',
            academicYear: 2026,
            testDate: testDate,
            totalMarks: 100,
            passMarks: 40,
            createdBy: teacher.id,
            schoolId: school.id,
            status: 'PUBLISHED',
            published: true
          }
        });
        console.log(`✅ Created test for ${subjectName}`);
      } else {
        console.log(`✅ Using existing test for ${subjectName}`);
      }

      tests[subjectCode] = test;
    }

    console.log('\n' + '─'.repeat(130));
    console.log('SEEDING STUDENT SCORES:');
    console.log('─'.repeat(130) + '\n');

    // Seed scores for each student
    for (const student of grade4SummativeData) {
      let learner = null;
      const match = findBestMatch(student.name, grade4Learners);
      
      if (!match) {
        // Create new learner if not found
        try {
          const nameParts = student.name.trim().split(/\s+/);
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Unknown';
          const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined;
          
          const branch = await prisma.branch.findFirst({
            where: { schoolId: school.id }
          });

          if (!branch) {
            console.error(`❌ No branch found for school ${school.name}`);
            errorCount++;
            continue;
          }

          const admissionNumber = `GR4-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          learner = await prisma.learner.create({
            data: {
              schoolId: school.id,
              branchId: branch.id,
              firstName: firstName,
              lastName: lastName,
              middleName: middleName,
              admissionNumber: admissionNumber,
              dateOfBirth: new Date('2015-01-01'),
              gender: 'MALE',
              grade: 'GRADE_4',
              status: 'ACTIVE',
              createdBy: teacher.id,
              admissionDate: new Date()
            }
          });

          console.log(`✅ Created new learner: ${learner.firstName} ${learner.lastName}`);
        } catch (createError) {
          console.error(`❌ Failed to create learner ${student.name}: ${createError.message}`);
          errorCount++;
          continue;
        }
      } else {
        learner = match.learner;
      }

      let studentSuccessCount = 0;

      // For each subject, create a SummativeResult record
      for (const [subjectCode, marks] of Object.entries(student.scores)) {
        try {
          const subjectName = subjectMap[subjectCode];
          const test = tests[subjectCode];
          const percentage = marks;
          const grade = getGrade(percentage);
          const status = marks >= 40 ? 'PASS' : 'FAIL';

          // Check if result already exists
          const existingResult = await prisma.summativeResult.findFirst({
            where: {
              testId: test.id,
              learnerId: learner.id
            }
          });

          if (existingResult) {
            // Update existing
            await prisma.summativeResult.update({
              where: { id: existingResult.id },
              data: {
                marksObtained: marks,
                percentage: percentage,
                grade: grade,
                status: status
              }
            });
          } else {
            // Create new
            await prisma.summativeResult.create({
              data: {
                testId: test.id,
                learnerId: learner.id,
                marksObtained: marks,
                percentage: percentage,
                grade: grade,
                status: status,
                recordedBy: teacher.id,
                schoolId: school.id
              }
            });
          }
          studentSuccessCount++;
        } catch (error) {
          console.error(`  ❌ Error for ${subjectName}: ${error.message}`);
        }
      }

      if (studentSuccessCount === 8) {
        results.push({
          name: learner.firstName + ' ' + learner.lastName,
          status: `✅ SEEDED (${studentSuccessCount}/8 subjects)`
        });
        successCount++;
      } else if (studentSuccessCount > 0) {
        results.push({
          name: learner.firstName + ' ' + learner.lastName,
          status: `⚠️ PARTIAL (${studentSuccessCount}/8 subjects)`
        });
      }
    }

    // Print results
    console.log('\n' + '─'.repeat(130));
    console.log('FINAL RESULTS:');
    console.log('─'.repeat(130));
    
    results.forEach(result => {
      console.log(`${result.status.padEnd(35)} ${result.name}`);
    });

    console.log('\n' + '═'.repeat(130));
    console.log(`✅ SUCCESSFUL: ${successCount}/${grade4SummativeData.length}`);
    console.log(`❌ FAILED: ${errorCount}/${grade4SummativeData.length}`);
    console.log('═'.repeat(130) + '\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedGrade4SummativeScores();
