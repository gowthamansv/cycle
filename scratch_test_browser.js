const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: '/Users/shyamsv/Desktop/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to https://freewheeldashboard.netlify.app/ ...');
  await page.goto('https://freewheeldashboard.netlify.app/', { waitUntil: 'networkidle0' });

  console.log('Page title:', await page.title());
  console.log('Current URL:', page.url());

  const content = await page.evaluate(() => document.body.innerText.substring(0, 300));
  console.log('Page snippet:\n', content);

  await page.screenshot({ path: '/tmp/initial_page.png' });
  console.log('Saved screenshot to /tmp/initial_page.png');

  await browser.close();
})();
