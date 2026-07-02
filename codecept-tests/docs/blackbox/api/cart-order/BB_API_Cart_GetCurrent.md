# Black-box API Test - Cart GetCurrent

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/cart_order_api_test.js` |
| Function/API được test | `Cart.GetCurrent` |
| Method/Endpoint | `GET /api/cart hoặc GET /api/cart/current` |
| Công cụ | CodeceptJS REST helper |
| Lệnh chạy | `npm run test:be:cart-order` |
| Kết quả chạy thực tế | `9 passed, 1 failed` |

## 2. Mục tiêu kiểm thử

Tài liệu này mô tả cách kiểm thử API từ bên ngoài thông qua HTTP request và HTTP response.

Với nhóm Cart/Order, input thường là token đăng nhập, productId, cartItemId, quantity, addressId hoặc orderId.
Output cần kiểm tra là status code, dữ liệu giỏ hàng, dữ liệu đơn hàng hoặc lỗi nghiệp vụ tương ứng.

---

# NỘI DUNG THIẾT KẾ KIỂM THỬ API

---

## 1. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
| --- | --- | --- | --- | --- |
| Authorization token | Token user hợp lệ | V1 | Không có token hoặc token sai | X1, X2 |
| Cart state | Giỏ hàng rỗng hoặc có sản phẩm đều xử lý được | V2 | Response không có cấu trúc items hợp lệ | X3 |

### Output cần kiểm tra

API trả về `2xx` và dữ liệu giỏ hàng hiện tại của user nếu token hợp lệ. Response cần có danh sách items, có thể rỗng nếu user chưa thêm sản phẩm.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.
Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| Token | Token customer vừa đăng ký | Không gửi token | `401 Unauthorized` | B1 |
| Token | Token hợp lệ | `invalid-token` | `401 Unauthorized` | B2 |
| Items | Array rỗng hoặc có phần tử | Không phải array | Test fail | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | User đăng nhập xem được giỏ hàng hiện tại | `GET /api/cart` hoặc `GET /api/cart/current` kèm token hợp lệ | `2xx`, response có danh sách items | API trả về giỏ hàng hiện tại và items là danh sách hợp lệ | Pass | V1, V2, X3 |
| 2 | GetCurrent không có token | `GET /api/cart` không gửi token | `401 Unauthorized` | API trả về `401 Unauthorized` khi không gửi token | Pass | X1 |
| 3 | GetCurrent token sai | `GET /api/cart` với token không hợp lệ | `401 Unauthorized` | API trả về `401 Unauthorized` khi gửi token sai | Pass | X2 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/cart_order_api_test.js`:

```javascript
Scenario("Cart GetCurrent: user đăng nhập xem được giỏ hàng hiện tại", async ({ I }) => {
  const customer = await registerCustomer(I);

  const res = await getCurrentCart(I, customer.token);

  assert2xx(res, "Cart GetCurrent phải thành công");

  const items = getCartItems(res.data);

  assert(Array.isArray(items), "Cart GetCurrent phải trả về danh sách items");
});

Scenario("Cart GetCurrent: không gửi token phải trả về 401", async ({ I }) => {
  const res = await I.sendGetRequest("/api/cart");

  assertStatus(
    res,
    401,
    "Cart GetCurrent không gửi token phải trả về 401"
  );
});

Scenario("Cart GetCurrent: token sai phải trả về 401", async ({ I }) => {
  const invalidToken = `invalid-token-${uniqueSuffix()}`;

  const res = await I.sendGetRequest(
    "/api/cart",
    authHeaders(invalidToken)
  );

  assertStatus(
    res,
    401,
    "Cart GetCurrent dùng token sai phải trả về 401"
  );
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | Authorization token: Token user hợp lệ | Đã có test case |
| V2 | Cart state: Giỏ hàng rỗng hoặc có sản phẩm đều xử lý được | Đã có test case |
| X1 | Authorization token: Không có token hoặc token sai | Đã có test case |
| X2 | Authorization token: Không có token hoặc token sai | Đã có test case |
| X3 | Cart state: Response không có cấu trúc items hợp lệ | Đã có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 5 |
| Số tag đã có test case | 5 |
| Tỷ lệ bao phủ theo tag | 100.00% |

Nhận xét:

API này hiện đã có test case cho 5/5 tag đã thiết kế, tương ứng 100.00%. Các tag đã thiết kế đều đã có test case tương ứng trong file test.

### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---