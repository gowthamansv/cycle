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
  const loginRes = await request('POST', '/api/auth/login', {
    login: 'anandkarthiswar@gmail.com',
    password: 'Test@12345'
  });
  const token = loginRes.data?.accessToken;
  const authHeaders = { 'Authorization': `Bearer ${token}` };

  console.log('=== ROLES ===');
  const roles = await request('GET', '/api/misc/roles', null, authHeaders);
  console.log(JSON.stringify(roles.data, null, 2));

  console.log('=== STATUSES ===');
  const statuses = await request('GET', '/api/misc/statuses', null, authHeaders);
  console.log(JSON.stringify(statuses.data, null, 2));

  console.log('=== PRIORITIES ===');
  const priorities = await request('GET', '/api/misc/priorities', null, authHeaders);
  console.log(JSON.stringify(priorities.data, null, 2));

  console.log('=== GROUPS ===');
  const groups = await request('GET', '/api/misc/groups', null, authHeaders);
  console.log(JSON.stringify(groups.data, null, 2));

  console.log('=== USERS ===');
  const users = await request('GET', '/api/misc/users', null, authHeaders);
  console.log(JSON.stringify(users.data, null, 2));

  console.log('=== CUSTOMERS ===');
  const customers = await request('GET', '/api/misc/customers', null, authHeaders);
  console.log(JSON.stringify(customers.data, null, 2));

  console.log('=== TICKETS ===');
  const tickets = await request('GET', '/api/tickets', null, authHeaders);
  console.log(JSON.stringify(tickets.data, null, 2));
}

run();
