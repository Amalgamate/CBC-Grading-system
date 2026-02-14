
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@local.test';
const ADMIN_PASSWORD = 'Admin123!';

async function main() {
    try {
        console.log('🔄 1. Authenticating as Admin...');
        const authRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        const token = authRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('   ✅ Authenticated.');

        // --- Step 2: Find a Teacher ---
        console.log('\n🔄 2. Finding a Teacher to reset...');
        const usersRes = await axios.get(`${API_URL}/users/role/TEACHER`, { headers });
        const teacher = usersRes.data.data[0];

        if (!teacher) {
            console.error('      ❌ No teachers found to test with.');
            process.exit(1);
        }
        console.log(`   ✅ Found Teacher: ${teacher.firstName} ${teacher.lastName} (${teacher.id})`);

        // --- Step 3: Reset Password ---
        const newPassword = 'NewSecret' + Math.floor(Math.random() * 1000);
        console.log(`\n🔄 3. Resetting password to: ${newPassword}...`);

        // We expect WhatsApp/SMS to "fail" or "error" gracefully if not configured, but the reset should succeed.
        const resetRes = await axios.post(`${API_URL}/users/${teacher.id}/reset-password`, {
            newPassword,
            sendWhatsApp: true,
            sendSMS: true
        }, { headers });

        console.log(`   ✅ Reset Result: ${resetRes.data.message}`);
        if (resetRes.data.notifications.length > 0) {
            console.log('      Notifications:', resetRes.data.notifications);
        }

        // --- Step 4: Verify Login with New Password ---
        console.log('\n🔄 4. Verifying login with new password...');
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: teacher.email,
                password: newPassword
            });
            console.log(`   ✅ Login Successful! User: ${loginRes.data.user.email}`);
        } catch (error: any) {
            console.error('      ❌ Login Failed with new password!');
            throw error;
        }

        // --- Step 5: Verify Authorization (Admin cannot reset higher roles) ---
        // This is hard to test unless we have another admin, but we can try resetting the SAME admin (Self reset handled by canManageRole check)
        console.log('\n🔄 5. Testing Role Hierarchy (Admin cannot reset self)...');
        try {
            await axios.post(`${API_URL}/users/${authRes.data.user.id}/reset-password`, {
                newPassword: 'SomePassword123!'
            }, { headers });
            console.error('      ❌ Error: Admin was able to reset their own password (should be blocked by hierarchy)');
        } catch (error: any) {
            if (error.response?.status === 403) {
                console.log('      ✅ Correctly blocked self-reset (Hierarchy check works).');
            } else {
                console.error('      ❌ Unexpected response:', error.response?.status, error.response?.data);
            }
        }

    } catch (error: any) {
        if (error.response) {
            console.error('❌ Server Error:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('❌ Network Error (No response):', error.message);
        } else {
            console.error('❌ Script Error:', error.message);
        }
        process.exit(1);
    }
}

main();
