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

async function run() {
  console.log('=== STEP 1: AUTHENTICATION ===');
  const loginRes = await request('POST', '/api/auth/login', {
    login: 'anandkarthiswar@gmail.com',
    password: 'Test@12345'
  });
  console.log('Login Status:', loginRes.statusCode);
  console.log('Login Response:', JSON.stringify(loginRes.data, null, 2));

  const token = loginRes.data?.accessToken;
  if (!token) {
    console.error('Failed to obtain accessToken');
    return;
  }

  const authHeaders = {
    'Authorization': `Bearer ${token}`
  };

  console.log('\n=== STEP 2: LOOKUPS & MISC ===');
  const endpoints = [
    ['GET', '/api/misc/roles'],
    ['GET', '/api/misc/statuses'],
    ['GET', '/api/misc/priorities'],
    ['GET', '/api/misc/groups'],
    ['GET', '/api/misc/users'],
    ['GET', '/api/misc/customers'],
    ['GET', '/api/tickets'],
    ['GET', '/api/tickets/assigned'],
    ['GET', '/api/customers'],
    ['GET', '/api/cycles'],
    ['GET', '/api/users'],
    ['GET', '/api/demo-requests']
  ];

  for (const [m, p] of endpoints) {
    try {
      const res = await request(m, p, null, authHeaders);
      const isArr = Array.isArray(res.data);
      const count = isArr ? res.data.length : (typeof res.data === 'object' ? Object.keys(res.data).length : 'N/A');
      console.log(`${m} ${p} -> Status: ${res.statusCode} | Count: ${count}`);
      if (res.statusCode === 200 && isArr && res.data.length > 0) {
        console.log(`   Sample item:`, JSON.stringify(res.data[0]));
      } else if (res.statusCode !== 200) {
        console.log(`   Error:`, JSON.stringify(res.data));
      }
    } catch (e) {
      console.log(`${m} ${p} -> Exception: ${e.message}`);
    }
  }
}

run();
