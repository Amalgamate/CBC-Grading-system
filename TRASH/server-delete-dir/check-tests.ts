
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkSummativeTests() {
  try {
    // 1. Find tests with potential issues (null creator or creator not in DB)
    const tests = await prisma.summativeTest.findMany({
      include: {
        creator: {
          select: { id: true, email: true, role: true }
        }
      }
    });

    console.log(`Found ${tests.length} total summative tests.`);
    console.log('--- TEST DETAILS ---');
    
    for (const test of tests) {
      console.log(`ID: ${test.id}`);
      console.log(`Name: ${test.title}`);
      console.log(`Creator ID in Test: ${test.createdBy}`);
      console.log(`Creator Object Found: ${test.creator ? 'YES' : 'NO'}`);
      if (test.creator) {
        console.log(`Creator: ${test.creator.email} (${test.creator.role})`);
      } else {
        // If creator object is missing, let's check if the ID exists in user table at all
        // (Prisma relation might be returning null if constraint failed or soft delete issues)
        const rawUser = await prisma.user.findUnique({
          where: { id: test.createdBy }
        });
        console.log(`Raw User Check (for ID ${test.createdBy}): ${rawUser ? 'EXISTS' : 'DOES NOT EXIST'}`);
      }
      console.log('---');
    }

    // 2. Find Super Admin
    const superAdmin = await prisma.user.findFirst({
      where: { role: 'SUPER_ADMIN' }
    });
    
    if (superAdmin) {
      console.log('--- SUPER ADMIN INFO ---');
      console.log(`ID: ${superAdmin.id}`);
      console.log(`Email: ${superAdmin.email}`);
    } else {
      console.log('⚠️ No SUPER_ADMIN found in database!');
    }

  } catch (error) {
    console.error('Error checking tests:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSummativeTests();
