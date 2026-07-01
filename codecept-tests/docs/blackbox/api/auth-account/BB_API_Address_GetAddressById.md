# Black-box API Test - Address GetAddressById

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Address.GetAddressById` |
| Method/Endpoint | `GET /api/account/addresses/{id}` |
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
| addressId | ID địa chỉ tồn tại và thuộc user | V2 | ID không tồn tại, đã xóa hoặc thuộc user khác | X3, X4 |

### Output cần kiểm tra

Nếu địa chỉ tồn tại, API trả về `2xx` và thông tin address. Nếu địa chỉ không tồn tại hoặc đã xóa, API trả về `404 Not Found`.

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
| addressId | `id` vừa tạo | `id` đã xóa | `404 Not Found` | B1 |
| addressId | `id` hợp lệ | `99999999` | `404 Not Found` | B2 |
| Token | Token hợp lệ | Không gửi token | `401 Unauthorized` | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | GetAddressById sau khi xóa | `GET /api/account/addresses/{id}` với id đã bị xóa | `404 Not Found` | Passed trong scenario Address CRUD | Pass | X3 |
| 2 | GetAddressById hợp lệ | `GET /api/account/addresses/{id}` với id tồn tại | `2xx`, response có thông tin address | Chưa có trong file hiện tại | Chưa chạy | V2 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
const getDeletedRes = await I.sendGetRequest(
  `/api/account/addresses/${addressId}`,
  authHeaders(customer.token)
);

assertStatus(getDeletedRes, 404, "Địa chỉ đã xóa thì GetById phải trả về 404");
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
