const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\Trong\\.gemini\\antigravity-ide\\brain\\2121736f-5fd7-48e3-83e3-56319e7a2f1e';

async function screenshot(page, name) {
  const p = `${SCREENSHOTS_DIR}\\admin_${name}.png`;
  await page.screenshot({ path: p, fullPage: true });
  console.log(`Screenshot saved: admin_${name}.png`);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Accept any dialogs
  page.on('dialog', async dialog => {
    console.log(`Dialog: ${dialog.message()}`);
    await dialog.accept();
  });

  try {
    // STEP 1: Login as admin
    console.log('\n--- STEP 1: Login ---');
    await page.goto('http://localhost:3000/login');
    await page.fill('input[type="email"]', 'admin2@test.com');
    await page.fill('input[type="password"]', 'Test@12345');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('Current URL:', page.url());

    // Navigate to admin dashboard
    await page.goto('http://localhost:3000/admin/dashboard');
    await page.waitForTimeout(2000);
    await screenshot(page, '1_dashboard');
    const dashboardTitle = await page.textContent('h1').catch(() => '(no h1)');
    console.log('Dashboard title:', dashboardTitle);

    // STEP 2: Manage Users
    console.log('\n--- STEP 2: Manage Users ---');
    await page.goto('http://localhost:3000/admin/users');
    await page.waitForTimeout(2000);
    await screenshot(page, '2_users');
    const userCount = await page.$$('tbody tr').then(rows => rows.length).catch(() => 0);
    console.log('User rows visible:', userCount);

    // Find a non-admin active user and try to ban
    const banBtn = page.locator('button:has-text("Ban")').first();
    if (await banBtn.isVisible()) {
      await banBtn.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '2b_after_ban');
      console.log('Ban button clicked OK');

      // Try unban
      const unbanBtn = page.locator('button:has-text("Unban")').first();
      if (await unbanBtn.isVisible()) {
        await unbanBtn.click();
        await page.waitForTimeout(1500);
        await screenshot(page, '2c_after_unban');
        console.log('Unban button clicked OK');
      } else {
        console.log('Unban button not found');
      }
    } else {
      console.log('No Ban button found (no eligible users)');
      await screenshot(page, '2b_no_ban');
    }

    // STEP 3: Service Moderation
    console.log('\n--- STEP 3: Service Moderation ---');
    await page.goto('http://localhost:3000/admin/services');
    await page.waitForTimeout(2000);
    await screenshot(page, '3_services_pending');

    // Click "All Services" tab
    const allTabBtn = page.locator('button:has-text("All Services")');
    if (await allTabBtn.isVisible()) {
      await allTabBtn.click();
      await page.waitForTimeout(1500);
      await screenshot(page, '3b_services_all');
      console.log('All Services tab clicked');
    }

    // STEP 4: Jobs Moderation
    console.log('\n--- STEP 4: Manage Jobs ---');
    await page.goto('http://localhost:3000/admin/jobs');
    await page.waitForTimeout(2000);
    await screenshot(page, '4_jobs');
    const jobRows = await page.$$('tbody tr').then(r => r.length).catch(() => 0);
    console.log('Job rows visible:', jobRows);

    // STEP 5: Transactions
    console.log('\n--- STEP 5: Transactions ---');
    await page.goto('http://localhost:3000/admin/transactions');
    await page.waitForTimeout(2000);
    await screenshot(page, '5_transactions');
    const txRows = await page.$$('tbody tr').then(r => r.length).catch(() => 0);
    console.log('Transaction rows visible:', txRows);

    console.log('\n✅ All tests completed!');
  } catch (err) {
    console.error('❌ Test error:', err.message);
    await screenshot(page, 'error').catch(() => {});
  } finally {
    await context.close();
    await browser.close();
  }
}

run();
