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

  await page.goto('https://freewheeldashboard.netlify.app/', { waitUntil: 'networkidle0' });

  // Type in username
  await page.waitForSelector('#username');
  await page.focus('#username');
  await page.type('#username', 'anandkarthiswar@gmail.com', { delay: 50 });

  // Type in password
  await page.waitForSelector('p-password input');
  await page.focus('p-password input');
  await page.type('p-password input', 'Test@12345', { delay: 50 });

  // Check the submit button state
  const btnDisabled = await page.$eval('button[type="submit"]', btn => btn.disabled);
  console.log('Is submit button disabled?', btnDisabled);

  // Click remember me checkbox
  await page.click('#remember');

  console.log('Clicking submit...');
  await page.click('button[type="submit"]');

  // Wait 4 seconds for API call to finish
  await new Promise(r => setTimeout(r, 4000));

  console.log('Current URL:', page.url());
  console.log('Title:', await page.title());

  const sessionStorageData = await page.evaluate(() => ({ ...sessionStorage }));
  console.log('SessionStorage keys:', Object.keys(sessionStorageData));
  if (sessionStorageData.Token) console.log('Token exists:', !!sessionStorageData.Token);
  if (sessionStorageData.user_role) console.log('user_role:', sessionStorageData.user_role);

  await page.screenshot({ path: '/tmp/dashboard_after_login.png' });
  console.log('Screenshot saved to /tmp/dashboard_after_login.png');

  await browser.close();
})();
