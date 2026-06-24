const { chromium } = require('playwright');
const path = require('path');

async function run() {
  // 1. Create a service via API first so we have one to delete
  let token;
  try {
    const loginRes = await fetch('http://localhost:8080/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'expert_e2e@test.com', password: 'Test@12345' })
    });
    token = (await loginRes.json()).accessToken;
    
    await fetch('http://localhost:8080/api/v1/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        title: 'Temporary Service For Deletion Test',
        description: 'Testing the frontend delete button and cache invalidation.',
        price: 100,
        deliveryDays: 3,
        skillIds: [1],
        tags: []
      })
    });
    console.log('Test service created via API.');
  } catch (err) {
    console.error('Error creating service via API', err);
  }

  // 2. Playwright script to delete via UI
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to login...');
    await page.goto('http://localhost:3000/login');
    
    await page.fill('input[type="email"]', 'expert_e2e@test.com');
    await page.fill('input[type="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    
    console.log('Logged in. Waiting for dashboard...');
    await page.waitForURL('**/dashboard/expert');
    
    console.log('Navigating directly to My Services...');
    await page.goto('http://localhost:3000/services/my');
    
    console.log('Waiting for services to load...');
    await page.waitForTimeout(2000); 
    
    const serviceCards = await page.$$('article');
    if (serviceCards.length > 0) {
      console.log(`Found ${serviceCards.length} service(s). Clicking the first one...`);
      await page.click('article h3');
      await page.waitForURL('**/marketplace/*');
      await page.waitForTimeout(1500); 

      console.log('On service detail page. Setting up dialog handler...');
      page.on('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
        console.log('Dialog accepted.');
      });
      
      console.log('Taking screenshot before delete...');
      await page.screenshot({ path: 'C:\\Users\\Trong\\.gemini\\antigravity-ide\\brain\\2121736f-5fd7-48e3-83e3-56319e7a2f1e\\before_delete.png', fullPage: true });

      console.log('Clicking Delete Service...');
      await page.click('button:has-text("Delete Service")');
      
      console.log('Waiting for redirect back to My Services...');
      await page.waitForTimeout(2000); 

      console.log('Taking screenshot after delete...');
      await page.screenshot({ path: 'C:\\Users\\Trong\\.gemini\\antigravity-ide\\brain\\2121736f-5fd7-48e3-83e3-56319e7a2f1e\\after_delete.png', fullPage: true });

      console.log('Test completed successfully.');
    } else {
      console.log('No services found to delete. Maybe selector is wrong? taking screenshot');
      await page.screenshot({ path: 'C:\\Users\\Trong\\.gemini\\antigravity-ide\\brain\\2121736f-5fd7-48e3-83e3-56319e7a2f1e\\no_services.png', fullPage: true });
    }
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await context.close();
    await browser.close();
  }
}

run();
