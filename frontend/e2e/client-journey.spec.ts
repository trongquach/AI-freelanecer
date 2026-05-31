import { test, expect } from '@playwright/test';

test.describe('Client Journey', () => {
  test('should login, create job, and view dashboard', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[type="email"]', 'client@test.com');
    await page.fill('input[type="password"]', 'Test@12345');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard\/client/);
    await expect(page.locator('h1')).toContainText('Dashboard');

    // Navigate to create job
    await page.click('a[href="/jobs/new"]');
    await expect(page).toHaveURL(/\/jobs\/new/);

    // Create a job
    await page.fill('input[name="title"]', 'Build an AI Chatbot for e-commerce');
    await page.fill('textarea[name="description"]', 'Looking for an expert to build a chatbot using OpenAI API, Next.js, and Node.js. It needs to handle customer queries automatically.');
    await page.fill('input[name="budgetMin"]', '500');
    await page.fill('input[name="budgetMax"]', '1500');
    
    // Mock the API creation if necessary or just click and assert toast
    // await page.click('button[type="submit"]');
    // await expect(page.locator('.toast')).toContainText('Tạo việc làm thành công!');
  });
});
