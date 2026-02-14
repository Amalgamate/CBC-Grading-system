const https = require('https');

const data = JSON.stringify({
  email: 'admin@local.test',
  password: 'password'
});

const options = {
  hostname: 'cbc-grading-system-production.up.railway.app',
  port: 443,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  let body = '';
  
  console.log(`\n📊 Status: ${res.statusCode}\n`);
  
  res.on('data', chunk => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      console.log('Response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ LOGIN SUCCESSFUL!\n');
      } else {
        console.log('\n❌ Login failed\n');
      }
    } catch (e) {
      console.log('Raw Response:', body);
    }
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

console.log('🧪 Testing login endpoint...\n');
req.write(data);
req.end();
