# Hướng Dẫn Chạy CodeceptJS

Điều kiện trước khi chạy CodeceptJS:

```text
Backend API đã chạy tại: http://localhost:5020
Frontend đã chạy tại: http://localhost:3000
Dữ liệu mẫu đã được seed
```

---

## 1. Vào thư mục CodeceptJS

```powershell
cd codecept-tests
```

Thư mục này chứa toàn bộ test CodeceptJS của project.

Cấu trúc chính:

```text
codecept-tests
├── codecept.conf.js
├── package.json
├── steps_file.js
├── tests
│   ├── be
│   │   └── product_api_test.js
│   └── fe
│       ├── product_filter_test.js
│       ├── product_detail_test.js
│       └── product_detail_bug_test.js
└── output
```

---

## 2. Cài thư viện CodeceptJS

Chạy lệnh:

```powershell
npm install
```

Cài trình duyệt cho Playwright:

```powershell
npx playwright install
```

Lưu ý:

```text
Lần đầu chạy cần npm install và npx playwright install.
Những lần sau thường chỉ cần npm install nếu package có thay đổi.
```

---

## 3. Set URL cho Frontend và Backend

Trước khi chạy test, cần set biến môi trường:

```powershell
$env:FE_URL="http://localhost:3000"
$env:API_URL="http://localhost:5020"
```

Ý nghĩa:

```text
FE_URL  = địa chỉ frontend
API_URL = địa chỉ backend API
```

---

## 4. Chạy test lọc sản phẩm

Lệnh chạy:

```powershell
npm run test:filter
```

File được chạy:

```text
tests/fe/product_filter_test.js
```

Chức năng kiểm tra:

```text
1. Tìm kiếm/lọc sản phẩm với từ khóa hợp lệ
2. Tìm kiếm từ khóa không tồn tại
```

Kết quả pass mẫu:

```text
OK | 2 passed
```

---

## 5. Chạy test chi tiết sản phẩm

Lệnh chạy:

```powershell
npm run test:detail
```

File được chạy:

```text
tests/fe/product_detail_test.js
```

Chức năng kiểm tra:

```text
1. Trang chi tiết sản phẩm hiển thị đúng thông tin từ API
2. Trang chi tiết sản phẩm có nút thêm vào giỏ hàng
```

---

## 6. Chạy test phát hiện bug trang chi tiết sản phẩm

Lệnh chạy:

```powershell
npm run test:bug-detail
```

File được chạy:

```text
tests/fe/product_detail_bug_test.js
```

Chức năng kiểm tra:

```text
1. Khi truy cập sản phẩm không tồn tại, hệ thống phải hiển thị thông báo lỗi
2. Breadcrumb danh mục phải dùng slug danh mục, không dùng slug sản phẩm
```

Lưu ý:

```text
Test này có thể FAIL vì đang dùng để chứng minh bug thật trong dự án.
Nếu fail đúng 2 lỗi trên thì không phải do CodeceptJS lỗi.
```

Ví dụ lỗi đã phát hiện:

```text
/product/99999999 chỉ hiển thị header/footer, không có thông báo lỗi.
```

Ví dụ lỗi breadcrumb:

```text
Link hiện tại: /collections/tap-de-cotton-phong-cach-han-118
Đúng phải là: /collections/phu-kien-ban-an-bep-decor
```

---

## 7. Chạy test API sản phẩm

Lệnh chạy:

```powershell
npm run test:api
```

File được chạy:

```text
tests/be/product_api_test.js
```

Chức năng kiểm tra:

```text
1. API lấy danh sách sản phẩm
2. API tìm kiếm sản phẩm
3. API xử lý sản phẩm không tồn tại
```

---

## 9. Chạy toàn bộ test

Chạy toàn bộ test CodeceptJS:

```powershell
npm test
```

Hoặc:

```powershell
npm run test
```

Chạy toàn bộ test frontend:

```powershell
npm run test:fe
```

Chạy toàn bộ test backend/API:

```powershell
npm run test:be
```

---

## 9. Lệnh chạy nhanh thường dùng

