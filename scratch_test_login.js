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
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));

  console.log('Navigating to root https://freewheeldashboard.netlify.app/ ...');
  await page.goto('https://freewheeldashboard.netlify.app/', { waitUntil: 'networkidle0' });

  console.log('Current URL after initial load:', page.url());
  console.log('Page Title:', await page.title());

  // Wait for the login form inputs to appear
  await page.waitForSelector('input', { timeout: 10000 });

  const inputs = await page.$$eval('input', els => els.map(e => ({
    type: e.type,
    name: e.name,
    placeholder: e.placeholder,
    id: e.id,
    formControlName: e.getAttribute('formcontrolname')
  })));
  console.log('Discovered inputs:', inputs);

  console.log('Entering credentials...');
  // Find email input and password input
  const textInputs = await page.$$('input[type="text"], input[type="email"]');
  if (textInputs.length > 0) {
    await textInputs[0].type('anandkarthiswar@gmail.com');
  }

  const passwordInputs = await page.$$('input[type="password"]');
  if (passwordInputs.length > 0) {
    await passwordInputs[0].type('Test@12345');
  }

  // Find buttons
  const buttons = await page.$$eval('button', els => els.map(b => b.innerText.trim()));
  console.log('Discovered buttons:', buttons);

  console.log('Submitting login...');
  const submitBtn = await page.$('button[type="submit"], button.p-button');
  if (submitBtn) {
    await submitBtn.click();
  }

  // Wait 5 seconds for network / navigation
  await new Promise(r => setTimeout(r, 5000));

  console.log('After login URL:', page.url());
  console.log('After login Title:', await page.title());

  const localStorageData = await page.evaluate(() => {
    return { ...localStorage };
  });
  console.log('LocalStorage keys:', Object.keys(localStorageData));
  if (localStorageData.Token) console.log('Token exists:', !!localStorageData.Token);
  if (localStorageData.user_role) console.log('user_role:', localStorageData.user_role);

  await page.screenshot({ path: '/tmp/dashboard_logged_in.png' });
  console.log('Screenshot saved to /tmp/dashboard_logged_in.png');

  await browser.close();
})();
