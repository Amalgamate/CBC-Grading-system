import axios from 'axios';

// Get auth token for admin user
const testSeed = async () => {
  try {
    console.log('🧪 Testing Fee Types Seed Endpoint\n');

    // 1. Login as admin user
    console.log('1️⃣ Logging in as admin@local.test...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@local.test',
      password: 'Admin123!'
    });

    if (!loginRes.data.token) {
      console.log('❌ Login failed - no token received');
      process.exit(1);
    }

    const token = loginRes.data.token;
    console.log('✅ Login successful\n');

    // 2. Call the seed endpoint
    console.log('2️⃣ Calling seed fee types endpoint...');
    const seedRes = await axios.post(
      'http://localhost:5000/api/fees/types/seed/defaults',
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Request successful!\n');
    console.log('Response:');
    console.log(`  Message: ${seedRes.data.message}`);
    console.log(`  Created: ${seedRes.data.created}`);
    console.log(`  Skipped: ${seedRes.data.skipped}`);
    console.log(`  Total Default Types: ${seedRes.data.total}`);

    if (seedRes.data.feeTypes && seedRes.data.feeTypes.length > 0) {
      console.log('\n  Newly Created Types:');
      seedRes.data.feeTypes.forEach((t: any) => {
        console.log(`    - ${t.code}: ${t.name}`);
      });
    }

    console.log('\n✅ Seed endpoint is working correctly!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    process.exit(1);
  }
};

testSeed();
