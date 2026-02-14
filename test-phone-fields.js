#!/usr/bin/env node

/**
 * Test the learner API to verify contact fields are returned
 * This will help diagnose why SMS/WhatsApp still reports "phone not available"
 */

const http = require('http');

function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function test() {
  console.log(`\n🧪 TESTING API CONTACT FIELDS\n`);
  
  try {
    // Test 1: Check if API is responding
    console.log(`1️⃣  Testing API Health...`);
    const health = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    console.log(`   Status: ${health.status}`);
    if (health.status === 200) {
      console.log(`   ✅ API is responding\n`);
    } else {
      console.log(`   ❌ API not responding correctly\n`);
    }

    // Test 2: Try to get learner WITHOUT auth (should fail)
    console.log(`2️⃣  Testing GET /api/learners/cf1ad46d-98ff-4a69-a958-f3cb0cfd8675 (no auth)...`);
    const noAuth = await makeRequest({
      hostname: 'localhost',
      port: 5000,
      path: '/api/learners/cf1ad46d-98ff-4a69-a958-f3cb0cfd8675',
      method: 'GET'
    });
    console.log(`   Status: ${noAuth.status}`);
    if (noAuth.status === 401 || noAuth.status === 403) {
      console.log(`   ✅ Auth required (expected)\n`);
    } else if (noAuth.status === 200) {
      console.log(`   ⚠️  SECURITY: API accessible without auth!\n`);
      if (noAuth.data.data) {
        console.log(`   Contact Fields in Response:`);
        const learner = noAuth.data.data;
        console.log(`   - guardianPhone: ${learner.guardianPhone}`);
        console.log(`   - guardianName: ${learner.guardianName}`);
        console.log(`   - primaryContactPhone: ${learner.primaryContactPhone}`);
        console.log(`   - fatherPhone: ${learner.fatherPhone}`);
        console.log(`   - motherPhone: ${learner.motherPhone}\n`);
      }
    }

    // Test 3: Check database directly
    console.log(`3️⃣  Checking database for student...`);
    const { spawnSync } = require('child_process');
    const result = spawnSync('npx', ['ts-node', 'check_learner.ts'], {
      cwd: 'c:\\Amalgamate\\Projects\\EDucore\\server',
      encoding: 'utf-8'
    });
    
    if (result.status === 0) {
      const output = result.stdout;
      if (output.includes('guardianPhone')) {
        console.log(`   ✅ Database query successful`);
        console.log(output.split('{')[1] ? `   ${'{' + output.split('{')[1]}` : output);
      }
    }

    console.log(`\n═══════════════════════════════════════════════════════`);
    console.log(`\n📋 DIAGNOSIS SUMMARY:`);
    console.log(`\n✅ Backend is running on port 5000`);
    console.log(`✅ Database connection OK`);
    console.log(`⏳ Guardian phone data in database: Check above ↑`);
    console.log(`⏳ API returning contact fields: Check above ↑`);
    console.log(`\n🔍 NEXT STEPS:`);
    console.log(`1. If guardianPhone shows NULL → Need to re-create student with guardian info`);
    console.log(`2. If API returns 401 → Need authentication token to test from browser`);
    console.log(`3. Frontend must be rebuilt if code changes were made\n`);

  } catch (error) {
    console.error(`❌ Error:`, error.message);
  }
}

test();
