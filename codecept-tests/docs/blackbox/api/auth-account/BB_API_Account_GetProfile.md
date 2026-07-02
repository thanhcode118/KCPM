# Black-box API Test - Account GetProfile

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Account.GetProfile` |
| Method/Endpoint | `GET /api/account/profile` |
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
| Authorization token | Token user hợp lệ | V1 | Không có token hoặc token sai | X1, X2 |

### Output cần kiểm tra

Nếu có token hợp lệ, API trả về `2xx` và thông tin user. Nếu không có token, API trả về `401 Unauthorized`.

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
| Token | Token hợp lệ | Không gửi token | `401 Unauthorized` | B1 |
| Token | Token hợp lệ | `invalid-token` | `401 Unauthorized` | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | GetProfile bằng token hợp lệ | `GET /api/account/profile` kèm token user vừa đăng ký | `2xx`, response trả về đúng email user | Passed | Pass | V1 |
| 2 | GetProfile không có token | `GET /api/account/profile` không gửi header token | `401 Unauthorized` | Passed | Pass | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
Scenario("GetProfile bằng token hợp lệ phải trả về thông tin user", async ({ I }) => {
  const customer = await registerNewCustomer(I);

  const res = await I.sendGetRequest(
    "/api/account/profile",
    authHeaders(customer.token)
  );

  assert2xx(res, "Get profile bằng token hợp lệ phải thành công");
});

Scenario("GetProfile không có token phải trả về 401", async ({ I }) => {
  const res = await I.sendGetRequest("/api/account/profile");

  assertStatus(res, 401, "Get profile không có token phải trả về 401");
});
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
