import { generateStaffId } from './src/services/staffId.service';
import prisma from './src/config/database';

async function verifyStaffId() {
    console.log('--- Checking Staff ID Generation ---');

    // Find a school to test with
    const school = await prisma.school.findFirst();
    if (!school) {
        console.error('No school found in database to test with.');
        return;
    }

    console.log(`Testing with school: ${school.name} (${school.id})`);

    try {
        const id1 = await generateStaffId(school.id);
        console.log(`Generated ID 1: ${id1}`);

        const id2 = await generateStaffId(school.id);
        console.log(`Generated ID 2: ${id2}`);

        if (id1 === 'STF-0001' || id1.startsWith('STF-')) {
            console.log('✓ Success: Staff ID format is correct.');
        } else {
            console.error('✗ Failure: Staff ID format is incorrect.');
        }

        if (id2 !== id1) {
            console.log('✓ Success: Staff IDs are incremental.');
        } else {
            console.error('✗ Failure: Staff IDs are not incremental.');
        }

    } catch (error: any) {
        console.error('✗ Error during verification:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

verifyStaffId();
