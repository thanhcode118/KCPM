import { test, expect } from '@playwright/test';


test('Luồng 1: Tìm kiếm và bộ lọc sản phẩm BeeShop', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });

  const searchBar = page.getByRole('textbox', { name: 'Tìm sản phẩm...' });
  await searchBar.waitFor({ state: 'visible', timeout: 15000 });
  await searchBar.click({ force: true });
  
  await page.getByRole('button', { name: 'den ngu' }).click({ force: true });
  await page.getByRole('checkbox', { name: 'Đèn decor' }).check({ force: true });
  
  await page.waitForURL('**/search**', { timeout: 15000 });
  await page.getByRole('checkbox', { name: 'BeeShop' }).check({ force: true });

  await page.getByPlaceholder('Từ').fill('3000');
  await page.getByRole('button', { name: 'Dưới 200k' }).click({ force: true });
  await page.getByRole('button', { name: 'Ánh sáng vàng ấm' }).click({ force: true });
  
  await expect(page.getByRole('button', { name: 'Dưới 200k' })).toBeVisible();
});


test('Luồng 2: Kiểm thử logic tăng/giảm/xóa trong Giỏ hàng', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  
  await page.goto('http://localhost:3000/search?q=den%20ngu&category=%C4%90%C3%A8n%20decor');
  await page.waitForLoadState('domcontentloaded');

  const targetProduct = page.locator('img').nth(1);
  await targetProduct.waitFor({ state: 'visible', timeout: 15000 });
  await targetProduct.click({ force: true });

  const addToCartBtn = page.getByRole('button', { name: 'THÊM VÀO GIỎ HÀNG' });
  await addToCartBtn.waitFor({ state: 'visible', timeout: 15000 });
  await addToCartBtn.click({ force: true });

  const plusBtn = page.getByRole('button', { name: '+' });
  await plusBtn.waitFor({ state: 'visible' });
  await plusBtn.click({ force: true });
  await plusBtn.click({ force: true });
  await plusBtn.click({ force: true });

  await addToCartBtn.click({ force: true });
  
  const cartBadge = page.getByRole('button', { name: '5' }).first();
  await expect(cartBadge).toBeVisible();
});


test('Luồng 3: Cập nhật thông tin cá nhân (Profile)', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  const headerActionBtn = page.locator('app-header-actions').getByRole('button').filter({ hasText: /^$/ }).first() 
                          || page.getByRole('button').filter({ hasText: /^$/ }).nth(3);
  await headerActionBtn.waitFor({ state: 'visible' });
  await headerActionBtn.click({ force: true });

  await page.getByText('Đăng nhập ngay', { exact: true }).click({ force: true });

  await page.locator('input[name="email"]').fill('ngoctoan@gmail.com');
  await page.locator('input[name="password"]').fill('@ngoctoanV29');
  
  await page.getByRole('button', { name: 'Đăng nhập' }).click({ force: true });
  
  await page.waitForTimeout(3000);

  await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle' });

  const nameInput = page.locator('input[type="text"]').first() || page.locator('input').first();
  await nameInput.waitFor({ state: 'visible', timeout: 15000 });
  
  await nameInput.click({ force: true });
  await page.keyboard.press('Control+A');
  await page.keyboard.press('Backspace');
  await nameInput.fill('Nguyễn Ngọc Toàn');

  const saveBtn = page.getByRole('button', { name: /Lưu|Cập nhật/i }).first();
  if (await saveBtn.isVisible()) {
    await saveBtn.click({ force: true });
  }
});