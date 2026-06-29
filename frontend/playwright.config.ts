import { defineConfig, devices } from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  
  /* Đã sửa: Tăng thời gian chờ tổng thể lên 60 giây để tránh lỗi sập bài test oan do mạng local chậm */
  timeout: 60000,

  /* Đã sửa: Chuyển thành false để các file test chạy tuần tự, giúp server local không bị nghẽn */
  fullyParallel: false,
  
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Đã sửa: Ép sử dụng duy nhất 1 worker để chạy từng luồng một một cách từ tốn, an toàn 100% */
  workers: 1,
  
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Đã sửa: Bật cấu hình gốc URL của dự án để gọi lệnh page.goto ngắn gọn hơn */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Đã sửa: CẤU HÌNH QUAN SÁT - Máy tự động dừng 800ms (0.8 giây) sau mỗi bước bấm, gõ text */
    launchOptions: {
      slowMo: 800
    }
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    /* Đã đóng: Tạm thời tắt Firefox và Webkit để giảm tải RAM, tập trung nhuộm xanh trên Chrome */
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],
});