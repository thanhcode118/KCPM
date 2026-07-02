# Black-box API Test - Auth ConfirmEmail

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Auth.ConfirmEmail` |
| Method/Endpoint | `GET /api/auth/confirm-email?token={token}` |
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
| token | Token xác nhận email hợp lệ và còn hiệu lực | V1 | Token sai, rỗng, hết hạn hoặc không tồn tại | X1, X2, X3 |

### Output cần kiểm tra

API xác nhận email thành công nếu token hợp lệ. Với token sai, API trả về `400 Bad Request`.

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
| token | `valid-confirm-email-token` | `invalid-token-xxxx` | `400 Bad Request` | B1 |
| token | `valid-confirm-email-token` | Chuỗi rỗng | `400 Bad Request` | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | ConfirmEmail với token sai | `GET /api/auth/confirm-email?token=invalid-token-xxxx` | `400 Bad Request` | Passed | Pass | X1 |
| 2 | ConfirmEmail với token hợp lệ | `GET /api/auth/confirm-email?token=valid-token` | `2xx` hoặc thông báo xác nhận thành công | Chưa có trong file hiện tại | Chưa chạy | V1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
Scenario("ConfirmEmail với token sai phải trả về 400", async ({ I }) => {
  const res = await I.sendGetRequest(
    `/api/auth/confirm-email?token=invalid-token-${uniqueSuffix()}`
  );

  assertStatus(res, 400, "Confirm email với token sai phải trả về 400");
});
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
