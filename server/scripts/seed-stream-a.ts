/**
 * Seed Script: Create Stream A for all branches
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedStreams() {
  try {
    console.log('🌱 Seeding Stream A for all branches...\n');

    // Get all branches
    const branches = await prisma.branch.findMany({
      where: { archived: false }
    });

    console.log(`Found ${branches.length} active branches`);

    let created = 0;
    let skipped = 0;

    for (const branch of branches) {
      try {
        // Create Stream A if it doesn't exist
        const stream = await prisma.stream.upsert({
          where: {
            branchId_name: {
              branchId: branch.id,
              name: 'A'
            }
          },
          update: {
            active: true,
            archived: false
          },
          create: {
            branchId: branch.id,
            name: 'A',
            active: true
          }
        });

        if (stream) {
          created++;
          console.log(`  ✅ Stream A created/updated for ${branch.name}`);
        }
      } catch (error: any) {
        console.log(`  ⚠️ ${branch.name} - Stream A already exists (skipped)`);
        skipped++;
      }
    }

    console.log('\n✨ Stream seeding complete!');
    console.log(`📊 Summary:`);
    console.log(`   - Streams created/updated: ${created}`);
    console.log(`   - Streams skipped: ${skipped}`);

  } catch (error: any) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedStreams();
