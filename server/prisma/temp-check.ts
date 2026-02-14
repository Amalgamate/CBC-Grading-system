
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    const l = await prisma.learner.findFirst({
        where: { archived: false, status: 'ACTIVE' },
        include: { parent: true }
    });
    console.log(JSON.stringify(l, null, 2));
    await prisma.$disconnect();
}
run();
