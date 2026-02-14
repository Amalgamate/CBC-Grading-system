/**
 * Seed Learning Areas Script
 * Creates default learning areas for all schools in the database
 */

import prisma from '../src/config/database';

async function seedLearningAreas() {
  try {
    console.log('🌱 Starting learning areas seeding...\n');

    // Get all active schools
    const schools = await prisma.school.findMany({
      where: { active: true },
      select: { id: true, name: true }
    });

    if (schools.length === 0) {
      console.log('⚠️  No active schools found to seed.');
      return;
    }

    console.log(`📚 Found ${schools.length} active school(s) to seed\n`);

    // Grade level mappings and default areas
    const gradeLevelMappings: { [key: string]: string[] } = {
      'Early Years': [
        'Literacy Activities', 'Mathematical Activities', 'English Language Activities',
        'Environmental Activities', 'Creative Arts Activities', 'Christian Religious Education',
        'Islamic Religious Education', 'Computer Studies Activities'
      ],
      'Pre-Primary': [
        'Literacy', 'English Language Activities', 'Mathematical Activities',
        'Environmental Activities', 'Creative Activities', 'Christian Religious Education',
        'Islamic Religious Education', 'Computer Studies (Interactive)', 'Kiswahili Lugha'
      ],
      'Lower Primary': [
        'Mathematics', 'English', 'Kiswahili', 'Environmental Studies',
        'Creative Activities', 'Religious Education', 'Information Communications Technology'
      ],
      'Upper Primary': [
        'English Language', 'Kiswahili Lugha', 'Mathematics', 'Science and Technology',
        'Social Studies', 'Agriculture', 'Creative Arts', 'Christian Religious Education',
        'Islamic Religious Education', 'Computer Studies', 'Coding and Robotics', 'French'
      ],
      'Junior School': [
        'English Language', 'Kiswahili Lugha', 'Mathematics', 'Integrated Science',
        'Social Studies', 'Pre-Technical Studies', 'Agriculture', 'Creative Arts and Sports',
        'Christian Religious Education', 'Islamic Religious Education', 'Computer Studies',
        'Coding and Robotics', 'French'
      ],
      'Senior School': [
        'Community Service Learning', 'Physical Education and Sports', 'ICT / Digital Literacy',
        'Life Skills Education', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography',
        'Literature in English'
      ]
    };

    const colors: { [key: string]: string } = {
      'Early Years': '#ec4899',
      'Pre-Primary': '#8b5cf6',
      'Lower Primary': '#3b82f6',
      'Upper Primary': '#10b981',
      'Junior School': '#f59e0b',
      'Senior School': '#f43f5e'
    };

    const icons: { [key: string]: string } = {
      'Early Years': '🧸',
      'Pre-Primary': '🎨',
      'Lower Primary': '📚',
      'Upper Primary': '🧪',
      'Junior School': '🧬',
      'Senior School': '🎓'
    };

    let totalCreated = 0;
    let totalSkipped = 0;

    // Seed for each school
    for (const school of schools) {
      let schoolCreated = 0;
      let schoolSkipped = 0;

      for (const [gradeLevel, areas] of Object.entries(gradeLevelMappings)) {
        for (const area of areas) {
          try {
            const existing = await prisma.learningArea.findFirst({
              where: {
                name: area,
                schoolId: school.id
              }
            });

            if (existing) {
              schoolSkipped++;
              totalSkipped++;
              continue;
            }

            // Specific short names for Lower Primary
            let shortName = area.split(' ')[0];
            if (gradeLevel === 'Lower Primary') {
              const mapping: { [key: string]: string } = {
                'Mathematics': 'Maths',
                'English': 'ENG',
                'Kiswahili': 'Kiswa',
                'Environmental Studies': 'ENV',
                'Creative Activities': 'CA',
                'Religious Education': 'RE',
                'Information Communications Technology': 'ICT'
              };
              shortName = mapping[area] || shortName;
            }

            await prisma.learningArea.create({
              data: {
                name: area,
                shortName,
                gradeLevel,
                icon: icons[gradeLevel] || '📚',
                color: colors[gradeLevel] || '#3b82f6',
                schoolId: school.id
              }
            });

            schoolCreated++;
            totalCreated++;
          } catch (error: any) {
            if (!error.message.includes('Unique constraint failed')) {
              console.error(`❌ Error creating area "${area}" for ${school.name}:`, error.message);
            }
            schoolSkipped++;
            totalSkipped++;
          }
        }
      }

      console.log(`✅ School: ${school.name}`);
      console.log(`   └─ Created: ${schoolCreated}, Skipped: ${schoolSkipped}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Learning areas seeding completed!');
    console.log(`   Total created: ${totalCreated}`);
    console.log(`   Total skipped: ${totalSkipped}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedLearningAreas();
