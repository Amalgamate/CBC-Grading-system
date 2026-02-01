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
  
  res.on('data', chunk => {
    body += chunk;
  });
  
  res.on('end', () => {
    console.log(`\n📊 Response Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
    console.log(`Body: ${body}\n`);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});

console.log('🧪 Detailed login test...\n');
req.write(data);
req.end();
