import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.locator('.flex.items-center.gap-2.md\\:gap-3').first().click();
  await page.getByRole('button').filter({ hasText: /^$/ }).first().click();
  await page.getByText('Đăng nhập ngay').click();
  await page.locator('input[name="email"]').click();
  await page.locator('input[name="email"]').fill('ngoctoan@gmail.com');
  await page.locator('div').filter({ hasText: /^Mật khẩu$/ }).click();
  await page.locator('input[name="password"]').fill('@ngoctoanV29');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await page.goto('http://localhost:3000/checkout');
  await page.getByRole('textbox', { name: 'Họ tên người nhận' }).fill('Toàn');
  await page.getByRole('textbox', { name: 'Số điện thoại' }).fill('0353643298');
  await page.getByRole('combobox', { name: 'Địa chỉ (số nhà, đường...)' }).fill('123 Nguyễn Huệ, Phường Bến Nghé');
  await page.getByRole('combobox', { name: 'Phường / Xã' }).fill('Phường Bến Nghé');
  await page.getByRole('combobox', { name: 'Quận / Huyện' }).fill('Quận 10');
  await page.getByRole('combobox', { name: 'Tỉnh / Thành phố' }).fill('Đà Nẵng');
  await page.getByRole('textbox', { name: 'Ghi chú giao hàng (không bắt' }).fill('cẩn thận nhé');
  await page.goto('http://localhost:3000/orders?payment=processed');
});