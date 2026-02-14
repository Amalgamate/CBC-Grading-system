/**
 * Test script to verify SUPER_ADMIN school management endpoints
 * Run with: ts-node scripts/test-super-admin.ts
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5001/api';

// You need to replace this with an actual SUPER_ADMIN token
const SUPER_ADMIN_TOKEN = 'YOUR_SUPER_ADMIN_TOKEN_HERE';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Bearer ${SUPER_ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

async function testSchoolProvisioning() {
    console.log('\n🧪 Testing School Provisioning...\n');

    try {
        const response = await api.post('/admin/schools/provision', {
            schoolName: `Test School ${Date.now()}`,
            adminEmail: `admin${Date.now()}@test.com`,
            adminFirstName: 'Test',
            adminLastName: 'Admin',
            adminPhone: '+254712345678',
            address: '123 Test Road, Nairobi',
            county: 'Nairobi'
        });

        console.log('✅ School provisioned successfully!');
        console.log('School ID:', response.data.data.school.id);
        console.log('Admin Email:', response.data.data.adminUser.email);
        console.log('Subscription Status:', response.data.data.subscription.status);

        if (response.data.data.defaultBranch) {
            console.log('Default Branch:', response.data.data.defaultBranch.name);
        }

        return response.data.data.school.id;
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
        return null;
    }
}

async function testSchoolStatistics(schoolId: string) {
    console.log('\n🧪 Testing School Statistics...\n');

    try {
        const response = await api.get(`/admin/schools/${schoolId}/statistics`);

        console.log('✅ Statistics retrieved successfully!');
        console.log('School:', response.data.data.school.name);
        console.log('Learners:', response.data.data.counts.learners);
        console.log('Users:', response.data.data.counts.users);
        console.log('Branches:', response.data.data.counts.branches);

        if (response.data.data.subscription) {
            console.log('Subscription Plan:', response.data.data.subscription.plan);
            console.log('Days Remaining:', response.data.data.subscription.daysRemaining);
        }
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testSoftDelete(schoolId: string) {
    console.log('\n🧪 Testing Soft Delete...\n');

    try {
        const response = await api.delete(`/admin/schools/${schoolId}`, {
            data: {
                hardDelete: false,
                exportData: true,
                notifyUsers: false,
                reason: 'Testing soft delete'
            }
        });

        console.log('✅ School soft deleted successfully!');
        console.log('Message:', response.data.data.message);
        console.log('Export URL:', response.data.data.exportUrl);
        console.log('Users Affected:', response.data.data.stats.usersAffected);
        console.log('Learners Affected:', response.data.data.stats.learnersAffected);
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testListDeletedSchools() {
    console.log('\n🧪 Testing List Deleted Schools...\n');

    try {
        const response = await api.get('/admin/schools/deleted');

        console.log('✅ Deleted schools retrieved successfully!');
        console.log('Count:', response.data.count);

        if (response.data.data.length > 0) {
            console.log('First deleted school:', response.data.data[0].name);
        }
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testRestoreSchool(schoolId: string) {
    console.log('\n🧪 Testing School Restoration...\n');

    try {
        const response = await api.post(`/admin/schools/${schoolId}/restore`);

        console.log('✅ School restored successfully!');
        console.log('School:', response.data.data.name);
        console.log('Status:', response.data.data.status);
        console.log('Active:', response.data.data.active);
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function testHardDelete(schoolId: string) {
    console.log('\n🧪 Testing Hard Delete...\n');

    try {
        const response = await api.delete(`/admin/schools/${schoolId}`, {
            data: {
                hardDelete: true,
                exportData: true,
                notifyUsers: false,
                reason: 'Testing hard delete'
            }
        });

        console.log('✅ School hard deleted successfully!');
        console.log('Message:', response.data.data.message);
        console.log('Export URL:', response.data.data.exportUrl);
    } catch (error: any) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

async function runTests() {
    console.log('='.repeat(60));
    console.log('SUPER_ADMIN School Management Tests');
    console.log('='.repeat(60));

    if (SUPER_ADMIN_TOKEN === 'YOUR_SUPER_ADMIN_TOKEN_HERE') {
        console.error('\n❌ ERROR: Please set SUPER_ADMIN_TOKEN in the script first!');
        console.log('\nTo get a token:');
        console.log('1. Login as SUPER_ADMIN');
        console.log('2. Copy the JWT token from the response');
        console.log('3. Replace SUPER_ADMIN_TOKEN in this script');
        return;
    }

    // Test 1: Provision a new school
    const schoolId = await testSchoolProvisioning();

    if (!schoolId) {
        console.error('\n❌ School provisioning failed. Stopping tests.');
        return;
    }

    // Wait a bit for data to settle
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Get school statistics
    await testSchoolStatistics(schoolId);

    // Test 3: Soft delete the school
    await testSoftDelete(schoolId);

    // Test 4: List deleted schools
    await testListDeletedSchools();

    // Test 5: Restore the school
    await testRestoreSchool(schoolId);

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 6: Hard delete the school (cleanup)
    await testHardDelete(schoolId);

    console.log('\n' + '='.repeat(60));
    console.log('✅ All tests completed!');
    console.log('='.repeat(60));
    console.log('\nCheck server logs for:');
    console.log('- Temporary password (from provisioning)');
    console.log('- Export file locations');
    console.log('- Transaction logs');
}

// Run the tests
runTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
