# Black-box API Test - Product Filter By Price

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.FilterByPrice` |
| Method/Endpoint | `GET /api/products?minPrice={minPrice}&maxPrice={maxPrice}` |
| Công cụ | CodeceptJS REST helper |
| Lệnh chạy | `npm run test:be:catalog` |
| Kết quả chạy thực tế | `Đã chạy catalog_api_test.js và các scenario pass` |

## 2. Mục tiêu kiểm thử

Tài liệu này mô tả cách kiểm thử API từ bên ngoài thông qua HTTP request và HTTP response.

Với nhóm Catalog, input thường là query string, route parameter, token đăng nhập hoặc request body.  
Output cần kiểm tra là status code, danh sách dữ liệu, chi tiết dữ liệu hoặc thông báo lỗi tương ứng.

---

# NỘI DUNG THIẾT KẾ KIỂM THỬ API

---

## 1. Xác định lớp tương đương

| Biến đầu vào | Lớp hợp lệ | Tag | Lớp không hợp lệ | Tag |
| --- | --- | --- | --- | --- |
| minPrice | minPrice là số >= 0 | V1 | minPrice âm hoặc sai định dạng | X1 |
| maxPrice | maxPrice >= minPrice | V2 | maxPrice nhỏ hơn minPrice | X2 |
| price range | Khoảng giá khớp sản phẩm seed | V3 | Khoảng giá không có sản phẩm | X3 |

### Output cần kiểm tra

API trả về `2xx` và chỉ gồm sản phẩm có giá nằm trong khoảng lọc.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| minPrice | Giá sản phẩm seed | `-1` | `400` hoặc xử lý an toàn | B1 |
| maxPrice | Giá sản phẩm seed | Nhỏ hơn minPrice | `400` hoặc danh sách rỗng | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lọc sản phẩm theo khoảng giá | `GET /api/products?minPrice={price}&maxPrice={price}` | `2xx`, sản phẩm trả về nằm trong khoảng giá | API trả về sản phẩm đúng khoảng giá | Pass | V1, V2, V3 |
| 2 | Khoảng giá không hợp lệ | `GET /api/products?minPrice=100000&maxPrice=1` | `400` hoặc danh sách rỗng | Chưa có trong file test hiện tại | Chưa kiểm thử | X2 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product Filter by price: lọc sản phẩm theo khoảng giá", async ({ I }) => {
  const seedProduct = await getSeedProduct(I);
  const price = getProductPrice(seedProduct);

  const { products } = await getProductList(
    I,
    "?minPrice=" + price + "&maxPrice=" + price + "&page=1&pageSize=50"
  );

  assert(products.length > 0, "Filter theo giá không trả về sản phẩm nào");

  for (const product of products) {
    const productPrice = getProductPrice(product);
    assert(productPrice >= price && productPrice <= price, "Sản phẩm nằm ngoài khoảng giá");
  }
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | minPrice: minPrice là số >= 0 | Đã kiểm thử |
| V2 | maxPrice: maxPrice >= minPrice | Đã kiểm thử |
| V3 | price range: Khoảng giá khớp sản phẩm seed | Đã kiểm thử |
| X1 | minPrice: minPrice âm hoặc sai định dạng | Chưa có test case |
| X2 | maxPrice: maxPrice nhỏ hơn minPrice | Chưa có test case |
| X3 | price range: Khoảng giá không có sản phẩm | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 6 |
| Số tag đã có test case | 3 |
| Tỷ lệ bao phủ theo tag | 50.00% |

Nhận xét:

API này hiện đã bao phủ được 3/6 tag đã thiết kế, tương ứng 50.00%. Các tag chưa có test case riêng là: `X1, X2, X3`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.


### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---
