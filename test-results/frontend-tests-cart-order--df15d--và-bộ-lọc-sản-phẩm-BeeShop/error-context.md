# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: frontend\tests\cart-order.spec.ts >> Luồng 1: Tìm kiếm và bộ lọc sản phẩm BeeShop
- Location: frontend\tests\cart-order.spec.ts:4:1

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "domcontentloaded"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e6]:
    - heading "This site can’t be reached" [level=1] [ref=e7]
    - paragraph [ref=e8]:
      - strong [ref=e9]: localhost
      - text: refused to connect.
    - generic [ref=e10]:
      - paragraph [ref=e11]: "Try:"
      - list [ref=e12]:
        - listitem [ref=e13]: Checking the connection
        - listitem [ref=e14]:
          - link "Checking the proxy and the firewall" [ref=e15] [cursor=pointer]:
            - /url: "#buttons"
    - generic [ref=e16]: ERR_CONNECTION_REFUSED
  - generic [ref=e17]:
    - button "Reload" [ref=e19] [cursor=pointer]
    - button "Details" [ref=e20] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | 
  4  | test('Luồng 1: Tìm kiếm và bộ lọc sản phẩm BeeShop', async ({ page }) => {
> 5  |   await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
     |              ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  6  | 
  7  |   const searchBar = page.getByRole('textbox', { name: 'Tìm sản phẩm...' });
  8  |   await searchBar.waitFor({ state: 'visible', timeout: 15000 });
  9  |   await searchBar.click({ force: true });
  10 |   
  11 |   await page.getByRole('button', { name: 'den ngu' }).click({ force: true });
  12 |   await page.getByRole('checkbox', { name: 'Đèn decor' }).check({ force: true });
  13 |   
  14 |   await page.waitForURL('**/search**', { timeout: 15000 });
  15 |   await page.getByRole('checkbox', { name: 'BeeShop' }).check({ force: true });
  16 | 
  17 |   await page.getByPlaceholder('Từ').fill('3000');
  18 |   await page.getByRole('button', { name: 'Dưới 200k' }).click({ force: true });
  19 |   await page.getByRole('button', { name: 'Ánh sáng vàng ấm' }).click({ force: true });
  20 |   
  21 |   await expect(page.getByRole('button', { name: 'Dưới 200k' })).toBeVisible();
  22 | });
  23 | 
  24 | 
  25 | test('Luồng 2: Kiểm thử logic tăng/giảm/xóa trong Giỏ hàng', async ({ page }) => {
  26 |   await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  27 |   
  28 |   await page.goto('http://localhost:3000/search?q=den%20ngu&category=%C4%90%C3%A8n%20decor');
  29 |   await page.waitForLoadState('domcontentloaded');
  30 | 
  31 |   const targetProduct = page.locator('img').nth(1);
  32 |   await targetProduct.waitFor({ state: 'visible', timeout: 15000 });
  33 |   await targetProduct.click({ force: true });
  34 | 
  35 |   const addToCartBtn = page.getByRole('button', { name: 'THÊM VÀO GIỎ HÀNG' });
  36 |   await addToCartBtn.waitFor({ state: 'visible', timeout: 15000 });
  37 |   await addToCartBtn.click({ force: true });
  38 | 
  39 |   const plusBtn = page.getByRole('button', { name: '+' });
  40 |   await plusBtn.waitFor({ state: 'visible' });
  41 |   await plusBtn.click({ force: true });
  42 |   await plusBtn.click({ force: true });
  43 |   await plusBtn.click({ force: true });
  44 | 
  45 |   await addToCartBtn.click({ force: true });
  46 |   
  47 |   const cartBadge = page.getByRole('button', { name: '5' }).first();
  48 |   await expect(cartBadge).toBeVisible();
  49 | });
  50 | 
  51 | 
  52 | test('Luồng 3: Cập nhật thông tin cá nhân (Profile)', async ({ page }) => {
  53 |   await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  54 |   const headerActionBtn = page.locator('app-header-actions').getByRole('button').filter({ hasText: /^$/ }).first() 
  55 |                           || page.getByRole('button').filter({ hasText: /^$/ }).nth(3);
  56 |   await headerActionBtn.waitFor({ state: 'visible' });
  57 |   await headerActionBtn.click({ force: true });
  58 | 
  59 |   await page.getByText('Đăng nhập ngay', { exact: true }).click({ force: true });
  60 | 
  61 |   await page.locator('input[name="email"]').fill('ngoctoan@gmail.com');
  62 |   await page.locator('input[name="password"]').fill('@ngoctoanV29');
  63 |   
  64 |   await page.getByRole('button', { name: 'Đăng nhập' }).click({ force: true });
  65 |   
  66 |   await page.waitForTimeout(3000);
  67 | 
  68 |   await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle' });
  69 | 
  70 |   const nameInput = page.locator('input[type="text"]').first() || page.locator('input').first();
  71 |   await nameInput.waitFor({ state: 'visible', timeout: 15000 });
  72 |   
  73 |   await nameInput.click({ force: true });
  74 |   await page.keyboard.press('Control+A');
  75 |   await page.keyboard.press('Backspace');
  76 |   await nameInput.fill('Nguyễn Ngọc Toàn');
  77 | 
  78 |   const saveBtn = page.getByRole('button', { name: /Lưu|Cập nhật/i }).first();
  79 |   if (await saveBtn.isVisible()) {
  80 |     await saveBtn.click({ force: true });
  81 |   }
  82 | });
```