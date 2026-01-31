import prisma from '../src/config/database';

async function setupSmsConfig() {
  try {
    // Get all schools
    const schools = await prisma.school.findMany({
      select: { id: true, name: true }
    });

    console.log(`Found ${schools.length} schools:`);
    schools.forEach(s => console.log(`  - ${s.name} (${s.id})`));

    // Create or update SMS config for each school for testing
    for (const school of schools) {
      const existing = await prisma.communicationConfig.findUnique({
        where: { schoolId: school.id }
      });

      if (!existing) {
        await prisma.communicationConfig.create({
          data: {
            schoolId: school.id,
            smsEnabled: true,
            smsProvider: 'mobilesasa',
            smsApiKey: 'test-key-dev', // Dummy key for development
            hasApiKey: true,
            smsSenderId: 'ZAWADI'
          }
        });
        console.log(`✅ Created SMS config for: ${school.name}`);
      } else {
        // Update to enable SMS
        await prisma.communicationConfig.update({
          where: { schoolId: school.id },
          data: {
            smsEnabled: true,
            smsProvider: 'mobilesasa',
            smsApiKey: existing.smsApiKey || 'test-key-dev',
            hasApiKey: true,
            smsSenderId: existing.smsSenderId || 'ZAWADI'
          }
        });
        console.log(`✅ Updated SMS config for: ${school.name}`);
      }
    }

    console.log('✅ SMS configuration setup complete');
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

setupSmsConfig();
