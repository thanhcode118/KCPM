# Black-box API Test - Address UpdateAddress

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Address.UpdateAddress` |
| Method/Endpoint | `PUT /api/account/addresses/{id}` |
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
| addressId | ID địa chỉ tồn tại và thuộc user | V2 | ID không tồn tại hoặc thuộc user khác | X3, X4 |
| fullName/phone/address | Thông tin cập nhật hợp lệ | V3 | Thông tin rỗng hoặc sai định dạng | X5 |

### Output cần kiểm tra

Nếu input hợp lệ, API trả về `2xx` và address đã cập nhật. Nếu id không tồn tại trả `404`, nếu body sai trả `400`.

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
| addressId | `id` vừa tạo | `99999999` | `404 Not Found` | B1 |
| fullName | `Updated Receiver` | Chuỗi rỗng | `400 Bad Request` | B2 |
| phone | `0999999999` | `123` | `400 Bad Request` | B3 |
| city | `Ha Noi` | Chuỗi rỗng | `400 Bad Request` | B4 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | UpdateAddress thành công | `PUT /api/account/addresses/{id}` với id vừa tạo và body hợp lệ | `2xx`, city và fullName được cập nhật đúng | Passed trong scenario Address CRUD | Pass | V1, V2, V3 |
| 2 | UpdateAddress id không tồn tại | `PUT /api/account/addresses/99999999` | `404 Not Found` | Chưa có trong file hiện tại | Chưa chạy | X3 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
const updateRes = await I.sendPutRequest(
  `/api/account/addresses/${addressId}`,
  updatePayload,
  authHeaders(customer.token)
);

assert2xx(updateRes, "UpdateAddress phải thành công");

const updatedAddress = getAddress(updateRes.data);

assert.strictEqual(
  pick(updatedAddress, "city", "City"),
  updatePayload.city,
  "City sau khi update address không đúng"
);
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
