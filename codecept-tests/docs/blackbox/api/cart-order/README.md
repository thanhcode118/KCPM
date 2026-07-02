# Bộ tài liệu Markdown cho cart_order_api_test.js

## 1. Danh sách file theo từng function/API

| STT | File .md | Function/API | Tag đã có test case | Tỷ lệ |
| --- | --- | --- | --- | --- |
| 1 | `BB_API_Cart_GetCurrent.md` | `Cart.GetCurrent` | 5/5 | 100.00% |
| 2 | `BB_API_Cart_AddItem.md` | `Cart.AddItem` | 4/8 | 50.00% |
| 3 | `BB_API_Cart_UpdateItem.md` | `Cart.UpdateItem` | 3/7 | 42.86% |
| 4 | `BB_API_Cart_RemoveItem.md` | `Cart.RemoveItem` | 3/6 | 50.00% |
| 5 | `BB_API_Cart_Clear.md` | `Cart.Clear` | 3/6 | 50.00% |
| 6 | `BB_API_Order_PlaceOrder.md` | `Order.PlaceOrder` | 4/9 | 44.44% |
| 7 | `BB_API_Order_GetMine.md` | `Order.GetMine` | 3/6 | 50.00% |
| 8 | `BB_API_Order_GetById.md` | `Order.GetById` | 3/6 | 50.00% |
| 9 | `BB_API_Order_Cancel.md` | `Order.Cancel` | 4/9 | 44.44% |
| 10 | `BB_API_Order_RequestRefund.md` | `Order.RequestRefund` | 4/9 | 44.44% |

## 2. Tổng quan mức độ bao phủ

| Nội dung | Giá trị |
| --- | --- |
| Tổng số function/API | 10 |
| Tổng số test case đã có trong file test | 12 |
| Tổng số tag cần kiểm thử | 71 |
| Tổng số tag đã có test case | 36 |
| Tỷ lệ bao phủ tag | 50.70% |

## 3. Ghi chú

Các file này dùng cho Black-box API Testing.

- Input là HTTP request gồm method, endpoint, token, route parameter và body.
- Expected Output là status code và response body mong đợi.
- Actual Output sẽ được ghi là Pass nếu chạy script với `CART_ORDER_TEST_STATUS=passed`.
- Nếu đang có scenario fail, có thể truyền `CART_ORDER_TEST_STATUS=failed` và `CART_ORDER_FAILED=Cart UpdateItem` để tài liệu ghi rõ test case đang fail.
- Mức độ bao phủ trong tài liệu là mức độ bao phủ theo tag lớp tương đương, không phải code coverage.