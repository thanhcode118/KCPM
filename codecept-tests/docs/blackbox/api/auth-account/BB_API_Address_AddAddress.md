# Black-box API Test - Address AddAddress

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Address.AddAddress` |
| Method/Endpoint | `POST /api/account/addresses` |
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
| fullName | Tên người nhận không rỗng | V2 | Tên người nhận rỗng | X3 |
| phone | Số điện thoại hợp lệ | V3 | Số điện thoại quá ngắn hoặc sai định dạng | X4 |
| line1/ward/district/city | Thông tin địa chỉ đầy đủ | V4 | Thiếu địa chỉ hoặc rỗng | X5 |
| isDefault | `true` hoặc `false` | V5 | Không phải boolean | X6 |

### Output cần kiểm tra

Nếu địa chỉ hợp lệ, API trả về `201 Created` và address có `id`. Nếu input sai, API trả về `400 Bad Request`.

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
| fullName | `Receiver xxxx` | Chuỗi rỗng | `400 Bad Request` | B1 |
| phone | `0901234567` | `123` | `400 Bad Request` | B2 |
| line1 | `123 Test Street` | Chuỗi rỗng | `400 Bad Request` | B3 |
| city | `Ho Chi Minh` | Chuỗi rỗng | `400 Bad Request` | B4 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | AddAddress thành công | `POST /api/account/addresses` kèm token và body địa chỉ hợp lệ | `201 Created`, response có address id | Passed trong scenario Address CRUD | Pass | V1, V2, V3, V4, V5 |
| 2 | AddAddress thiếu dữ liệu bắt buộc | `POST /api/account/addresses` với fullName, line1, city rỗng | `400 Bad Request` | Passed | Pass | X3, X4, X5 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
const createRes = await I.sendPostRequest(
  "/api/account/addresses",
  createPayload,
  authHeaders(customer.token)
);

assertStatus(createRes, 201, "AddAddress thành công phải trả về 201");

Scenario("AddAddress thiếu dữ liệu bắt buộc phải trả về 400", async ({ I }) => {
  const customer = await registerNewCustomer(I);

  const res = await I.sendPostRequest(
    "/api/account/addresses",
    {
      fullName: "",
      phone: "123",
      line1: "",
      ward: "",
      district: "",
      city: "",
      isDefault: true,
    },
    authHeaders(customer.token)
  );

  assertStatus(res, 400, "AddAddress input không hợp lệ phải trả về 400");
});
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
