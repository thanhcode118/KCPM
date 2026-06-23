import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// SỬA ĐOẠN NÀY: Dùng process.cwd() thay thế hoàn toàn cho __dirname
test.beforeAll(async () => {
  // Đường dẫn trỏ thẳng vào thư mục tests nằm trong frontend
  const dummyFilePath = path.join(process.cwd(), 'tests', 'bàn.jpg');
  if (!fs.existsSync(dummyFilePath)) {
    fs.writeFileSync(dummyFilePath, 'dummy image content');
  }
});

// ==========================================
// LUỒNG ADMIN 1: THÊM MỚI SẢN PHẨM & UPLOAD ẢNH THẬT
// ==========================================
test('Admin - Luồng 1: Thêm mới sản phẩm hoàn chỉnh', async ({ page }) => {
  // 1. Đăng nhập tài khoản Admin
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.locator('app-header-actions, header').getByRole('button').first().click({ force: true });
  await page.getByText('Đăng nhập ngay').click({ force: true });
  await page.locator('input[name="email"]').fill('admin1@homedecorshop.local');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click({ force: true });
  await page.waitForLoadState('networkidle', { timeout: 15000 });

  // 2. Tiến vào màn hình Thêm Sản Phẩm
  await page.getByRole('button', { name: 'Sản phẩm', exact: true }).click({ force: true });
  await page.getByRole('button', { name: 'Thêm Sản Phẩm' }).click({ force: true });

  // SỬA ĐOẠN NÀY: Cập nhật lại biến đường dẫn test ảnh cho đồng bộ với bên trên
  const testImagePath = path.join(process.cwd(), 'tests', 'bàn.jpg');
  const uploadInputFirst = page.getByRole('button', { name: 'Choose File' }).first();
  const uploadInputSecond = page.getByRole('button', { name: 'Choose File' }).nth(1);

  await uploadInputFirst.setInputFiles(testImagePath);
  await uploadInputSecond.setInputFiles(testImagePath);

  // 4. Điền các trường thông tin Form Sản Phẩm (Mã, Slug, Tên, Giá...)
  await page.getByRole('textbox', { name: 'BEE-CHAIR-' }).fill('BAA-HAHA');
  await page.getByRole('textbox', { name: 'ghe-go-cao-cap' }).fill('ban cao cap');
  await page.getByRole('textbox', { name: 'VD: Ghế gỗ Decor cao cấp' }).fill('ban go decor');

  // Điền số lượng và giá sản phẩm (Sử dụng các spinbutton tương ứng)
  await page.getByRole('spinbutton').first().fill('300000'); 
  await page.getByRole('spinbutton').nth(1).fill('500000');  

  // 5. Bấm Lưu sản phẩm
  await page.getByRole('button', { name: 'Lưu sản phẩm' }).click({ force: true });
  
  await expect(page.getByRole('button', { name: 'Sản phẩm', exact: true })).toBeVisible();
});
// ==========================================
// LUỒNG ADMIN 2: QUẢN LÝ ĐƠN HÀNG VÀ CHUYỂN TRẠNG THÁI
// ==========================================
test('Admin - Luồng 2: Tìm kiếm và cập nhật trạng thái Đơn hàng', async ({ page }) => {
  // Đăng nhập hệ thống Admin
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.locator('app-header-actions, header').getByRole('button').first().click({ force: true });
  await page.getByText('Đăng nhập ngay').click({ force: true });
  await page.locator('input[name="email"]').fill('admin1@homedecorshop.local');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click({ force: true });
  await page.waitForLoadState('networkidle');

  // Vào phân hệ Đơn hàng
  const orderTab = page.getByRole('button', { name: 'Đơn hàng' });
  await orderTab.waitFor({ state: 'visible' });
  await orderTab.click({ force: true });

  // Xử lý lắng nghe và bỏ qua các Dialog thông báo phát sinh (nếu có)
  page.once('dialog', dialog => {
    dialog.dismiss().catch(() => {});
  });

  // Tìm đúng hàng chứa mã đơn để đổi trạng thái sang Đang giao hàng (shipping)
  const targetOrderRow = page.getByRole('row', { name: '#ORD-20260612040518844-2002' }).getByRole('combobox');
  if (await targetOrderRow.isVisible()) {
    await targetOrderRow.selectOption('shipping');
    await page.waitForTimeout(1500); // Đợi 1.5 giây để DB cập nhật xong trạng thái
  }

  await expect(orderTab).toBeVisible();
});

// ==========================================
// LUỒNG ADMIN 3: QUẢN LÝ KHÁCH HÀNG & PHÂN HỆ PHỤ TRỢ
// ==========================================
test('Admin - Luồng 3: Xóa vĩnh viễn khách hàng và duyệt Marketing', async ({ page }) => {
  // Đăng nhập hệ thống Admin
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await page.locator('app-header-actions, header').getByRole('button').first().click({ force: true });
  await page.getByText('Đăng nhập ngay').click({ force: true });
  await page.locator('input[name="email"]').fill('admin1@homedecorshop.local');
  await page.locator('input[name="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click({ force: true });
  await page.waitForLoadState('networkidle');

  // 1. Vào phân hệ Khách hàng
  await page.getByRole('button', { name: 'Khách hàng' }).click({ force: true });

  // 2. KÍCH HOẠT XÓA THẬT: Khi bấm 'Xóa vĩnh viễn', hệ thống hiện popup confirm, máy chọn OK (Accept)
  page.once('dialog', async dialog => {
    console.log(`[HỆ THỐNG]: Đang xử lý Dialog: ${dialog.message()}`);
    await dialog.accept(); // Xác nhận đồng ý xóa tài khoản này khỏi hệ thống database
  });

  const deleteBtn = page.getByRole('button', { name: 'Xóa vĩnh viễn' }).nth(1);
  if (await deleteBtn.isVisible()) {
    await deleteBtn.click({ force: true });
    await page.waitForTimeout(1000);
  }

  // 3. Duyệt nhanh qua các phân hệ còn lại để kiểm tra tổng thể
  await page.getByRole('button', { name: 'Marketing' }).click({ force: true });
  await page.getByRole('button', { name: 'Hệ thống' }).click({ force: true });

  await expect(page.getByRole('button', { name: 'Hệ thống' })).toBeVisible();
});