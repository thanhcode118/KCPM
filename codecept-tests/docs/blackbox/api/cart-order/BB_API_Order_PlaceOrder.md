# Black-box API Test - Order PlaceOrder

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/cart_order_api_test.js` |
| Function/API được test | `Order.PlaceOrder` |
| Method/Endpoint | `POST /api/orders hoặc POST /api/orders/place` |
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
| Cart | Giỏ hàng có sản phẩm | V2 | Giỏ hàng rỗng | X2 |
| addressId | Địa chỉ giao hàng tồn tại và thuộc user | V3 | addressId không tồn tại hoặc thuộc user khác | X3, X4 |
| paymentMethod | Phương thức thanh toán hợp lệ như COD | V4 | paymentMethod không hợp lệ | X5 |

### Output cần kiểm tra

API tạo đơn hàng từ giỏ hàng thành công khi user có token hợp lệ, giỏ hàng có sản phẩm và địa chỉ giao hàng hợp lệ.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.
Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| Cart | Có 1 sản phẩm | Giỏ hàng rỗng | `400 Bad Request` | B1 |
| addressId | id địa chỉ vừa tạo | `99999999` | `404 Not Found` hoặc `400` | B2 |
| paymentMethod | `COD` | `INVALID` | `400 Bad Request` | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Đặt hàng từ giỏ hàng thành công | User có token, giỏ hàng có sản phẩm, có địa chỉ giao hàng, paymentMethod=COD | `2xx` hoặc `201`, response có orderId hợp lệ | API tạo đơn hàng thành công và trả về orderId hợp lệ | Pass | V1, V2, V3, V4 |
| 2 | PlaceOrder khi giỏ hàng rỗng | `POST /api/orders` khi cart không có item | `400 Bad Request` | Chưa có trong file test hiện tại | Chưa kiểm thử | X2 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/cart_order_api_test.js`:

```javascript
Scenario("Order PlaceOrder: đặt hàng từ giỏ hàng thành công", async ({ I }) => {
  const fixture = await createOrderFixture(I);

  assert(fixture.orderId > 0, "Order PlaceOrder không trả về orderId hợp lệ");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | Authorization token: Token user hợp lệ | Đã có test case |
| V2 | Cart: Giỏ hàng có sản phẩm | Đã có test case |
| V3 | addressId: Địa chỉ giao hàng tồn tại và thuộc user | Đã có test case |
| V4 | paymentMethod: Phương thức thanh toán hợp lệ như COD | Đã có test case |
| X1 | Authorization token: Không có token hoặc token sai | Chưa có test case |
| X2 | Cart: Giỏ hàng rỗng | Chưa có test case |
| X3 | addressId: addressId không tồn tại hoặc thuộc user khác | Chưa có test case |
| X4 | addressId: addressId không tồn tại hoặc thuộc user khác | Chưa có test case |
| X5 | paymentMethod: paymentMethod không hợp lệ | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 9 |
| Số tag đã có test case | 4 |
| Tỷ lệ bao phủ theo tag | 44.44% |

Nhận xét:

API này hiện đã có test case cho 4/9 tag đã thiết kế, tương ứng 44.44%. Các tag chưa có test case riêng là: `X1, X2, X3, X4, X5`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.

### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---