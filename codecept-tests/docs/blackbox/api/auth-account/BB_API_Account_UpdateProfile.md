# Black-box API Test - Account UpdateProfile

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Account.UpdateProfile` |
| Method/Endpoint | `PUT /api/account/profile` |
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
| fullName | Tên mới không rỗng | V2 | Tên rỗng | X3 |
| phone | Số điện thoại hợp lệ | V3 | Số điện thoại quá ngắn hoặc sai định dạng | X4 |

### Output cần kiểm tra

Nếu input hợp lệ, API trả về `2xx` và profile đã cập nhật. Nếu input không hợp lệ, API trả về `400 Bad Request`.

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
| fullName | `Updated User xxxx` | Chuỗi rỗng | `400 Bad Request` | B1 |
| phone | `0912345678` | `123` | `400 Bad Request` | B2 |
| Token | Token hợp lệ | Không gửi token | `401 Unauthorized` | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | UpdateProfile hợp lệ | `PUT /api/account/profile` kèm token, fullName và phone hợp lệ | `2xx`, profile trả về đúng fullName và phone mới | Passed | Pass | V1, V2, V3 |
| 2 | UpdateProfile thiếu dữ liệu bắt buộc | `PUT /api/account/profile` với fullName rỗng, phone sai | `400 Bad Request` | Passed | Pass | X3, X4 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
Scenario("UpdateProfile bằng token hợp lệ phải cập nhật fullName và phone", async ({ I }) => {
  const customer = await registerNewCustomer(I);
  const updatePayload = buildUpdateProfilePayload();

  const res = await I.sendPutRequest(
    "/api/account/profile",
    updatePayload,
    authHeaders(customer.token)
  );

  assert2xx(res, "Update profile bằng token hợp lệ phải thành công");
});

Scenario("UpdateProfile thiếu dữ liệu bắt buộc phải trả về 400", async ({ I }) => {
  const customer = await registerNewCustomer(I);

  const res = await I.sendPutRequest(
    "/api/account/profile",
    { fullName: "", phone: "123" },
    authHeaders(customer.token)
  );

  assertStatus(res, 400, "Update profile input không hợp lệ phải trả về 400");
});
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
