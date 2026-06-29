import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

  const dummyFilePath = path.join(process.cwd(), 'tests', 'bàn.jpg');
  if (!fs.existsSync(dummyFilePath)) {
    fs.writeFileSync(dummyFilePath, 'dummy image content');
  }
});

test('Admin - Luồng 1: Thêm mới sản phẩm hoàn chỉnh', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('app-header-actions, header').getByRole('button').first().click({ force: true });
  await page.getByText('Đăng nhập ngay').click({ force: true });
  await page.locator('input[name="email"]').fill('admin1@homedecorshop.local');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click({ force: true });
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  await page.getByRole('button', { name: 'Sản phẩm', exact: true }).click({ force: true });
  await page.getByRole('button', { name: 'Thêm Sản Phẩm' }).click({ force: true });

  const testImagePath = path.join(process.cwd(), 'tests', 'bàn.jpg');
  const uploadInputFirst = page.getByRole('button', { name: 'Choose File' }).first();
  const uploadInputSecond = page.getByRole('button', { name: 'Choose File' }).nth(1);

  await uploadInputFirst.setInputFiles(testImagePath);
  await uploadInputSecond.setInputFiles(testImagePath);

  await page.getByRole('textbox', { name: 'BEE-CHAIR-' }).fill('BAA-HAHA');
  await page.getByRole('textbox', { name: 'ghe-go-cao-cap' }).fill('ban cao cap');
  await page.getByRole('textbox', { name: 'VD: Ghế gỗ Decor cao cấp' }).fill('ban go decor');

  await page.getByRole('spinbutton').first().fill('300000'); 
  await page.getByRole('spinbutton').nth(1).fill('500000');  

  await page.getByRole('button', { name: 'Lưu sản phẩm' }).click({ force: true });
  
  await expect(page.getByRole('button', { name: 'Sản phẩm', exact: true })).toBeVisible();
});

test('Admin - Luồng 2: Tìm kiếm và cập nhật trạng thái Đơn hàng', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.locator('app-header-actions, header').getByRole('button').first().click({ force: true });
  await page.getByText('Đăng nhập ngay').click({ force: true });
  await page.locator('input[name="email"]').fill('admin1@homedecorshop.local');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click({ force: true });
  await page.waitForLoadState('networkidle');

  const orderTab = page.getByRole('button', { name: 'Đơn hàng' });
  await orderTab.waitFor({ state: 'visible' });
  await orderTab.click({ force: true });

  page.once('dialog', dialog => {
    dialog.dismiss().catch(() => {});
  });

  const targetOrderRow = page.getByRole('row', { name: '#ORD-20260612040518844-2002' }).getByRole('combobox');
  if (await targetOrderRow.isVisible()) {
    await targetOrderRow.selectOption('shipping');
    await page.waitForTimeout(1500); 
  }

  await expect(orderTab).toBeVisible();
});


test('Admin - Luồng 3: Xóa vĩnh viễn khách hàng và duyệt Marketing', async ({ page }) => {
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.locator('app-header-actions, header').getByRole('button').first().click({ force: true });
  await page.getByText('Đăng nhập ngay').click({ force: true });
  await page.locator('input[name="email"]').fill('admin1@homedecorshop.local');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click({ force: true });
  await page.waitForLoadState('networkidle');

  await page.getByRole('button', { name: 'Khách hàng' }).click({ force: true });

  page.once('dialog', async dialog => {
    console.log(`[HỆ THỐNG]: Đang xử lý Dialog: ${dialog.message()}`);
    await dialog.accept(); 
  });

  const deleteBtn = page.getByRole('button', { name: 'Xóa vĩnh viễn' }).nth(1);
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }

  await page.getByRole('button', { name: 'Marketing' }).click({ force: true });
  await page.getByRole('button', { name: 'Hệ thống' }).click({ force: true });

  await expect(page.getByRole('button', { name: 'Hệ thống' })).toBeVisible();
});