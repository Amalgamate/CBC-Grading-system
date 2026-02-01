const https = require('https');

// Test the health endpoint first
const options = {
  hostname: 'cbc-grading-system-production.up.railway.app',
  port: 443,
  path: '/api/health',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let body = '';
  
  console.log(`\n📊 Health Check Status: ${res.statusCode}\n`);
  
  res.on('data', chunk => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      console.log('Health Response:', JSON.stringify(response, null, 2));
      
      if (res.statusCode === 200) {
        console.log('\n✅ SERVER IS HEALTHY!\n');
      } else {
        console.log('\n⚠️  Server returned status:', res.statusCode, '\n');
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

console.log('🧪 Testing health endpoint...\n');
req.end();
