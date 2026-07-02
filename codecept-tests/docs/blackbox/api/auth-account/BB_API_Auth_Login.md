# Black-box API Test - Auth Login

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Auth.Login` |
| Method/Endpoint | `POST /api/auth/login` |
| Công cụ | CodeceptJS REST helper |
| Lệnh chạy | `npm run test:be:auth-account` |
| Kết quả chạy thực tế | `OK | 11 passed` |

## 2. Mục tiêu kiểm thử

Kiểm thử API từ bên ngoài thông qua HTTP request/response.

Test không gọi trực tiếp mã nguồn C# bên trong, nên đây là **Black-box API Testing**.

Trong file test:

- **Input** là method, endpoint, header và request body gửi vào API.
- **Expected Output** là status code và response body mong đợi.
- **Actual Output** là kết quả thực tế khi chạy CodeceptJS.

---

# NỘI DUNG THIẾT KẾ KIỂM THỬ API

---

## 1. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
| --- | --- | --- | --- | --- |
| email | Email tài khoản đã tồn tại | V1 | Email không tồn tại hoặc rỗng | X1, X2 |
| password | Mật khẩu đúng | V2 | Mật khẩu sai hoặc rỗng | X3, X4 |

### Output cần kiểm tra

API trả về `2xx`, có `token`, có `user` nếu đăng nhập hợp lệ. Nếu sai thông tin đăng nhập, API trả về `401 Unauthorized`.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API test, không phải field nào cũng có miền số `[min, max]` rõ ràng.

Do đó, phần này áp dụng theo hướng **biên dữ liệu nghiệp vụ**:

- Giá trị hợp lệ đại diện.
- Giá trị rỗng.
- Giá trị sai định dạng.
- Giá trị thiếu token hoặc token sai.
- Giá trị không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| email | `admin1@homedecorshop.local` | `unknown@example.com` | `401 Unauthorized` | B1 |
| password | `admin123` | `WrongPassword123` | `401 Unauthorized` | B2 |
| password | `admin123` | Chuỗi rỗng | `400` hoặc `401` tùy validation | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Login admin thành công | `POST /api/auth/login` với email/password admin seed đúng | `2xx`, response có `token`, có `user` | Passed | Pass | V1, V2 |
| 2 | Login sai mật khẩu | `POST /api/auth/login` với email đúng nhưng password sai | `401 Unauthorized` | Passed | Pass | X3 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
Scenario("Login admin seed thành công phải trả về token", async ({ I }) => {
  const res = await I.sendPostRequest("/api/auth/login", {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  assert2xx(res, "Login admin thất bại");
  assert(getToken(res.data), "Login admin phải trả về token");
});

Scenario("Login sai mật khẩu phải trả về 401", async ({ I }) => {
  const res = await I.sendPostRequest("/api/auth/login", {
    email: ADMIN_EMAIL,
    password: "WrongPassword123",
  });

  assertStatus(res, 401, "Login sai mật khẩu phải trả về 401");
});
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
