const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('pageerror', err => {
    errors.push('Page Error: ' + err.toString());
  });
  page.on('error', err => {
    errors.push('Error: ' + err.toString());
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push('Console Error: ' + msg.text());
    }
  });

  try {
    console.log("Navigating to login...");
    await page.goto('http://127.0.0.1:8000/login');
    
    await page.type('input[type="email"]', 'admin1@nisalatravels.com');
    await page.type('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    
    console.log("Waiting for navigation after login...");
    await page.waitForNavigation();
    
    console.log("Navigating to /customers...");
    await page.goto('http://127.0.0.1:8000/customers');
    
    // wait a bit for react to render and potentially crash
    await new Promise(r => setTimeout(r, 2000));
    
    console.log("Errors captured:");
    console.log(errors.join('\n'));
    
  } catch (err) {
    console.error("Puppeteer Script Error:", err);
  } finally {
    await browser.close();
  }
})();
