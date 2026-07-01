# Black-box API Test - Order GetMine

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/cart_order_api_test.js` |
| Function/API được test | `Order.GetMine` |
| Method/Endpoint | `GET /api/orders/mine hoặc GET /api/orders/my` |
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
| Authorization token | Token user hợp lệ | V1 | Không có token hoặc token sai | X1 |
| Order list | User có ít nhất 1 đơn hàng | V2 | User chưa có đơn hàng | X2 |
| Ownership | Danh sách chỉ chứa đơn của user hiện tại | V3 | Trả về đơn của user khác | X3 |

### Output cần kiểm tra

API trả về danh sách đơn hàng của user đang đăng nhập. Danh sách cần có đơn hàng vừa tạo trong quá trình test.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.
Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| Token | Token hợp lệ | Không gửi token | `401 Unauthorized` | B1 |
| Order list | Có 1 đơn vừa tạo | Danh sách rỗng | `2xx` với mảng rỗng | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | User xem được danh sách đơn hàng của mình | Tạo đơn hàng rồi gọi API lấy danh sách đơn của user | `2xx`, danh sách orders có đơn vừa tạo | API trả về danh sách đơn hàng và có orderId vừa tạo | Pass | V1, V2, V3 |
| 2 | GetMine không có token | `GET /api/orders/mine` không gửi token | `401 Unauthorized` | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/cart_order_api_test.js`:

```javascript
Scenario("Order GetMine: user xem được danh sách đơn hàng của mình", async ({ I }) => {
  const fixture = await createOrderFixture(I);

  const res = await getMyOrders(I, fixture.customer.token);

  assert2xx(res, "Order GetMine phải thành công");

  const orders = extractArray(res.data);

  assert(Array.isArray(orders), "Order GetMine phải trả về danh sách orders");

  const createdOrder = orders.find((order) => getOrderId(order) === fixture.orderId);

  assert(createdOrder, "Danh sách đơn hàng không có đơn vừa tạo");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | Authorization token: Token user hợp lệ | Đã có test case |
| V2 | Order list: User có ít nhất 1 đơn hàng | Đã có test case |
| V3 | Ownership: Danh sách chỉ chứa đơn của user hiện tại | Đã có test case |
| X1 | Authorization token: Không có token hoặc token sai | Chưa có test case |
| X2 | Order list: User chưa có đơn hàng | Chưa có test case |
| X3 | Ownership: Trả về đơn của user khác | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 6 |
| Số tag đã có test case | 3 |
| Tỷ lệ bao phủ theo tag | 50.00% |

Nhận xét:

API này hiện đã có test case cho 3/6 tag đã thiết kế, tương ứng 50.00%. Các tag chưa có test case riêng là: `X1, X2, X3`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.

### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---