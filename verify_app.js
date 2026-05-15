const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('Navigating to local app...');
  await page.goto('file://' + process.cwd() + '/index.html');
  
  // Wait for Firebase to maybe fail or something
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'screenshot.png' });
  await browser.close();
})();
