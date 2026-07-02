# Black-box API Test - Product Search

## 1. Thông tin chung

| Nội dung | Giá trị |
| --- | --- |
| Nhóm test | Black-box BE/API |
| File test tự động | `codecept-tests/tests/be/catalog_api_test.js` |
| Function/API được test | `Product.Search` |
| Method/Endpoint | `GET /api/products?q={keyword}` |
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
| q | Keyword có tồn tại trong dữ liệu sản phẩm | V1 | Keyword không khớp sản phẩm nào | X1 |
| q | Keyword đúng định dạng | V2 | Keyword rỗng hoặc chỉ có khoảng trắng | X2 |

### Output cần kiểm tra

API trả về `2xx` và danh sách sản phẩm khớp keyword. Nếu keyword không tồn tại thì không được crash.

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

| Biến đầu vào | Giá trị hợp lệ đại diện | Giá trị biên / giá trị lỗi | Expected Output | Tag biên |
| --- | --- | --- | --- | --- |
| q | Keyword lấy từ sản phẩm seed | `not-found-keyword-xxxx` | `2xx` với danh sách rỗng | B1 |
| q | `den` | Chuỗi rỗng | `2xx` hoặc danh sách mặc định | B2 |

---

## 3. Thiết kế test case

| STT | Tên test case | Input | Expected Output | Actual Output | Kết quả | Tag được bao phủ |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Tìm kiếm sản phẩm theo keyword | `GET /api/products?q={keyword}&page=1&pageSize=50` | `2xx`, có ít nhất một sản phẩm khớp keyword | API trả về sản phẩm khớp keyword | Pass | V1, V2 |
| 2 | Tìm kiếm keyword không tồn tại | `GET /api/products?q=not-found-keyword-xxxx` | `2xx` với danh sách rỗng | Chưa có trong file test hiện tại | Chưa kiểm thử | X1 |

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong `codecept-tests/tests/be/catalog_api_test.js`:

```javascript
Scenario("Product Search by keyword: tìm kiếm sản phẩm theo keyword", async ({ I }) => {
  const seedProduct = await getSeedProduct(I);
  const keyword = findSearchKeyword(seedProduct);

  const { products } = await getProductList(
    I,
    "?q=" + encodeURIComponent(keyword) + "&page=1&pageSize=50"
  );

  assert(products.length > 0, "Search keyword không trả về sản phẩm nào");

  assert(
    products.some((product) => productMatchesKeyword(product, keyword)),
    "Không có sản phẩm nào khớp keyword"
  );
});
```

---

## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

| Tag | Trường hợp kiểm thử | Trạng thái |
| --- | --- | --- |
| V1 | q: Keyword có tồn tại trong dữ liệu sản phẩm | Đã kiểm thử |
| V2 | q: Keyword đúng định dạng | Đã kiểm thử |
| X1 | q: Keyword không khớp sản phẩm nào | Chưa có test case |
| X2 | q: Keyword rỗng hoặc chỉ có khoảng trắng | Chưa có test case |

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
