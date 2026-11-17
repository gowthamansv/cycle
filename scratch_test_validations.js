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

async function testValidations() {
  const loginRes = await request('POST', '/api/auth/login', {
    login: 'anandkarthiswar@gmail.com',
    password: 'Test@12345'
  });
  const token = loginRes.data?.accessToken;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  console.log('=== TEST 1: Customer Missing Required Fields ===');
  const emptyCust = await request('POST', '/api/customers', {}, authHeaders);
  console.log('Status:', emptyCust.statusCode, 'Data:', JSON.stringify(emptyCust.data));

  console.log('\n=== TEST 2: Customer Invalid Email Format ===');
  const invalidEmailCust = await request('POST', '/api/customers', {
    name: 'Invalid Email User',
    phoneNumber: '1234567890',
    email: 'not-an-email'
  }, authHeaders);
  console.log('Status:', invalidEmailCust.statusCode, 'Data:', JSON.stringify(invalidEmailCust.data));

  console.log('\n=== TEST 3: Duplicate Customer Email ===');
  const dupCust = await request('POST', '/api/customers', {
    name: 'Liam Duplicate',
    phoneNumber: '+15553014411',
    email: 'liam.henderson.test@alpinecycles.com' // already created above
  }, authHeaders);
  console.log('Status:', dupCust.statusCode, 'Data:', JSON.stringify(dupCust.data));

  console.log('\n=== TEST 4: Cycle Missing Required Fields ===');
  const emptyCycle = await request('POST', '/api/cycles', {}, authHeaders);
  console.log('Status:', emptyCycle.statusCode, 'Data:', JSON.stringify(emptyCycle.data));

  console.log('\n=== TEST 5: Ticket Missing Required Fields ===');
  const emptyTicket = await request('POST', '/api/tickets', {}, authHeaders);
  console.log('Status:', emptyTicket.statusCode, 'Data:', JSON.stringify(emptyTicket.data));
}

testValidations();
