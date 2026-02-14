import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStream() {
  console.log('🔍 CHECKING STREAM CONFIGURATION\n');

  try {
    const school = await prisma.school.findFirst();
    if (!school) {
      console.log('❌ No school found!');
      return;
    }

    // Check stream configs
    const streams = await prisma.streamConfig.findMany({
      where: { schoolId: school.id }
    });

    console.log(`📚 Stream Configs for ${school.name}:`);
    console.log(`   Total: ${streams.length}`);

    if (streams.length === 0) {
      console.log('\n⚠️  NO STREAM CONFIGS FOUND - This may be causing issues!');
      console.log('   Need to recreate default streams...\n');

      const defaultStreams = ['A', 'B', 'C', 'D'];
      console.log(`Creating default streams for school: ${school.name}\n`);

      for (const streamName of defaultStreams) {
        const created = await prisma.streamConfig.create({
          data: {
            schoolId: school.id,
            name: streamName,
            active: true
          }
        });
        console.log(`✅ Created: ${created.name}`);
      }
    } else {
      streams.forEach(s => console.log(`   ✅ ${s.name} - Active: ${s.active}`));
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkStream();
