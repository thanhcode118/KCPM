# Bộ tài liệu Markdown cho catalog_api_test.js

## 1. Danh sách file theo từng function/API

| STT | File .md | Function/API | Tag đã có test case | Tỷ lệ |
| --- | --- | --- | --- | --- |
| 1 | `BB_API_Product_GetAll.md` | `Product.GetAll/Search` | 3/6 | 50.00% |
| 2 | `BB_API_Product_Search.md` | `Product.Search` | 2/4 | 50.00% |
| 3 | `BB_API_Product_FilterByCategory.md` | `Product.FilterByCategory` | 2/4 | 50.00% |
| 4 | `BB_API_Product_FilterByPrice.md` | `Product.FilterByPrice` | 3/6 | 50.00% |
| 5 | `BB_API_Product_Sort.md` | `Product.Sort` | 2/6 | 33.33% |
| 6 | `BB_API_Product_Paging.md` | `Product.Paging` | 4/8 | 50.00% |
| 7 | `BB_API_Product_GetById.md` | `Product.GetById` | 4/6 | 66.67% |
| 8 | `BB_API_Product_GetReviews.md` | `Product.GetReviews` | 3/6 | 50.00% |
| 9 | `BB_API_Product_AddReview.md` | `Product.AddReview` | 4/8 | 50.00% |
| 10 | `BB_API_Category_GetAll.md` | `Category.GetAll` | 3/6 | 50.00% |
| 11 | `BB_API_Category_GetById.md` | `Category.GetById` | 3/6 | 50.00% |

## 2. Tổng quan mức độ bao phủ

| Nội dung | Giá trị |
| --- | --- |
| Tổng số function/API | 11 |
| Tổng số tag cần kiểm thử | 66 |
| Tổng số tag đã có test case | 33 |
| Tỷ lệ bao phủ tag | 50.00% |

## 3. Ghi chú

Các file này dùng cho Black-box API Testing.

- Input là HTTP request gồm method, endpoint, query string, route parameter, token và body.
- Expected Output là status code và response body mong đợi.
- Actual Output sẽ được ghi là Pass nếu chạy script với `CATALOG_TEST_STATUS=passed`.
- Mức độ bao phủ trong tài liệu là mức độ bao phủ theo tag lớp tương đương, không phải code coverage.
