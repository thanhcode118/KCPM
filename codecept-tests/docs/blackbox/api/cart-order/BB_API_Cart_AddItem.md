# Black-box API Test - Cart AddItem

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/cart_order_api_test.js` |
| Function/API được test | `Cart.AddItem` |
| Method/Endpoint | `POST /api/cart/items hoặc POST /api/cart/add` |
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
| productId | Sản phẩm tồn tại | V2 | Sản phẩm không tồn tại | X2 |
| quantity | quantity >= 1 | V3 | quantity <= 0 hoặc sai định dạng | X3 |
| stock | Sản phẩm còn hàng | V4 | Số lượng thêm vượt tồn kho | X4 |

### Output cần kiểm tra

API thêm sản phẩm vào giỏ hàng thành công khi token, productId và quantity hợp lệ. Sau khi thêm, giỏ hàng phải có sản phẩm vừa thêm.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.
Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| quantity | `1` | `0` | `400 Bad Request` | B1 |
| quantity | `1` | `-1` | `400 Bad Request` | B2 |
| productId | id sản phẩm seed | `99999999` | `404 Not Found` | B3 |
| Token | Token hợp lệ | Không gửi token | `401 Unauthorized` | B4 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Thêm sản phẩm vào giỏ hàng thành công | `POST /api/cart/items` với token hợp lệ, productId tồn tại, quantity=1 | `2xx` hoặc `201`, giỏ hàng có sản phẩm vừa thêm | API thêm sản phẩm thành công và giỏ hàng có item tương ứng | Pass | V1, V2, V3, V4 |
| 2 | AddItem productId không tồn tại | `POST /api/cart/items` với productId=99999999 | `404 Not Found` | Chưa có trong file test hiện tại | Chưa kiểm thử | X2 |
| 3 | AddItem quantity không hợp lệ | `POST /api/cart/items` với quantity=0 | `400 Bad Request` | Chưa có trong file test hiện tại | Chưa kiểm thử | X3 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/cart_order_api_test.js`:

```javascript
Scenario("Cart AddItem: thêm sản phẩm vào giỏ hàng thành công", async ({ I }) => {
  const customer = await registerCustomer(I);
  const product = await getSeedProduct(I);
  const productId = getProductId(product);

  await addCartItem(I, customer.token, productId, 1);

  const cartRes = await getCurrentCart(I, customer.token);
  const items = getCartItems(cartRes.data);

  const addedItem = items.find((item) => getCartItemProductId(item) === productId);

  assert(addedItem, "Giỏ hàng không có sản phẩm vừa thêm");
  assert(getCartItemQuantity(addedItem) >= 1, "Số lượng sản phẩm trong giỏ phải >= 1");
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | Authorization token: Token user hợp lệ | Đã có test case |
| V2 | productId: Sản phẩm tồn tại | Đã có test case |
| V3 | quantity: quantity >= 1 | Đã có test case |
| V4 | stock: Sản phẩm còn hàng | Đã có test case |
| X1 | Authorization token: Không có token hoặc token sai | Chưa có test case |
| X2 | productId: Sản phẩm không tồn tại | Chưa có test case |
| X3 | quantity: quantity <= 0 hoặc sai định dạng | Chưa có test case |
| X4 | stock: Số lượng thêm vượt tồn kho | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 8 |
| Số tag đã có test case | 4 |
| Tỷ lệ bao phủ theo tag | 50.00% |

Nhận xét:

API này hiện đã có test case cho 4/8 tag đã thiết kế, tương ứng 50.00%. Các tag chưa có test case riêng là: `X1, X2, X3, X4`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.

### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---