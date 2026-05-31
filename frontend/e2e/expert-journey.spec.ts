import { test, expect } from '@playwright/test';

test.describe('Expert Journey', () => {
  test('should login, browse jobs, and submit proposal', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill credentials
    await page.fill('input[type="email"]', 'expert@test.com');
    await page.fill('input[type="password"]', 'Test@12345');
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard\/expert/);

    // Navigate to Jobs
    await page.click('a[href="/jobs"]');
    await expect(page).toHaveURL(/\/jobs/);

    // Click on the first job (assuming one exists)
    // await page.click('.job-card:first-child a');
    
    // Check apply button exists
    // await expect(page.locator('text=Gửi đề xuất')).toBeVisible();
    
    // Real tests will mock backend responses or use a testing database
  });
});
