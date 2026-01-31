import prisma from '../src/config/database';

async function updateSmsApiKey() {
  try {
    const apiKey = 'UrkwuO5UfKfN6wuwwQPG3KkCfIvtgiWOa0EPcGb7R1r5JsVSxgEz4zR0fSdq';

    // Update all schools with the real API key
    const result = await prisma.communicationConfig.updateMany({
      data: {
        smsApiKey: apiKey,
        hasApiKey: true
      }
    });

    console.log(`✅ Updated ${result.count} schools with real MobileSasa API key`);

    // Verify the update
    const configs = await prisma.communicationConfig.findMany({
      select: {
        schoolId: true,
        school: { select: { name: true } },
        smsEnabled: true,
        smsProvider: true,
        hasApiKey: true
      }
    });

    console.log('\n📋 Updated SMS Configurations:');
    configs.forEach(c => {
      console.log(`  - ${c.school.name}: Enabled=${c.smsEnabled}, Provider=${c.smsProvider}, HasKey=${c.hasApiKey}`);
    });

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating API key:', error);
    process.exit(1);
  }
}

updateSmsApiKey();
