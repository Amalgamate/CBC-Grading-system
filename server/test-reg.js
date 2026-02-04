
const axios = require('axios');

async function testRegistration() {
    try {
        const response = await axios.post('http://localhost:5000/api/onboarding/register-full', {
            fullName: 'Test Admin',
            email: 'test' + Math.random() + '@example.com',
            phone: '0712345678',
            schoolName: 'Test School ' + Math.random(),
            address: '123 Test St',
            county: 'Nairobi',
            password: 'Password123!',
            passwordConfirm: 'Password123!'
        });
        console.log('Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Data:', error.response.data);
        } else {
            console.log('Error:', error.message);
        }
    }
}

testRegistration();
