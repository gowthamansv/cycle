const https = require('https');

const BASE_URL = 'https://c-api-7x7e.onrender.com';

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let parsed = data;
        try {
          parsed = JSON.parse(data);
        } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: parsed
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function testUser() {
  const loginRes = await request('POST', '/api/auth/login', {
    login: 'anandkarthiswar@gmail.com',
    password: 'Test@12345'
  });
  const token = loginRes.data?.accessToken;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  console.log('Testing User Creation with non-admin role...');
  // Employee role: 7bee4dde-af8f-4469-b039-dd75f5bb05c9
  // Service Team group: 201a3148-210c-40e9-90e8-c81c6c5af277
  const userPayload = {
    firstName: 'Gowthaman',
    lastName: 'SV',
    email: 'gowthaman2002sv@gmail.com',
    phoneNumber: '6374202426',
    password: 'Password@12345',
    roleIds: ['7bee4dde-af8f-4469-b039-dd75f5bb05c9'],
    groupIds: ['201a3148-210c-40e9-90e8-c81c6c5af277']
  };

  const res = await request('POST', '/api/users', userPayload, authHeaders);
  console.log('Create User Status:', res.statusCode);
  console.log('Create User Response:', JSON.stringify(res.data, null, 2));

  // Check misc users list
  const usersRes = await request('GET', '/api/misc/users', null, authHeaders);
  console.log('Updated Users List:', JSON.stringify(usersRes.data, null, 2));
}

testUser();
