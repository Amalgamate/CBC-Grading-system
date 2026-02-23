import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  const superAdmins = await prisma.user.findMany({
    where: {
      role: 'SUPER_ADMIN'
    },
    include: {
      school: {
        select: {
          name: true
        }
      }
    }
  });

  const admins = await prisma.user.findMany({
    where: {
      role: 'ADMIN'
    },
    include: {
      school: {
        select: {
          name: true
        }
      }
    }
  });

  console.log('=== SUPER ADMINS ===\n');
  if (superAdmins.length === 0) {
    console.log('No SUPER_ADMIN found.\n');
  } else {
    superAdmins.forEach(u => {
      console.log(`${u.firstName} ${u.lastName} (${u.role})`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Phone: ${u.phone}`);
      console.log(`  School: ${u.school?.name || 'N/A'}`);
      console.log('');
    });
  }

  console.log('\n=== ADMINS ===\n');
  if (admins.length === 0) {
    console.log('No ADMIN found.\n');
  } else {
    admins.forEach(u => {
      console.log(`${u.firstName} ${u.lastName} (${u.role})`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Phone: ${u.phone}`);
      console.log(`  School: ${u.school?.name || 'N/A'}`);
      console.log('');
    });
  }

  console.log('\n=== HEAD TEACHERS ===\n');
  const headTeachers = await prisma.user.findMany({
    where: {
      role: 'HEAD_TEACHER'
    },
    include: {
      school: {
        select: {
          name: true
        }
      }
    }
  });
  
  if (headTeachers.length === 0) {
    console.log('No HEAD_TEACHER found.');
  } else {
    headTeachers.forEach(u => {
      console.log(`${u.firstName} ${u.lastName} (${u.role})`);
      console.log(`  Email: ${u.email}`);
      console.log(`  Phone: ${u.phone}`);
      console.log(`  School: ${u.school?.name || 'N/A'}`);
      console.log('');
    });
  }
  
  await prisma.$disconnect();
})();
