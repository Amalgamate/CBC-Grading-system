const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Grade 5 Summative Scores - 32 students with corrected scores
const grade5SummativeData = [
  { name: "Seraphine Kawera", scores: { ENG: 77, MAT: 96, KISWA: 86, AGRI: 72, SST: 83, SCI: 84, CA: 72, RE: 93 } },
  { name: "Rayan Abdi", scores: { ENG: 70, MAT: 88, KISWA: 82, AGRI: 88, SST: 80, SCI: 88, CA: 84, RE: 80 } },
  { name: "Habiba Said", scores: { ENG: 80, MAT: 84, KISWA: 82, AGRI: 84, SST: 80, SCI: 88, CA: 68, RE: 93 } },
  { name: "Ridhwan Adeni", scores: { ENG: 73, MAT: 78, KISWA: 86, AGRI: 76, SST: 77, SCI: 76, CA: 84, RE: 87 } },
  { name: "Ruweidha Dahir", scores: { ENG: 77, MAT: 70, KISWA: 82, AGRI: 88, SST: 73, SCI: 68, CA: 80, RE: 93 } },
  { name: "Abdirizack Ibrahim", scores: { ENG: 90, MAT: 72, KISWA: 78, AGRI: 84, SST: 83, SCI: 64, CA: 60, RE: 87 } },
  { name: "Shulehe Ibrahim", scores: { ENG: 60, MAT: 68, KISWA: 82, AGRI: 72, SST: 80, SCI: 80, CA: 72, RE: 80 } },
  { name: "Muud ABDI", scores: { ENG: 60, MAT: 60, KISWA: 74, AGRI: 88, SST: 73, SCI: 52, CA: 76, RE: 100 } },
  { name: "Mutolih Dahiry", scores: { ENG: 70, MAT: 68, KISWA: 68, AGRI: 84, SST: 70, SCI: 60, CA: 80, RE: 80 } },
  { name: "Farhiya Mohamed", scores: { ENG: 67, MAT: 84, KISWA: 68, AGRI: 60, SST: 70, SCI: 68, CA: 76, RE: 87 } },
  { name: "Hamun Mohamed", scores: { ENG: 67, MAT: 72, KISWA: 70, AGRI: 80, SST: 67, SCI: 72, CA: 60, RE: 87 } },
  { name: "Somiya Shukri", scores: { ENG: 57, MAT: 86, KISWA: 54, AGRI: 60, SST: 70, SCI: 76, CA: 96, RE: 73 } },
  { name: "Ruweidhe Mohamed", scores: { ENG: 67, MAT: 66, KISWA: 72, AGRI: 76, SST: 60, SCI: 76, CA: 68, RE: 73 } },
  { name: "Abdula Abdi", scores: { ENG: 70, MAT: 58, KISWA: 60, AGRI: 84, SST: 63, SCI: 60, CA: 76, RE: 87 } },
  { name: "Ilrah Hussein", scores: { ENG: 73, MAT: 72, KISWA: 64, AGRI: 56, SST: 67, SCI: 64, CA: 80, RE: 80 } },
  { name: "Shureyim Mustafa", scores: { ENG: 63, MAT: 74, KISWA: 74, AGRI: 72, SST: 66, SCI: 60, CA: 60, RE: 87 } },
  { name: "Uthman Hassan", scores: { ENG: 63, MAT: 56, KISWA: 62, AGRI: 80, SST: 87, SCI: 64, CA: 52, RE: 87 } },
  { name: "Yasmin Ribog", scores: { ENG: 73, MAT: 68, KISWA: 70, AGRI: 68, SST: 57, SCI: 64, CA: 64, RE: 67 } },
  { name: "Rayann Adams", scores: { ENG: 63, MAT: 74, KISWA: 56, AGRI: 56, SST: 63, SCI: 68, CA: 52, RE: 80 } },
  { name: "Tunis Nassir", scores: { ENG: 37, MAT: 72, KISWA: 62, AGRI: 64, SST: 83, SCI: 56, CA: 60, RE: 73 } },
  { name: "Siuella Bushiry", scores: { ENG: 53, MAT: 60, KISWA: 60, AGRI: 80, SST: 72, SCI: 52, CA: 48, RE: 73 } },
  { name: "Najma Abdullahi", scores: { ENG: 63, MAT: 56, KISWA: 56, AGRI: 60, SST: 63, SCI: 56, CA: 52, RE: 87 } },
  { name: "Jally Kahya", scores: { ENG: 53, MAT: 50, KISWA: 76, AGRI: 76, SST: 57, SCI: 48, CA: 44, RE: 67 } },
  { name: "Anab Hussein", scores: { ENG: 53, MAT: 54, KISWA: 64, AGRI: 48, SST: 73, SCI: 36, CA: 60, RE: 80 } },
  { name: "Abuhubeida Issack", scores: { ENG: 53, MAT: 56, KISWA: 60, AGRI: 56, SST: 47, SCI: 24, CA: 68, RE: 87 } },
  { name: "Bilal Koba", scores: { ENG: 53, MAT: 50, KISWA: 52, AGRI: 72, SST: 60, SCI: 36, CA: 52, RE: 73 } },
  { name: "Mohamed Farah", scores: { ENG: 53, MAT: 46, KISWA: 42, AGRI: 68, SST: 47, SCI: 52, CA: 60, RE: 53 } },
  { name: "Suleiman Barre", scores: { ENG: 53, MAT: 46, KISWA: 42, AGRI: 68, SST: 47, SCI: 52, CA: 60, RE: 53 } },
  { name: "Saima Abdi", scores: { ENG: 23, MAT: 52, KISWA: 72, AGRI: 72, SST: 53, SCI: 44, CA: 40, RE: 47 } },
  { name: "Hudheifa Shaban", scores: { ENG: 27, MAT: 46, KISWA: 26, AGRI: 68, SST: 63, SCI: 56, CA: 40, RE: 43 } },
  { name: "Abdijabar Ali", scores: { ENG: 57, MAT: 10, KISWA: 46, AGRI: 80, SST: 37, SCI: 48, CA: 48, RE: 67 } },
  { name: "Amina Guyo", scores: { ENG: 37, MAT: 24, KISWA: 46, AGRI: 28, SST: 50, SCI: 20, CA: 60, RE: 33 } }
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

async function seedGrade5SummativeScores() {
  try {
    console.log('\n' + '═'.repeat(130));
    console.log('🌱 SEEDING GRADE 5 SUMMATIVE SCORES - 32 STUDENTS (CORRECTED DATA)');
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

    // Get all grade 5 learners
    const grade5Learners = await prisma.learner.findMany({
      where: {
        schoolId: school.id,
        grade: 'GRADE_5'
      }
    });

    console.log(`📚 School: ${school.name}`);
    console.log(`👨‍🏫 Teacher: ${teacher.firstName} ${teacher.lastName}`);
    console.log(`📊 Database has ${grade5Learners.length} Grade 5 students`);
    console.log(`📝 Ready to seed ${grade5SummativeData.length} student scores for 8 subjects\n`);

    const testDate = new Date('2026-01-20'); // Fixed test date
    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Create or get summative tests for each subject
    const tests = {};
    console.log('📋 Creating/fetching summative tests for each subject...\n');

    for (const [subjectCode, subjectName] of Object.entries(subjectMap)) {
      // Check if test exists
      let test = await prisma.summativeTest.findFirst({
        where: {
          schoolId: school.id,
          learningArea: subjectName,
          grade: 'GRADE_5',
          term: 'TERM_1'
        }
      });

      if (!test) {
        // Create new test
        test = await prisma.summativeTest.create({
          data: {
            title: `Grade 5 - ${subjectName} Term 1 Test`,
            learningArea: subjectName,
            grade: 'GRADE_5',
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
    for (const student of grade5SummativeData) {
      let learner = null;
      const match = findBestMatch(student.name, grade5Learners);
      
      if (!match) {
        // Create new learner if not found
        try {
          const nameParts = student.name.trim().split(/\s+/);
          const firstName = nameParts[0];
          const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'Unknown';
          const middleName = nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : undefined;
          
          // Get the main branch for the school
          const branch = await prisma.branch.findFirst({
            where: { schoolId: school.id }
          });

          if (!branch) {
            console.error(`❌ No branch found for school ${school.name}`);
            errorCount++;
            continue;
          }

          // Generate unique admission number
          const admissionNumber = `GR5-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

          // Create the learner
          learner = await prisma.learner.create({
            data: {
              schoolId: school.id,
              branchId: branch.id,
              firstName: firstName,
              lastName: lastName,
              middleName: middleName,
              admissionNumber: admissionNumber,
              dateOfBirth: new Date('2014-01-01'), // Default DOB for Grade 5
              gender: 'MALE', // Default gender
              grade: 'GRADE_5',
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
          const percentage = marks; // Assuming the scores are already percentages 0-100
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
    console.log(`✅ SUCCESSFUL: ${successCount}/${grade5SummativeData.length}`);
    console.log(`❌ FAILED: ${errorCount}/${grade5SummativeData.length}`);
    console.log('═'.repeat(130) + '\n');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedGrade5SummativeScores();
