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

async function testCRUD() {
  const loginRes = await request('POST', '/api/auth/login', {
    login: 'anandkarthiswar@gmail.com',
    password: 'Test@12345'
  });
  const token = loginRes.data?.accessToken;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  console.log('=== TEST CUSTOMER CREATION ===');
  const custRes = await request('POST', '/api/customers', {
    name: 'Liam Henderson Test',
    phoneNumber: '+15553014411',
    email: 'liam.henderson.test@alpinecycles.com',
    address: '42 Pine Crest Trail, Boulder, CO'
  }, authHeaders);
  console.log('Customer creation status:', custRes.statusCode);
  console.log('Customer creation response:', custRes.data);

  let newCustomerId = custRes.data?.id || custRes.data?.customerId;
  console.log('Created customer ID:', newCustomerId);

  console.log('=== TEST CYCLE CREATION ===');
  const cycleRes = await request('POST', '/api/cycles', {
    brand: 'Trek',
    model: 'Fuel EX 9.8 XT',
    type: 'Mountain',
    customerId: newCustomerId || '02e1e2fb-bd57-4173-a5d3-5679af0c519a',
    frameNumber: 'FRM-TEST-001',
    serialNumber: 'SN-TEST-89012'
  }, authHeaders);
  console.log('Cycle creation status:', cycleRes.statusCode);
  console.log('Cycle creation response:', cycleRes.data);

  let newCycleId = cycleRes.data?.id || cycleRes.data?.cycleId;
  console.log('Created cycle ID:', newCycleId);

  console.log('=== TEST TICKET CREATION ===');
  const ticketRes = await request('POST', '/api/tickets', {
    customerId: newCustomerId || '02e1e2fb-bd57-4173-a5d3-5679af0c519a',
    cycleId: newCycleId || '7aa7a5e1-44be-4391-a4e2-2c1e32bd088d',
    companyName: 'Freewheel Factory',
    statusId: '056cddda-c5fe-423d-82ef-8283b00ecaea', // New
    priorityId: '784579be-0083-44b5-820a-85de74fb0578', // Medium
    assigneeId: '07035851-d131-4cd9-970d-bae74b6779e2', // Anand
    contactPhone: '+15553014411',
    contactEmail: 'liam.henderson.test@alpinecycles.com',
    description: 'Complete Bicycle Tune-Up: 10-Point Safety Pass and Precision Gear Indexing.'
  }, authHeaders);
  console.log('Ticket creation status:', ticketRes.statusCode);
  console.log('Ticket creation response:', ticketRes.data);
}

testCRUD();
