import path from 'path';
import dotenv from 'dotenv';
// Load server .env explicitly (fallback to root .env if present)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
import fs from 'fs';
import prisma from '../src/config/database';

async function main() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      status: true,
      schoolId: true,
      branchId: true,
      archived: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ role: 'asc' }, { lastName: 'asc' }, { firstName: 'asc' }],
  });

  const timestamp = new Date().toISOString();
  const header = [
    'id',
    'firstName',
    'lastName',
    'email',
    'phone',
    'role',
    'status',
    'schoolId',
    'branchId',
    'archived',
    'createdAt',
    'updatedAt',
  ];

  const lines = users.map(u =>
    [
      u.id,
      u.firstName ?? '',
      u.lastName ?? '',
      u.email ?? '',
      u.phone ?? '',
      u.role ?? '',
      u.status ?? '',
      u.schoolId ?? '',
      u.branchId ?? '',
      u.archived ? 'true' : 'false',
      u.createdAt?.toISOString() ?? '',
      u.updatedAt?.toISOString() ?? '',
    ].join('\t')
  );

  const content =
    `# USERS SNAPSHOT (PROTECTED)\n` +
    `# Generated at: ${timestamp}\n` +
    `# Columns: ${header.join(', ')}\n` +
    `# Do NOT delete this file during cleanup.\n\n` +
    `${header.join('\t')}\n` +
    `${lines.join('\n')}\n`;

  const rootPath = path.resolve(__dirname, '../../');
  const outPath = path.join(rootPath, 'USERS_SNAPSHOT__PROTECTED__.txt');
  fs.writeFileSync(outPath, content, 'utf8');

  console.log(`Exported ${users.length} users to ${outPath}`);
}

main()
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
