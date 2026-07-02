# Black-box API Test - Cart UpdateItem

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/cart_order_api_test.js` |
| Function/API được test | `Cart.UpdateItem` |
| Method/Endpoint | `PUT /api/cart/items/{cartItemId}` |
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
| cartItemId | cartItemId tồn tại trong giỏ hàng | V2 | Dùng productId thay cartItemId hoặc cartItemId không tồn tại | X2 |
| quantity | quantity >= 1 | V3 | quantity <= 0 hoặc vượt tồn kho | X3, X4 |

### Output cần kiểm tra

API cập nhật số lượng item trong giỏ hàng. Endpoint cần nhận đúng cartItemId và quantity hợp lệ. Sau khi cập nhật, quantity trong giỏ hàng phải thay đổi đúng.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.
Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| cartItemId | id item vừa thêm vào giỏ | productId hoặc id không tồn tại | `404 Not Found` | B1 |
| quantity | `2` | `0` | `400 Bad Request` | B2 |
| quantity | `2` | Vượt tồn kho | `400 Bad Request` | B3 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Cập nhật số lượng sản phẩm trong giỏ hàng | `PUT /api/cart/items/{cartItemId}` với quantity=2 | `2xx` hoặc `204`, item trong giỏ có quantity=2 | Test đang fail nếu truyền productId thay vì cartItemId. API trả `404 cart_item_not_found` | Fail | V1, V2, V3 |
| 2 | UpdateItem dùng id không tồn tại | `PUT /api/cart/items/99999999` | `404 Not Found` | Chưa có trong file test hiện tại | Chưa kiểm thử | X2 |
| 3 | UpdateItem quantity không hợp lệ | `PUT /api/cart/items/{cartItemId}` với quantity=0 | `400 Bad Request` | Chưa có trong file test hiện tại | Chưa kiểm thử | X3 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/cart_order_api_test.js`:

```javascript
Scenario("Cart UpdateItem: cập nhật số lượng sản phẩm trong giỏ hàng", async ({ I }) => {
  const customer = await registerCustomer(I);
  const product = await getSeedProduct(I);
  const productId = getProductId(product);

  await addCartItem(I, customer.token, productId, 1);
  await updateCartItem(I, customer.token, productId, 2);

  const cartRes = await getCurrentCart(I, customer.token);
  const items = getCartItems(cartRes.data);

  const updatedItem = items.find((item) => getCartItemProductId(item) === productId);

  assert(updatedItem, "Không tìm thấy sản phẩm sau khi update");
  assert.strictEqual(getCartItemQuantity(updatedItem), 2, "Số lượng sau khi update phải bằng 2");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | Authorization token: Token user hợp lệ | Đã có test case |
| V2 | cartItemId: cartItemId tồn tại trong giỏ hàng | Đã có test case |
| V3 | quantity: quantity >= 1 | Đã có test case |
| X1 | Authorization token: Không có token hoặc token sai | Chưa có test case |
| X2 | cartItemId: Dùng productId thay cartItemId hoặc cartItemId không tồn tại | Chưa có test case |
| X3 | quantity: quantity <= 0 hoặc vượt tồn kho | Chưa có test case |
| X4 | quantity: quantity <= 0 hoặc vượt tồn kho | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 7 |
| Số tag đã có test case | 3 |
| Tỷ lệ bao phủ theo tag | 42.86% |

Nhận xét:

API này hiện đã có test case cho 3/7 tag đã thiết kế, tương ứng 42.86%. Các tag chưa có test case riêng là: `X1, X2, X3, X4`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.

### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---