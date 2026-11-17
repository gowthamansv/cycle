const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Users/shyamsv/Desktop/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('request', req => console.log('REQ:', req.method(), req.url()));
  page.on('response', res => {
    if (res.url().includes('api') || res.status() >= 400) {
      console.log('RES:', res.status(), res.url());
    }
  });

  await page.goto('https://freewheeldashboard.netlify.app/', { waitUntil: 'networkidle0' });

  await page.waitForSelector('#username');
  await page.type('#username', 'anandkarthiswar@gmail.com');
  await page.type('p-password input', 'Test@12345');

  console.log('Submitting form...');
  await page.click('button[type="submit"]');

  await new Promise(r => setTimeout(r, 6000));

  const errorEl = await page.$('.glass-error-banner, .p-message-error');
  if (errorEl) {
    const errText = await page.evaluate(el => el.innerText, errorEl);
    console.log('VISIBLE ERROR BANNER:', errText);
  }

  console.log('Final URL:', page.url());

  await browser.close();
})();
