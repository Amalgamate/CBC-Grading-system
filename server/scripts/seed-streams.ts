import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const school = await prisma.school.findFirst({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
  });

  if (!school) {
    throw new Error('No active school found');
  }

  const existing = await prisma.streamConfig.findFirst({
    where: { schoolId: school.id, name: { equals: 'A', mode: 'insensitive' } },
  });

  if (existing) {
    console.log(`Stream "A" already exists for school ${school.name} (${school.id})`);
  } else {
    const stream = await prisma.streamConfig.create({
      data: {
        schoolId: school.id,
        name: 'A',
        active: true,
      },
    });
    console.log(`Seeded stream: ${stream.name} (${stream.id}) for school ${school.name}`);
  }

  const streams = await prisma.streamConfig.findMany({
    where: { schoolId: school.id },
    orderBy: { name: 'asc' },
  });
  console.log(`Streams count for ${school.name}:`, streams.length);
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
