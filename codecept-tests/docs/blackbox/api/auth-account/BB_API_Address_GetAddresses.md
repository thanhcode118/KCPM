# Black-box API Test - Address GetAddresses

## 1. Thông tin chung

| Nội dung | Giá trị |
|---|---|
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/auth_account_api_test.js` |
| Function/API được test | `Address.GetAddresses` |
| Method/Endpoint | `GET /api/account/addresses` |
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
| Dữ liệu địa chỉ của user | User có ít nhất 1 địa chỉ | V2 | User chưa có địa chỉ | X3 |

### Output cần kiểm tra

Nếu token hợp lệ, API trả về `2xx` và danh sách địa chỉ. Nếu không có token, API trả về `401 Unauthorized`.

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
| Danh sách địa chỉ | Có 1 địa chỉ sau khi vừa tạo | Không có địa chỉ | `2xx` với mảng rỗng | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | GetAddresses sau khi thêm địa chỉ | `GET /api/account/addresses` kèm token sau khi vừa AddAddress | `2xx`, danh sách có address vừa tạo | Passed trong scenario Address CRUD | Pass | V1, V2 |
| 2 | GetAddresses không token | `GET /api/account/addresses` không gửi token | `401 Unauthorized` | Chưa có trong file hiện tại | Chưa chạy | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/auth_account_api_test.js`:

```javascript
const listRes = await I.sendGetRequest(
  "/api/account/addresses",
  authHeaders(customer.token)
);

assert2xx(listRes, "GetAddresses phải thành công");

const addresses = extractArray(listRes.data);

assert(
  addresses.some((address) => Number(pick(address, "id", "Id")) === addressId),
  "Danh sách địa chỉ không có address vừa tạo"
);
```

### Kết luận

Function/API này đã được kiểm thử theo kiểu **Black-box API** vì test chỉ gửi request vào endpoint và kiểm tra response trả về.

---
