import { PrismaClient, FeeCategory } from '@prisma/client';

export async function seedFeeTypes(prisma: PrismaClient) {
    console.log('\n💰 Seeding default fee types...');
    const schools = await prisma.school.findMany({ where: { active: true } });

    if (schools.length === 0) {
        console.log('   ⚠️  No active schools found, skipping fee type seeding');
        return;
    }

    const defaultFeeTypes = [
        { code: 'TUITION', name: 'Tuition Fees', category: FeeCategory.ACADEMIC },
        { code: 'MEALS', name: 'Lunch Program', category: FeeCategory.BOARDING },
        { code: 'TRANSPORT', name: 'Transport Fees', category: FeeCategory.TRANSPORT },
        { code: 'ACTIVITY', name: 'Activity Fund', category: FeeCategory.EXTRA_CURRICULAR },
        { code: 'UNIFORM', name: 'Uniform', category: FeeCategory.ACADEMIC },
        { code: 'BOOKS', name: 'Textbooks & Materials', category: FeeCategory.ACADEMIC },
        { code: 'EXAM', name: 'Examination Fees', category: FeeCategory.ACADEMIC },
        { code: 'LATE_PAYMENT', name: 'Late Payment Penalty', category: FeeCategory.ADMINISTRATIVE },
        { code: 'ADMISSION', name: 'Admission Fees', category: FeeCategory.ADMINISTRATIVE },
    ];

    for (const school of schools) {
        console.log(`   📝 Creating fee types for ${school.name}...`);
        for (const type of defaultFeeTypes) {
            // Upsert logic
            await prisma.feeType.upsert({
                where: {
                    schoolId_code: {
                        schoolId: school.id,
                        code: type.code
                    }
                },
                update: {},
                create: {
                    schoolId: school.id,
                    code: type.code,
                    name: type.name,
                    category: type.category,
                    isActive: true
                }
            });
        }
    }
    console.log('   ✅ Fee types seeding completed.');
}