Sau khi Frontend và Backend đã chạy, dùng bộ lệnh này:

```powershell
cd E:\KiemChungPhanMem\KCPM\codecept-tests

$env:FE_URL="http://localhost:3000"
$env:API_URL="http://localhost:5020"

npm run test:filter
npm run test:detail
npm run test:bug-detail
npm run test:api
```

---

## 10. Bật trình duyệt khi chạy test

Trong file:

```text
codecept-tests/codecept.conf.js
```

Nếu muốn nhìn thấy trình duyệt mở lên khi test chạy, đổi:

```js
show: false;
```

thành:

```js
show: true;
```

Hoặc nên dùng cách linh hoạt hơn:

```js
show: process.env.SHOW_BROWSER === "true";
```

Khi muốn chạy local có mở trình duyệt:

```powershell
$env:SHOW_BROWSER="true"
npm run test:filter
```

Khi không muốn mở trình duyệt:

```powershell
$env:SHOW_BROWSER="false"
npm run test:filter
```

Lưu ý:

```text
Chạy trên Jenkins nên để show: false.
Chạy local để debug có thể dùng show: true.
```

---

## 11. Cách viết thêm test mới

11.1 Nếu test giao diện frontend, tạo file trong:

```text
codecept-tests/tests/fe
```

Ví dụ:

```text
codecept-tests/tests/fe/cart_test.js
```

Nếu test API backend, tạo file trong:

```text
codecept-tests/tests/be
```

Ví dụ:

```text
codecept-tests/tests/be/order_api_test.js
```

Tên file nên kết thúc bằng:

```text
_test.js
```

Ví dụ:

```text
cart_test.js
login_test.js
order_api_test.js
```

11.2. Thêm lệnh chạy test vào package.json

Sau khi tạo file test mới, cần mở file:

E:\KiemChungPhanMem\KCPM\codecept-tests\package.json

Tìm phần:

"scripts": {
}

Thêm script mới tương ứng với file test vừa tạo.

Ví dụ nếu vừa tạo file:

tests/fe/cart_test.js

thì thêm dòng:

"test:cart": "codeceptjs run tests/fe/cart_test.js"

Ví dụ package.json sau khi thêm:

{
"name": "codecept-tests",
"version": "1.0.0",
"description": "",
"main": "index.js",
"scripts": {
"test": "codeceptjs run",
"test:fe": "codeceptjs run tests/fe",
"test:be": "codeceptjs run tests/be",
"test:filter": "codeceptjs run tests/fe/product_filter_test.js",
"test:detail": "codeceptjs run tests/fe/product_detail_test.js",
"test:bug-detail": "codeceptjs run tests/fe/product_detail_bug_test.js",
"test:api": "codeceptjs run tests/be/product_api_test.js",
"test:cart": "codeceptjs run tests/fe/cart_test.js"
},
"keywords": [],
"author": "",
"license": "ISC",
"type": "commonjs",
"devDependencies": {
"codeceptjs": "^4.0.6",
"playwright": "^1.60.0"
}
}

Lưu ý:

Dòng script trước dòng mới phải có dấu phẩy.
Dòng script cuối cùng không cần dấu phẩy.

---

## 12. Các file không được commit

Không commit các thư mục tự sinh

Cách commit đúng sau khi thêm hoặc sửa CodeceptJS

Sau khi thêm hoặc sửa test CodeceptJS, cần commit đúng các file cần thiết và bỏ qua các thư mục tự sinh.

Bước 1: Kiểm tra trạng thái Git

Mở terminal tại thư mục gốc project:

cd E:\KiemChungPhanMem\KCPM

Kiểm tra trạng thái:

git status

Nếu thấy các thư mục sau xuất hiện thì không được commit:

codecept-tests/node_modules/
codecept-tests/output/
Bước 2: Đảm bảo .gitignore đã có dòng bỏ qua file tự sinh

Mở file .gitignore ở thư mục gốc project:

notepad .gitignore

Đảm bảo có các dòng:

codecept-tests/node_modules/
codecept-tests/output/
HomeDecorShop/HomeDecorShop.Tests/TestResults/

## Lưu file lại.
