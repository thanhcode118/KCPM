# Black-box API Test - Order RequestRefund

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/cart_order_api_test.js` |
| Function/API được test | `Order.RequestRefund` |
| Method/Endpoint | `POST /api/orders/{orderId}/refund hoặc request-refund` |
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
| orderId | orderId tồn tại và thuộc user | V2 | orderId không tồn tại hoặc thuộc user khác | X2, X3 |
| Order status | Trạng thái đơn cho phép yêu cầu hoàn tiền | V3 | Trạng thái đơn chưa đủ điều kiện hoàn tiền | X4 |
| reason | Lý do hoàn tiền hợp lệ | V4 | Lý do rỗng nếu hệ thống bắt buộc | X5 |

### Output cần kiểm tra

API xử lý yêu cầu hoàn tiền. Với đơn mới tạo, hệ thống có thể cho tạo yêu cầu hoàn tiền hoặc từ chối theo nghiệp vụ nếu trạng thái đơn chưa phù hợp.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.
Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| orderId | id đơn vừa tạo | `99999999` | `404 Not Found` | B1 |
| Order status | Đơn đủ điều kiện refund | Đơn mới tạo/chưa thanh toán | `400` hoặc `409` | B2 |
| reason | Chuỗi hợp lệ | Chuỗi rỗng | `400` nếu bắt buộc | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Gửi yêu cầu hoàn tiền cho đơn hàng | Tạo đơn hàng rồi gọi API request refund với reason hợp lệ | `2xx` nếu hợp lệ hoặc `400/409` nếu nghiệp vụ chưa cho refund ở trạng thái hiện tại | API trả về status hợp lệ theo nghiệp vụ refund | Pass | V1, V2, V4, X4 |
| 2 | RequestRefund orderId không tồn tại | `POST /api/orders/99999999/refund` | `404 Not Found` | Chưa có trong file test hiện tại | Chưa kiểm thử | X2 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/cart_order_api_test.js`:

```javascript
Scenario("Order RequestRefund: gửi yêu cầu hoàn tiền cho đơn hàng", async ({ I }) => {
  const fixture = await createOrderFixture(I);

  const res = await requestRefund(I, fixture.customer.token, fixture.orderId);

  assertStatusIn(
    res,
    [200, 201, 202, 204, 400, 409],
    "RequestRefund phải trả về status hợp lệ"
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
| V2 | orderId: orderId tồn tại và thuộc user | Đã có test case |
| V3 | Order status: Trạng thái đơn cho phép yêu cầu hoàn tiền | Chưa có test case |
| V4 | reason: Lý do hoàn tiền hợp lệ | Đã có test case |
| X1 | Authorization token: Không có token hoặc token sai | Chưa có test case |
| X2 | orderId: orderId không tồn tại hoặc thuộc user khác | Chưa có test case |
| X3 | orderId: orderId không tồn tại hoặc thuộc user khác | Chưa có test case |
| X4 | Order status: Trạng thái đơn chưa đủ điều kiện hoàn tiền | Đã có test case |
| X5 | reason: Lý do rỗng nếu hệ thống bắt buộc | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 9 |
| Số tag đã có test case | 4 |
| Tỷ lệ bao phủ theo tag | 44.44% |

Nhận xét:

API này hiện đã có test case cho 4/9 tag đã thiết kế, tương ứng 44.44%. Các tag chưa có test case riêng là: `V3, X1, X2, X3, X5`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.

### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---