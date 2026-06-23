const { chromium } = require('playwright');
const path = require('path');

const SCREENSHOTS_DIR = 'C:\\Users\\Trong\\.gemini\\antigravity-ide\\brain\\2121736f-5fd7-48e3-83e3-56319e7a2f1e';

async function screenshot(page, name) {
  const p = `${SCREENSHOTS_DIR}\\contract_${name}.png`;
  await page.screenshot({ path: p, fullPage: true });
  console.log(`Screenshot saved: contract_${name}.png`);
}

async function login(page, email, password) {
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(2000);
}

async function logout(page) {
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto('http://localhost:3000/login');
  await page.waitForTimeout(1000);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('dialog', async dialog => {
    await dialog.accept();
  });

  try {
    // --- 1. Client Posts a Job ---
    console.log('--- 1. Client Posting Job ---');
    await login(page, 'client99@test.com', 'Test@12345');
    await page.goto('http://localhost:3000/jobs/new');
    await page.waitForTimeout(1000);
    await page.fill('input[name="title"]', 'E2E Contract Test Job');
    await page.fill('textarea[name="description"]', 'Need an expert for e2e testing contract flow. Must have experience with React and Node.js.');
    await page.fill('input[name="budgetMin"]', '500');
    await page.fill('input[name="budgetMax"]', '1000');
    
    // Select skill
    await page.click('button:has-text("Select skills...")');
    await page.waitForTimeout(1000);
    // Click the first skill in the dropdown
    await page.click('div[role="dialog"] button:has-text("Deep Learning")');
    await page.keyboard.press('Escape'); // close dropdown
    
    await page.click('button:has-text("Post a Job")');
    await page.waitForTimeout(2000);
    await screenshot(page, '1_client_job_posted');
    await logout(page);

    // --- 2. Admin Approves Job ---
    console.log('--- 2. Admin Approving Job ---');
    await login(page, 'admin99@test.com', 'Test@12345');
    await page.goto('http://localhost:3000/admin/jobs');
    await page.waitForTimeout(2000);
    // Click approve on the first pending job
    const approveBtn = page.locator('button:has-text("Approve")').first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await page.waitForTimeout(1000);
    }
    await logout(page);

    // --- 3. Expert Submits Proposal ---
    console.log('--- 3. Expert Submits Proposal ---');
    await login(page, 'expert99@test.com', 'Test@12345');
    await page.goto('http://localhost:3000/jobs');
    await page.waitForTimeout(2000);
    // Find the job
    const jobLink = page.locator('text="E2E Contract Test Job"').first();
    if (await jobLink.isVisible()) {
      await jobLink.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '2_expert_view_job');
      
      // Submit proposal
      await page.goto(page.url() + '/proposals/new');
      await page.waitForTimeout(1000);
      await page.fill('input[name="price"]', '900');
      await page.fill('input[name="timelineDays"]', '7');
      await page.fill('textarea[name="coverLetter"]', 'I can do this E2E test perfectly.');
      await page.click('button:has-text("Submit Proposal")');
      await page.waitForTimeout(2000);
      await screenshot(page, '3_expert_proposal_submitted');
    }
    await logout(page);

    // --- 4. Client Accepts Proposal (Creates Contract) ---
    console.log('--- 4. Client Accepts Proposal ---');
    await login(page, 'client99@test.com', 'Test@12345');
    // Go to proposals
    await page.goto('http://localhost:3000/proposals');
    await page.waitForTimeout(2000);
    await screenshot(page, '4_client_view_proposals');
    
    const acceptBtn = page.locator('button:has-text("Accept")').first();
    if (await acceptBtn.isVisible()) {
      await acceptBtn.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '5_client_accepted_contract_created');
    }
    
    // Get contract ID from dashboard
    await page.goto('http://localhost:3000/dashboard/client');
    await page.waitForTimeout(2000);
    await screenshot(page, '6_client_dashboard_with_contract');
    
    // Try to find the contract link
    const contractLink = page.locator('a[href^="/contracts/"]').first();
    let contractUrl = '';
    if (await contractLink.isVisible()) {
      contractUrl = await contractLink.getAttribute('href');
      await contractLink.click();
      await page.waitForTimeout(2000);
      await screenshot(page, '7_client_contract_detail');
    }
    await logout(page);

    // --- 5. Expert Submits Milestone ---
    if (contractUrl) {
      console.log('--- 5. Expert Submits Milestone ---');
      await login(page, 'expert99@test.com', 'Test@12345');
      await page.goto(`http://localhost:3000${contractUrl}`);
      await page.waitForTimeout(2000);
      await screenshot(page, '8_expert_contract_detail');
      
      const submitWorkBtn = page.locator('button:has-text("Submit Work")').first();
      if (await submitWorkBtn.isVisible()) {
        await submitWorkBtn.click();
        await page.waitForTimeout(500);
        await page.fill('input[type="url"]', 'https://github.com/test/repo');
        await page.fill('textarea[placeholder*="I have completed"]', 'Here is the completed work for the milestone.');
        await page.click('button:has-text("Submit for Approval")');
        await page.waitForTimeout(2000);
        await screenshot(page, '9_expert_milestone_submitted');
      }
      await logout(page);

      // --- 6. Client Approves Milestone ---
      console.log('--- 6. Client Approves Milestone ---');
      await login(page, 'client99@test.com', 'Test@12345');
      await page.goto(`http://localhost:3000${contractUrl}`);
      await page.waitForTimeout(2000);
      await screenshot(page, '10_client_view_submission');
      
      const approvePayBtn = page.locator('button:has-text("Approve & Pay")').first();
      if (await approvePayBtn.isVisible()) {
        await approvePayBtn.click();
        await page.waitForTimeout(2000);
        await screenshot(page, '11_client_milestone_approved');
      }
      await logout(page);
    }

    console.log('\n✅ Contract E2E flow tests completed!');
  } catch (err) {
    console.error('❌ Test error:', err);
    await screenshot(page, 'error').catch(() => {});
  } finally {
    await context.close();
    await browser.close();
  }
}

run();
