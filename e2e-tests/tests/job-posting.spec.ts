import { test, expect } from '@playwright/test';

/**
 * BÀI TẬP: TỰ ĐỘNG HÓA KIỂM THỬ (AUTOMATION TESTING) VỚI PLAYWRIGHT
 * Chức năng: Đăng tin tuyển dụng (Job Posting)
 * File đích: CreateJobPage.tsx
 */

test.describe('Chức năng Đăng việc làm (Job Posting)', () => {
  // Bật chế độ chạy tuần tự (serial) thay vì song song để tránh bị Backend (RateLimitFilter) chặn do login quá nhiều cùng lúc
  test.describe.configure({ mode: 'serial' });

  
  test.beforeEach(async ({ page }) => {
    // 1. Đăng nhập trước (bắt buộc vì trang /jobs/new bị bảo vệ)
    await page.goto('http://aimarketswp.duckdns.org/login');
    await page.locator('input[name="email"]').fill('client@test.com');
    await page.locator('input[name="password"]').fill('password');
    await page.getByRole('button', { name: 'Sign In' }).click();

    // 2. Chờ hệ thống xử lý đăng nhập xong và chuyển hướng tới dashboard
    await page.waitForURL('**/dashboard/client');

    // 3. Đã có Token/Session, giờ mới phi thẳng vào trang Đăng Job!
    await page.goto('http://aimarketswp.duckdns.org/jobs/new'); 
  });

  // ================= NHÓM 1: HAPPY PATH (TEST LUỒNG ĐÚNG) ================= //

  test('testCreateJobSuccess', async ({ page }) => {
    // Sử dụng đúng name trong hook-form của React
    await page.locator('input[name="title"]').fill('Tuyển chuyên gia AI Machine Learning');
    await page.locator('textarea[name="description"]').fill('Dự án cần một chuyên gia AI có kinh nghiệm trên 5 năm để train model GPT với dữ liệu tài chính của công ty...');
    await page.locator('input[name="budgetMin"]').fill('100');
    await page.locator('input[name="budgetMax"]').fill('500');
    
    // Bấm nút submit có text là "Post a Job"
    await page.getByRole('button', { name: 'Post a Job' }).click();

    // Xác nhận: Giao diện hiển thị Toast báo thành công "Job created successfully!"
    await expect(page.getByText('Job created successfully!')).toBeVisible();
  });

  test('testAIEnhanceButtonIsDisabledWhenInputIsShort', async ({ page }) => {
    // Nút "AI Enhance" sẽ bị mờ (disable) nếu title < 10 ký tự hoặc description < 20 ký tự
    const enhanceBtn = page.getByRole('button', { name: /AI Enhance/i });
    
    // 1. Ban đầu chưa nhập gì -> Nút phải bị disable
    await expect(enhanceBtn).toBeDisabled();

    // 2. Nhập title đủ dài, nhưng description quá ngắn -> Nút vẫn disable
    await page.locator('input[name="title"]').fill('Tiêu đề này đủ dài rồi nhé');
    await page.locator('textarea[name="description"]').fill('Ngắn');
    await expect(enhanceBtn).toBeDisabled();

    // 3. Nhập cả 2 đủ độ dài -> Nút sẽ được bật (enable)
    await page.locator('textarea[name="description"]').fill('Mô tả này dài hơn 20 ký tự để test nút AI nha');
    await expect(enhanceBtn).toBeEnabled();
  });

  // ================= NHÓM 2: VALIDATION LỖI BẰNG ZOD (TEST LUỒNG SAI) ================= //

  test('testCreateJobFailsWhenTitleIsBlank', async ({ page }) => {
    // Bỏ trống title, điền mỗi description
    await page.locator('textarea[name="description"]').fill('Cần tìm người giỏi công nghệ cho dự án dài hạn trong tương lai để xây dựng hệ thống ERP...');
    await page.getByRole('button', { name: 'Post a Job' }).click();

    // Zod bắt lỗi String must contain at least 10 character(s) (vì min=10)
    await expect(page.getByText('Title must be at least 10 characters')).toBeVisible();
  });

  test('testCreateJobFailsWhenTitleTooShort', async ({ page }) => {
    // Nhập title ngắn hơn 10 ký tự
    await page.locator('input[name="title"]').fill('Dev AI');
    await page.getByRole('button', { name: 'Post a Job' }).click();

    await expect(page.getByText('Title must be at least 10 characters')).toBeVisible();
  });

  test('testCreateJobFailsWhenDescriptionIsBlank', async ({ page }) => {
    await page.locator('input[name="title"]').fill('Tìm Freelancer thiết kế UI/UX');
    await page.getByRole('button', { name: 'Post a Job' }).click();

    await expect(page.getByText('Description must be at least 50 characters')).toBeVisible();
  });

  test('testCreateJobFailsWhenDescriptionTooShort', async ({ page }) => {
    await page.locator('input[name="title"]').fill('Tuyển chuyên gia phân tích dữ liệu');
    // Nhập chuỗi chưa tới 50 ký tự
    await page.locator('textarea[name="description"]').fill('Cần tuyển người phân tích dữ liệu gấp'); 
    await page.getByRole('button', { name: 'Post a Job' }).click();

    await expect(page.getByText('Description must be at least 50 characters')).toBeVisible();
  });

  test('testCreateJobFailsWithNegativeBudgetMin', async ({ page }) => {
    await page.locator('input[name="title"]').fill('Viết script tự động hóa CI/CD');
    await page.locator('textarea[name="description"]').fill('Cần thuê một DevOps setup toàn bộ pipeline CI/CD cho dự án bằng Jenkins hoặc Github Actions...');
    await page.locator('input[name="budgetMin"]').fill('-50'); 
    await page.getByRole('button', { name: 'Post a Job' }).click();

    // Check class báo lỗi (viền đỏ) trên giao diện đã được fix trên VPS
    const budgetMinInput = page.locator('input[name="budgetMin"]');
    await expect(budgetMinInput).toHaveClass(/input-error/);
  });

  test('testCreateJobFailsWithNegativeBudgetMax', async ({ page }) => {
    await page.locator('input[name="title"]').fill('Viết script tự động hóa CI/CD');
    await page.locator('textarea[name="description"]').fill('Cần thuê một DevOps setup toàn bộ pipeline CI/CD cho dự án bằng Jenkins hoặc Github Actions...');
    await page.locator('input[name="budgetMax"]').fill('-100'); 
    await page.getByRole('button', { name: 'Post a Job' }).click();

    const budgetMaxInput = page.locator('input[name="budgetMax"]');
    await expect(budgetMaxInput).toHaveClass(/input-error/);
  });

  // ================= NHÓM 3: TEST KIỂM SOÁT UI (GIAO DIỆN) ================= //

  test('testCancelButtonNavigatesBack', async ({ page }) => {
    await page.locator('input[name="title"]').fill('Nội dung nhập dở dang định bỏ đi...');
    
    // Nút Hủy bên trang React của bạn có chữ "Cancel"
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Kiểm tra xem URL không còn chứa chữ "new" nữa (đã quay về trang trước)
    await expect(page).not.toHaveURL(/.*new/);
  });

  test('testInputFieldsShowErrorStyle', async ({ page }) => {
    // Bấm submit khi chưa điền gì cả
    await page.getByRole('button', { name: 'Post a Job' }).click();

    // Kiểm tra xem class "input-error" (viền đỏ) có được thêm vào input title không 
    // (Dựa vào code: className={`input ${errors.title ? 'input-error' : ''}`})
    const titleInput = page.locator('input[name="title"]');
    await expect(titleInput).toHaveClass(/input-error/);
  });

});
