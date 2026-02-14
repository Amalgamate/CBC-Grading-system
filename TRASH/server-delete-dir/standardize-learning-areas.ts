
import { PrismaClient, Grade } from '@prisma/client';

const prisma = new PrismaClient();

async function deepClean() {
    console.log('🧹 Starting Deep Clean CBC Learning Area Standardization...');

    // 1. Definition helper for grade types
    const isPrePrimary = (g: any) => ['PP1', 'PP2', 'PLAYGROUP', 'CRECHE', 'RECEPTION'].includes(String(g));
    const isLowerPrimary = (g: any) => ['GRADE_1', 'GRADE_2', 'GRADE_3'].includes(String(g));
    const isUpperPrimary = (g: any) => ['GRADE_4', 'GRADE_5', 'GRADE_6'].includes(String(g));
    const isJuniorSchool = (g: any) => ['GRADE_7', 'GRADE_8', 'GRADE_9'].includes(String(g));
    const isSeniorSchool = (g: any) => ['GRADE_10', 'GRADE_11', 'GRADE_12'].includes(String(g));

    const getStandardName = (oldArea: string, grade: any): string => {
        const area = oldArea.trim().toUpperCase();
        const gStr = String(grade);

        // -- Mathematics --
        if (area.includes('MATH') || area.includes('ABACUS')) {
            if (isPrePrimary(grade) || isLowerPrimary(grade)) return 'Mathematical Activities';
            return 'Mathematics';
        }

        // -- English / Literacy --
        if (area.includes('ENGLISH') || area.includes('LANGUAGE ACTIVITIES') || area.includes('LITERACY') || area.includes('READING')) {
            if (isPrePrimary(grade)) return 'Language Activities';
            if (isLowerPrimary(grade)) {
                if (area.includes('LITERACY') || area.includes('READING')) return 'Literacy';
                return 'English Language Activities';
            }
            return 'English';
        }

        // -- Kiswahili --
        if (area.includes('KISWAHILI') || area.includes('LUGHA') || area.includes('INSHA')) {
            if (isPrePrimary(grade) || isLowerPrimary(grade)) return 'Kiswahili Language Activities';
            return 'Kiswahili';
        }

        // -- Environmental / Science --
        if (area.includes('ENVIRON') || area.includes('SCIENCE') || area.includes('HYGIENE') || area.includes('NUTRITION') || area.includes('AGRICULTURE')) {
            if (isPrePrimary(grade) || isLowerPrimary(grade)) return 'Environmental Activities';
            if (isUpperPrimary(grade)) {
                if (area.includes('AGRICULTURE') || area.includes('NUTRITION')) return 'Agriculture and Nutrition';
                return 'Science and Technology';
            }
            if (isJuniorSchool(grade)) {
                if (area.includes('AGRICULTURE')) return 'Agriculture';
                if (area.includes('HEALTH')) return 'Health Education';
                return 'Integrated Science';
            }
            return area;
        }

        // -- Creative / Physical / Music / Art --
        if (area.includes('CREATIVE') || area.includes('ART') || area.includes('CRAFT') || area.includes('MUSIC') || area.includes('PHYSICAL') || area.includes('SPORTS') || area.includes('MOVEMENT')) {
            if (isPrePrimary(grade)) return 'Creative Activities';
            if (isLowerPrimary(grade)) return 'Movement and Creative Activities';
            if (isUpperPrimary(grade)) {
                if (area.includes('PHYSICAL') || area.includes('HEALTH')) return 'Physical and Health Education';
                return 'Creative Arts';
            }
            if (isJuniorSchool(grade)) {
                if (area.includes('SPORTS') || area.includes('PHYSICAL')) return 'Sports and Physical Education';
                return 'Creative Arts and Sports'; // Actually CBC G7-9 uses specific ones, but let's stick to seed list
            }
            return 'Creative Arts';
        }

        // -- Religious Education --
        if (area.includes('RELIGIOUS') || area.includes('CRE') || area.includes('IRE') || area.includes('HRE') || area.includes('RE')) {
            return 'Religious Education';
        }

        // -- Social Studies --
        if (area.includes('SOCIAL') || area.includes('GOVERNMENT') || area.includes('HISTORY') || area.includes('GEOGRAPHY')) {
            return 'Social Studies';
        }

        return oldArea; // Fallback
    };

    const tests = await prisma.summativeTest.findMany();
    console.log(`\n🔄 Deep Cleaning ${tests.length} tests...`);

    for (const test of tests) {
        const newName = getStandardName(test.learningArea, test.grade);

        if (newName !== test.learningArea) {
            console.log(`   - Mapping: "${test.learningArea}" (${test.grade}) -> "${newName}"`);
            await prisma.summativeTest.update({
                where: { id: test.id },
                data: { learningArea: newName }
            });

            // Update results
            await prisma.summativeResult.updateMany({
                where: { testId: test.id },
                data: {
                    // No learningArea field in SummativeResult, but testing this logic
                } as any
            });
        }
    }

    console.log('\n🏁 Deep Clean Standardization Complete!');
}

deepClean()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
