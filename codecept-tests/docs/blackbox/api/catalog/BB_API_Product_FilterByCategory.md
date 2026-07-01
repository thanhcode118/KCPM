# Black-box API Test - Product Filter By Category

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.FilterByCategory` |
| Method/Endpoint | `GET /api/products?category={categoryName}` |
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
| category | Category tồn tại trong dữ liệu seed | V1 | Category không tồn tại | X1 |
| category | Category có sản phẩm | V2 | Category rỗng hoặc sai định dạng | X2 |

### Output cần kiểm tra

API trả về `2xx` và các sản phẩm thuộc đúng category được lọc.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| category | Category lấy từ sản phẩm seed | `unknown-category-xxxx` | `2xx` với danh sách rỗng | B1 |
| category | Category hợp lệ | Chuỗi rỗng | `2xx` hoặc danh sách mặc định | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Lọc sản phẩm theo danh mục | `GET /api/products?category={categoryName}&page=1&pageSize=50` | `2xx`, tất cả sản phẩm trả về thuộc đúng category | API trả về sản phẩm đúng category | Pass | V1, V2 |
| 2 | Lọc category không tồn tại | `GET /api/products?category=unknown-category-xxxx` | `2xx` với danh sách rỗng | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product Filter by category: lọc sản phẩm theo danh mục", async ({ I }) => {
  const seedProduct = await getSeedProduct(I);
  const categoryName = getProductCategory(seedProduct);

  const { products } = await getProductList(
    I,
    "?category=" + encodeURIComponent(categoryName) + "&page=1&pageSize=50"
  );

  assert(products.length > 0, "Filter category không trả về sản phẩm nào");

  for (const product of products) {
    assert.strictEqual(
      normalize(getProductCategory(product)),
      normalize(categoryName),
      "Sản phẩm trả về không thuộc category đang lọc"
    );
  }
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | category: Category tồn tại trong dữ liệu seed | Đã kiểm thử |
| V2 | category: Category có sản phẩm | Đã kiểm thử |
| X1 | category: Category không tồn tại | Chưa có test case |
| X2 | category: Category rỗng hoặc sai định dạng | Chưa có test case |

Kết quả:

| Nội dung | Giá trị |
| --- | --- |
| Tổng số tag cần kiểm thử | 4 |
| Số tag đã có test case | 2 |
| Tỷ lệ bao phủ theo tag | 50.00% |

Nhận xét:

API này hiện đã bao phủ được 2/4 tag đã thiết kế, tương ứng 50.00%. Các tag chưa có test case riêng là: `X1, X2`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.


### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---
