import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting to seed summative assessment data...');

  const schoolId = 'default-school-e082e9a4';

  // Get a teacher user
  const teacher = await prisma.user.findFirst({
    where: { 
      role: 'TEACHER',
      schoolId: schoolId
    }
  });

  if (!teacher) {
    console.error('❌ No teacher found! Please create a teacher user first.');
    return;
  }

  console.log('✅ Found teacher:', teacher.email);

  // Get learners
  const learners = await prisma.learner.findMany({
    where: {
      schoolId: schoolId,
      status: 'ACTIVE',
      grade: 'PLAYGROUP'
    },
    take: 5
  });

  console.log(`✅ Found ${learners.length} learners`);

  // 1. Create Performance Scales (Grading Systems)
  console.log('\n📊 Creating Performance Scales...');

  // PLAYGROUP - MATHEMATICAL ACTIVITIES Scale
  const mathScale = await prisma.gradingSystem.create({
    data: {
      schoolId: schoolId,
      name: 'PLAYGROUP - MATHEMATICAL ACTIVITIES',
      type: 'SUMMATIVE',
      active: true,
      isDefault: false,
      ranges: {
        create: [
          {
            label: 'Level 4',
            minPercentage: 80,
            maxPercentage: 100,
            points: 4,
            color: '#10b981',
            description: '{{learner}} consistently and with high level of accuracy displays the knowledge, skills and attitudes/values in mathematical activities.',
            rubricRating: 'EE1'
          },
          {
            label: 'Level 3',
            minPercentage: 50,
            maxPercentage: 79,
            points: 3,
            color: '#3b82f6',
            description: '{{learner}} displays the knowledge, skills and attitudes/values in mathematical activities.',
            rubricRating: 'ME1'
          },
          {
            label: 'Level 2',
            minPercentage: 30,
            maxPercentage: 49,
            points: 2,
            color: '#f59e0b',
            description: '{{learner}} displays some knowledge, skills and attitudes/values in mathematical activities.',
            rubricRating: 'AE1'
          },
          {
            label: 'Level 1',
            minPercentage: 1,
            maxPercentage: 29,
            points: 1,
            color: '#ef4444',
            description: '{{learner}} attempts to display the knowledge, skills and attitudes in mathematical activities.',
            rubricRating: 'BE1'
          }
        ]
      }
    },
    include: { ranges: true }
  });

  console.log('✅ Created scale:', mathScale.name);

  // PLAYGROUP - ENGLISH LANGUAGE ACTIVITIES Scale
  const englishScale = await prisma.gradingSystem.create({
    data: {
      schoolId: schoolId,
      name: 'PLAYGROUP - ENGLISH LANGUAGE ACTIVITIES',
      type: 'SUMMATIVE',
      active: true,
      isDefault: false,
      ranges: {
        create: [
          {
            label: 'Level 4',
            minPercentage: 80,
            maxPercentage: 100,
            points: 4,
            color: '#10b981',
            description: '{{learner}} consistently and with high level of accuracy demonstrates proficiency in English language activities.',
            rubricRating: 'EE1'
          },
          {
            label: 'Level 3',
            minPercentage: 50,
            maxPercentage: 79,
            points: 3,
            color: '#3b82f6',
            description: '{{learner}} demonstrates good understanding of English language activities.',
            rubricRating: 'ME1'
          },
          {
            label: 'Level 2',
            minPercentage: 30,
            maxPercentage: 49,
            points: 2,
            color: '#f59e0b',
            description: '{{learner}} shows developing skills in English language activities.',
            rubricRating: 'AE1'
          },
          {
            label: 'Level 1',
            minPercentage: 1,
            maxPercentage: 29,
            points: 1,
            color: '#ef4444',
            description: '{{learner}} is beginning to engage with English language activities.',
            rubricRating: 'BE1'
          }
        ]
      }
    },
    include: { ranges: true }
  });

  console.log('✅ Created scale:', englishScale.name);

  // 2. Create Summative Tests
  console.log('\n📝 Creating Summative Tests...');

  const mathTest = await prisma.summativeTest.create({
    data: {
      title: 'End of Term 1 Mathematics',
      learningArea: 'MATHEMATICAL ACTIVITIES',
      term: 'TERM_1',
      academicYear: 2026,
      grade: 'PLAYGROUP',
      testDate: new Date('2026-04-15'),
      totalMarks: 100,
      passMarks: 50,
      duration: 60,
      description: 'End of term assessment for mathematical activities',
      instructions: 'Answer all questions in the spaces provided.',
      createdBy: teacher.id,
      published: true,
      status: 'PUBLISHED',
      curriculum: 'CBC_AND_EXAM',
      weight: 100.0
    }
  });

  console.log('✅ Created test:', mathTest.title);

  const englishTest = await prisma.summativeTest.create({
    data: {
      title: 'End of Term 1 English',
      learningArea: 'ENGLISH LANGUAGE ACTIVITIES',
      term: 'TERM_1',
      academicYear: 2026,
      grade: 'PLAYGROUP',
      testDate: new Date('2026-04-18'),
      totalMarks: 100,
      passMarks: 50,
      duration: 60,
      description: 'End of term assessment for English language',
      instructions: 'Complete all sections of the test.',
      createdBy: teacher.id,
      published: true,
      status: 'PUBLISHED',
      curriculum: 'CBC_AND_EXAM',
      weight: 100.0
    }
  });

  console.log('✅ Created test:', englishTest.title);

  // 3. Create Sample Results (optional - for demonstration)
  if (learners.length > 0) {
    console.log('\n📊 Creating Sample Results...');

    const sampleMarks = [85, 72, 65, 58, 45]; // Different performance levels

    for (let i = 0; i < Math.min(learners.length, sampleMarks.length); i++) {
      const learner = learners[i];
      const mark = sampleMarks[i];
      const percentage = mark;

      // Determine grade based on percentage
      let grade: any = 'E';
      if (percentage >= 80) grade = 'A';
      else if (percentage >= 60) grade = 'B';
      else if (percentage >= 50) grade = 'C';
      else if (percentage >= 40) grade = 'D';

      const result = await prisma.summativeResult.create({
        data: {
          testId: mathTest.id,
          learnerId: learner.id,
          marksObtained: mark,
          percentage: percentage,
          grade: grade,
          status: percentage >= mathTest.passMarks ? 'PASS' : 'FAIL',
          remarks: `Performance level based on ${percentage}%`,
          recordedBy: teacher.id
        }
      });

      console.log(`✅ Created result for ${learner.firstName} ${learner.lastName}: ${mark}/100 (${grade})`);
    }
  }

  console.log('\n✨ Seeding completed successfully!');
  console.log('\n📋 Summary:');
  console.log('- 2 Performance Scales created (Math & English)');
  console.log('- 2 Summative Tests created');
  console.log(`- ${Math.min(learners.length, 5)} Sample Results created`);
  console.log('\n🎉 You can now use the Summative Assessment page!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
