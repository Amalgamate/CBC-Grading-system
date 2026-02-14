const https = require('https');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxYjgzMjg4NC01YzY2LTQ3NjYtYjIwNi00OTBlZDM1NTI3ZjYiLCJlbWFpbCI6ImFkbWluQGxvY2FsLnRlc3QiLCJyb2xlIjoiQURNSU4iLCJzY2hvb2xJZCI6IjcwOTFlZDMxLWQ0MDgtNDg5OC05ZGE4LTkxYzY5ZDcxNTViOSIsImJyYW5jaElkIjoiNDU1OGFjMjUtMDE5Zi00NzEyLTgwOTAtZTg1NzM2MGI1ODBjIiwiaWF0IjoxNzcwMDE4MDgzLCJleHAiOjE3NzAwMTg5ODN9.TnL0BoQ-leJaCURmBlSUYyxerKH7Y5uxJFE56S7IquA';

const options = {
  hostname: 'cbc-grading-system-production.up.railway.app',
  port: 443,
  path: '/api/learning-areas/seed/default',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Content-Length': 0
  }
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  
  let responseData = '';
  
  res.on('data', (chunk) => {
    responseData += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:');
    try {
      const parsed = JSON.parse(responseData);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(responseData);
    }
  });
});

req.on('error', (error) => {
  console.error('Error:', error.message);
});

req.end();
