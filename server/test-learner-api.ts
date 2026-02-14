import axios from 'axios';

const TEST_LEARNER_ID = 'cf1ad46d-98ff-4a69-a958-f3cb0cfd8675';
const API_URL = 'http://localhost:5000/api/learners';

async function testLearnerAPI() {
  try {
    console.log(`\n🧪 Testing GET ${API_URL}/${TEST_LEARNER_ID}...\n`);
    
    const response = await axios.get(`${API_URL}/${TEST_LEARNER_ID}`);
    
    if (response.data.success) {
      const learner = response.data.data;
      console.log('✅ API Response - Contact Fields:');
      console.log('  ' + '='.repeat(50));
      console.log(`  learner.id:                    ${learner.id}`);
      console.log(`  learner.firstName:             ${learner.firstName}`);
      console.log(`  learner.lastName:              ${learner.lastName}`);
      console.log('  ' + '-'.repeat(50));
      console.log(`  learner.guardianName:          ${learner.guardianName}`);
      console.log(`  learner.guardianPhone:         ${learner.guardianPhone} ✓`);
      console.log(`  learner.fatherName:            ${learner.fatherName}`);
      console.log(`  learner.fatherPhone:           ${learner.fatherPhone}`);
      console.log(`  learner.motherName:            ${learner.motherName}`);
      console.log(`  learner.motherPhone:           ${learner.motherPhone}`);
      console.log(`  learner.primaryContactType:    ${learner.primaryContactType}`);
      console.log(`  learner.primaryContactName:    ${learner.primaryContactName}`);
      console.log(`  learner.primaryContactPhone:   ${learner.primaryContactPhone}`);
      console.log('  ' + '='.repeat(50));
      console.log(`\n✅ SUCCESS: API returns contact fields correctly\n`);
    } else {
      console.error('❌ API Error:', response.data.message);
    }
  } catch (error: any) {
    console.error('❌ Request Error:', error.message);
    if (error.response?.data) {
      console.error('Response:', error.response.data);
    }
  }
}

testLearnerAPI();
