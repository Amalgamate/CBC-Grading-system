// Test API response
import axios from 'axios';

const TEST_LEARNER_ID = 'cf1ad46d-98ff-4a69-a958-f3cb0cfd8675';
const API_URL = 'http://localhost:5000';

async function testAPI() {
  try {
    console.log('🧪 Testing /learners/:id endpoint...\n');
    
    const response = await axios.get(`${API_URL}/api/learners/${TEST_LEARNER_ID}`, {
      headers: {
        'Authorization': `Bearer test_token_placeholder` // You'll need to update this
      }
    });

    const learner = response.data.data;
    console.log('✅ API Response received\n');
    console.log('Key fields:');
    console.log(`  - id: ${learner.id}`);
    console.log(`  - firstName: ${learner.firstName}`);
    console.log(`  - lastName: ${learner.lastName}`);
    console.log(`  - guardianName: ${learner.guardianName}`);
    console.log(`  - guardianPhone: ${learner.guardianPhone}`);
    console.log(`  - primaryContactPhone: ${learner.primaryContactPhone}`);
    console.log(`  - fatherPhone: ${learner.fatherPhone}`);
    console.log(`  - motherPhone: ${learner.motherPhone}`);
    console.log(`  - parent.phone: ${learner.parent?.phone}`);
    console.log(`\nAll fields in response:`);
    console.log(JSON.stringify(learner, null, 2));

  } catch (error: any) {
    console.error('❌ API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testAPI();
