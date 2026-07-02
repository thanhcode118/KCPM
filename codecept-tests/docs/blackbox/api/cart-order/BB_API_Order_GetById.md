# Black-box API Test - Order GetById

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/cart_order_api_test.js` |
| Function/API được test | `Order.GetById` |
| Method/Endpoint | `GET /api/orders/{orderId}` |
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
| orderId | orderId tồn tại | V2 | orderId không tồn tại | X2 |
| Ownership | Đơn hàng thuộc user hiện tại | V3 | Đơn hàng thuộc user khác | X3 |

### Output cần kiểm tra

API trả về chi tiết đơn hàng nếu orderId tồn tại và thuộc user hiện tại. orderId không tồn tại hoặc không thuộc quyền truy cập phải bị từ chối phù hợp.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.
Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| orderId | id đơn vừa tạo | `99999999` | `404 Not Found` | B1 |
| orderId | id hợp lệ | `abc` | `400` hoặc `404` tùy route | B2 |
| Token | Token hợp lệ | Không gửi token | `401 Unauthorized` | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Xem chi tiết đơn hàng theo id | `GET /api/orders/{orderId}` với orderId vừa tạo và token của chủ đơn | `2xx`, response có orderId đúng | API trả về chi tiết đơn hàng đúng orderId | Pass | V1, V2, V3 |
| 2 | GetById với orderId không tồn tại | `GET /api/orders/99999999` | `404 Not Found` | Chưa có trong file test hiện tại | Chưa kiểm thử | X2 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/cart_order_api_test.js`:

```javascript
Scenario("Order GetById: xem chi tiết đơn hàng theo id", async ({ I }) => {
  const fixture = await createOrderFixture(I);

  const res = await getOrderById(I, fixture.customer.token, fixture.orderId);

  const order = extractObject(res.data, "order");

  assert.strictEqual(
    getOrderId(order),
    fixture.orderId,
    "Order GetById trả về orderId không đúng"
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
| V2 | orderId: orderId tồn tại | Đã có test case |
| V3 | Ownership: Đơn hàng thuộc user hiện tại | Đã có test case |
| X1 | Authorization token: Không có token hoặc token sai | Chưa có test case |
| X2 | orderId: orderId không tồn tại | Chưa có test case |
| X3 | Ownership: Đơn hàng thuộc user khác | Chưa có test case |

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