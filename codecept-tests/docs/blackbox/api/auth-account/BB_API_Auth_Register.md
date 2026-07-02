# Black-box API Test - Auth Register

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Auth.Register` |
| Method/Endpoint | `POST /api/auth/register` |
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
| email | Email đúng định dạng và chưa tồn tại | V1 | Email sai định dạng, rỗng hoặc đã tồn tại | X1, X2, X3 |
| fullName | Tên người dùng không rỗng | V2 | Tên rỗng | X4 |
| phone | Số điện thoại hợp lệ | V3 | Số điện thoại quá ngắn hoặc sai định dạng | X5 |
| password | Mật khẩu đủ mạnh | V4 | Mật khẩu rỗng hoặc quá yếu | X6 |
| role | `customer` | V5 | Role rỗng hoặc không hợp lệ | X7 |

### Output cần kiểm tra

API trả về `2xx`, có `token`, có `user`, và `user.role = customer` nếu đăng ký hợp lệ. Nếu input sai, API trả về `400 Bad Request`.

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
| email | `codecept.user.xxxx@example.com` | `invalid-email` | `400 Bad Request` | B1 |
| fullName | `Codecept User xxxx` | Chuỗi rỗng | `400 Bad Request` | B2 |
| phone | `0987654321` | `123` | `400 Bad Request` | B3 |
| password | `Password123` | `123` | `400 Bad Request` | B4 |
| role | `customer` | `invalid-role` | `400 Bad Request` | B5 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Register customer thành công | `POST /api/auth/register` với email, fullName, phone, password, role hợp lệ | `2xx`, response có `token`, có `user`, role là `customer` | Passed | Pass | V1, V2, V3, V4, V5 |
| 2 | Register thiếu dữ liệu bắt buộc | `POST /api/auth/register` với email sai, fullName rỗng, phone ngắn, password yếu | `400 Bad Request` | Passed | Pass | X1, X4, X5, X6 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
Scenario("Register customer thành công phải trả về token và user", async ({ I }) => {
  const payload = buildRegisterPayload();
  const res = await I.sendPostRequest("/api/auth/register", payload);

  assert2xx(res, "API register phải trả về 2xx");
  assert(getToken(res.data), "Register không trả về token");
  assert(getUser(res.data), "Register không trả về user");
});

Scenario("Register thiếu dữ liệu bắt buộc phải trả về 400", async ({ I }) => {
  const res = await I.sendPostRequest("/api/auth/register", {
    email: "invalid-email",
    fullName: "",
    phone: "123",
    password: "123",
    role: "customer",
  });

  assertStatus(res, 400, "Register input không hợp lệ phải trả về 400");
});
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
