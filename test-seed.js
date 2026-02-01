const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/learning-areas/seed/default',
  method: 'POST',
  headers: {
    'Authorization': 'Bearer test',
    'Content-Type': 'application/json',
    'X-School-Id': 'test-school'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    process.exit(0);
  });
});

req.on('error', (err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

req.write(JSON.stringify({}));
req.end();
