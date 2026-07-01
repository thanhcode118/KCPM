# Black-box API Test - Cart Clear

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/cart_order_api_test.js` |
| Function/API được test | `Cart.Clear` |
| Method/Endpoint | `DELETE /api/cart/clear hoặc POST /api/cart/clear` |
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
| Cart state | Giỏ hàng có sản phẩm | V2 | Giỏ hàng đã rỗng | X2 |
| Clear result | Sau khi clear, items rỗng | V3 | Sau khi clear vẫn còn items | X3 |

### Output cần kiểm tra

API xóa toàn bộ giỏ hàng của user. Sau khi clear, danh sách items trong giỏ hàng phải rỗng.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.
Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| Cart items | Có ít nhất 1 item | 0 item | `2xx` và vẫn rỗng | B1 |
| Token | Token hợp lệ | Không gửi token | `401 Unauthorized` | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Xóa toàn bộ giỏ hàng | Thêm sản phẩm vào giỏ rồi gọi API clear cart | `2xx` hoặc `204`, giỏ hàng sau khi clear có items rỗng | API clear cart thành công và giỏ hàng rỗng | Pass | V1, V2, V3 |
| 2 | Clear cart khi không có token | Gọi API clear cart không gửi token | `401 Unauthorized` | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/cart_order_api_test.js`:

```javascript
Scenario("Cart Clear: xóa toàn bộ giỏ hàng", async ({ I }) => {
  const customer = await registerCustomer(I);
  const product = await getSeedProduct(I);
  const productId = getProductId(product);

  await addCartItem(I, customer.token, productId, 1);
  await clearCart(I, customer.token);

  const cartRes = await getCurrentCart(I, customer.token);
  const items = getCartItems(cartRes.data);

  assert.strictEqual(items.length, 0, "Giỏ hàng sau khi clear phải rỗng");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | Authorization token: Token user hợp lệ | Đã có test case |
| V2 | Cart state: Giỏ hàng có sản phẩm | Đã có test case |
| V3 | Clear result: Sau khi clear, items rỗng | Đã có test case |
| X1 | Authorization token: Không có token hoặc token sai | Chưa có test case |
| X2 | Cart state: Giỏ hàng đã rỗng | Chưa có test case |
| X3 | Clear result: Sau khi clear vẫn còn items | Chưa có test case |

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