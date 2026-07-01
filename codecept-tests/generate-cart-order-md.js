const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "docs", "blackbox", "api", "cart-order");

const TEST_FILE = "codecept-tests/tests/be/cart_order_api_test.js";
const RUN_CMD = "npm run test:be:cart-order";

const TEST_STATUS = String(
  process.env.CART_ORDER_TEST_STATUS || "",
).toLowerCase();

const IS_TEST_PASSED = ["pass", "passed", "ok"].includes(TEST_STATUS);
const IS_TEST_FAILED = ["fail", "failed", "partial"].includes(TEST_STATUS);

const FAILED_SCENARIOS = String(process.env.CART_ORDER_FAILED || "")
  .split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

const RUN_RESULT =
  process.env.CART_ORDER_RUN_RESULT ||
  (IS_TEST_PASSED
    ? "Đã chạy cart_order_api_test.js và các scenario pass"
    : IS_TEST_FAILED
      ? "Đã chạy cart_order_api_test.js nhưng còn scenario fail"
      : "Chưa cập nhật kết quả chạy thực tế");

fs.mkdirSync(OUT_DIR, { recursive: true });

function inlineCode(value) {
  return "`" + value + "`";
}

function cell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function table(headers, rows) {
  return [
    "| " + headers.map(cell).join(" | ") + " |",
    "| " + headers.map(() => "---").join(" | ") + " |",
    ...rows.map((row) => "| " + row.map(cell).join(" | ") + " |"),
  ].join("\n");
}

function extractTags(text) {
  const result = new Set();
  const regex = /\b[VX]\d+\b/g;
  let match;

  while ((match = regex.exec(String(text || ""))) !== null) {
    result.add(match[0]);
  }

  return [...result];
}

function percent(covered, total) {
  if (!total) return "0.00%";
  return ((covered / total) * 100).toFixed(2) + "%";
}

function getTargetTags(doc) {
  const tags = new Set();

  for (const row of doc.equivalence) {
    extractTags(row[2]).forEach((tag) => tags.add(tag));
    extractTags(row[4]).forEach((tag) => tags.add(tag));
  }

  return [...tags].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

function getCoveredTags(doc) {
  const tags = new Set();

  for (const tc of doc.testCases) {
    if (!tc.implemented) continue;
    extractTags(tc.tags).forEach((tag) => tags.add(tag));
  }

  return [...tags].sort((a, b) => a.localeCompare(b, "en", { numeric: true }));
}

function getTagMeaningMap(doc) {
  const map = {};

  for (const row of doc.equivalence) {
    const inputName = row[0];

    for (const tag of extractTags(row[2])) {
      map[tag] = inputName + ": " + row[1];
    }

    for (const tag of extractTags(row[4])) {
      map[tag] = inputName + ": " + row[3];
    }
  }

  return map;
}

function isFailedTestCase(tc) {
  if (!IS_TEST_FAILED) return false;
  if (!FAILED_SCENARIOS.length) return false;

  const name = String(tc.name || "").toLowerCase();
  const key = String(tc.statusKey || "").toLowerCase();

  return FAILED_SCENARIOS.some(
    (failed) => name.includes(failed) || key.includes(failed),
  );
}

function actualOutput(tc) {
  if (!tc.implemented) {
    return "Chưa có trong file test hiện tại";
  }

  if (isFailedTestCase(tc)) {
    return (
      tc.actualFailed ||
      "Test case đang fail, cần kiểm tra lại endpoint hoặc dữ liệu test"
    );
  }

  if (IS_TEST_PASSED || IS_TEST_FAILED) {
    return tc.actualPassed || "API trả về đúng như Expected Output";
  }

  return "Chưa cập nhật kết quả chạy";
}

function resultText(tc) {
  if (!tc.implemented) return "Chưa kiểm thử";
  if (isFailedTestCase(tc)) return "Fail";
  if (IS_TEST_PASSED || IS_TEST_FAILED) return "Pass";
  return "Chưa cập nhật";
}

function renderCoverage(doc) {
  const targetTags = getTargetTags(doc);
  const coveredTags = getCoveredTags(doc);
  const coveredSet = new Set(coveredTags);
  const meaningMap = getTagMeaningMap(doc);

  const tagRows = targetTags.map((tag) => [
    tag,
    meaningMap[tag] || "Trường hợp đầu vào đã thiết kế",
    coveredSet.has(tag) ? "Đã có test case" : "Chưa có test case",
  ]);

  const missingTags = targetTags.filter((tag) => !coveredSet.has(tag));

  const note = missingTags.length
    ? "Các tag chưa có test case riêng là: `" +
      missingTags.join(", ") +
      "`. Có thể bổ sung thêm sau để tăng mức độ bao phủ."
    : "Các tag đã thiết kế đều đã có test case tương ứng trong file test.";

  return [
    "## 5. Mức độ bao phủ",
    "",
    "Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.",
    "Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.",
    "",
    table(["Tag", "Trường hợp kiểm thử", "Trạng thái"], tagRows),
    "",
    "Kết quả:",
    "",
    table(
      ["Nội dung", "Giá trị"],
      [
        ["Tổng số tag cần kiểm thử", targetTags.length],
        ["Số tag đã có test case", coveredTags.length],
        [
          "Tỷ lệ bao phủ theo tag",
          percent(coveredTags.length, targetTags.length),
        ],
      ],
    ),
    "",
    "Nhận xét:",
    "",
    "API này hiện đã có test case cho " +
      coveredTags.length +
      "/" +
      targetTags.length +
      " tag đã thiết kế, tương ứng " +
      percent(coveredTags.length, targetTags.length) +
      ". " +
      note,
  ].join("\n");
}

function renderDoc(doc) {
  const rows = doc.testCases.map((tc, index) => [
    index + 1,
    tc.name,
    tc.input,
    tc.expected,
    actualOutput(tc),
    resultText(tc),
    tc.tags,
  ]);

  return [
    "# " + doc.title,
    "",
    "## 1. Thông tin chung",
    "",
    table(
      ["Nội dung", "Giá trị"],
      [
        ["Nhóm test", "Black-box BE/API"],
        ["File test tự động", inlineCode(TEST_FILE)],
        ["Function/API được test", inlineCode(doc.functionName)],
        ["Method/Endpoint", inlineCode(doc.endpoint)],
        ["Công cụ", "CodeceptJS REST helper"],
        ["Lệnh chạy", inlineCode(RUN_CMD)],
        ["Kết quả chạy thực tế", inlineCode(RUN_RESULT)],
      ],
    ),
    "",
    "## 2. Mục tiêu kiểm thử",
    "",
    "Tài liệu này mô tả cách kiểm thử API từ bên ngoài thông qua HTTP request và HTTP response.",
    "",
    "Với nhóm Cart/Order, input thường là token đăng nhập, productId, cartItemId, quantity, addressId hoặc orderId.",
    "Output cần kiểm tra là status code, dữ liệu giỏ hàng, dữ liệu đơn hàng hoặc lỗi nghiệp vụ tương ứng.",
    "",
    "---",
    "",
    "# NỘI DUNG THIẾT KẾ KIỂM THỬ API",
    "",
    "---",
    "",
    "## 1. Xác định lớp tương đương",
    "",
    table(
      ["Biến đầu vào", "Lớp hợp lệ", "Tag", "Lớp không hợp lệ", "Tag"],
      doc.equivalence,
    ),
    "",
    "### Output cần kiểm tra",
    "",
    doc.output,
    "",
    "---",
    "",
    "## 2. Phân tích giá trị biên / biên dữ liệu API",
    "",
    "Với nhóm API Cart/Order, một số input là số như `quantity`, `productId`, `cartItemId`, `addressId`, `orderId`.",
    "Một số input khác là token hoặc trạng thái nghiệp vụ nên được kiểm tra theo hướng thiếu token, sai token, id không tồn tại hoặc trạng thái đơn không phù hợp.",
    "",
    table(
      [
        "Biến đầu vào",
        "Giá trị hợp lệ đại diện",
        "Giá trị biên / giá trị lỗi",
        "Expected Output",
        "Tag biên",
      ],
      doc.boundary,
    ),
    "",
    "---",
    "",
    "## 3. Thiết kế test case",
    "",
    table(
      [
        "STT",
        "Tên test case",
        "Input",
        "Expected Output",
        "Actual Output",
        "Kết quả",
        "Tag được bao phủ",
      ],
      rows,
    ),
    "",
    "---",
    "",
    "## 4. Mã kiểm thử tự động",
    "",
    "Đoạn kiểm thử tương ứng trong `" + TEST_FILE + "`:",
    "",
    "```javascript",
    doc.code.trim(),
    "```",
    "",
    "---",
    "",
    renderCoverage(doc),
    "",
    "### Kết luận",
    "",
    "Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.",
    "",
    "---",
  ].join("\n");
}

const docs = [
  {
    file: "BB_API_Cart_GetCurrent.md",
    title: "Black-box API Test - Cart GetCurrent",
    functionName: "Cart.GetCurrent",
    endpoint: "GET /api/cart hoặc GET /api/cart/current",
    output:
      "API trả về `2xx` và dữ liệu giỏ hàng hiện tại của user nếu token hợp lệ. Response cần có danh sách items, có thể rỗng nếu user chưa thêm sản phẩm.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1, X2",
      ],
      [
        "Cart state",
        "Giỏ hàng rỗng hoặc có sản phẩm đều xử lý được",
        "V2",
        "Response không có cấu trúc items hợp lệ",
        "X3",
      ],
    ],
    boundary: [
      [
        "Token",
        "Token customer vừa đăng ký",
        "Không gửi token",
        "`401 Unauthorized`",
        "B1",
      ],
      ["Token", "Token hợp lệ", "`invalid-token`", "`401 Unauthorized`", "B2"],
      [
        "Items",
        "Array rỗng hoặc có phần tử",
        "Không phải array",
        "Test fail",
        "B3",
      ],
    ],
    testCases: [
      {
        statusKey: "Cart GetCurrent",
        name: "User đăng nhập xem được giỏ hàng hiện tại",
        input: "`GET /api/cart` hoặc `GET /api/cart/current` kèm token hợp lệ",
        expected: "`2xx`, response có danh sách items",
        actualPassed:
          "API trả về giỏ hàng hiện tại và items là danh sách hợp lệ",
        tags: "V1, V2, X3",
        implemented: true,
      },
      {
        statusKey: "Cart GetCurrent không gửi token",
        name: "GetCurrent không có token",
        input: "`GET /api/cart` không gửi token",
        expected: "`401 Unauthorized`",
        actualPassed: "API trả về `401 Unauthorized` khi không gửi token",
        tags: "X1",
        implemented: true,
      },
      {
        statusKey: "Cart GetCurrent token sai",
        name: "GetCurrent token sai",
        input: "`GET /api/cart` với token không hợp lệ",
        expected: "`401 Unauthorized`",
        actualPassed: "API trả về `401 Unauthorized` khi gửi token sai",
        tags: "X2",
        implemented: true,
      },
    ],
    code: [
      'Scenario("Cart GetCurrent: user đăng nhập xem được giỏ hàng hiện tại", async ({ I }) => {',
      "  const customer = await registerCustomer(I);",
      "",
      "  const res = await getCurrentCart(I, customer.token);",
      "",
      '  assert2xx(res, "Cart GetCurrent phải thành công");',
      "",
      "  const items = getCartItems(res.data);",
      "",
      '  assert(Array.isArray(items), "Cart GetCurrent phải trả về danh sách items");',
      "});",
      "",
      'Scenario("Cart GetCurrent: không gửi token phải trả về 401", async ({ I }) => {',
      '  const res = await I.sendGetRequest("/api/cart");',
      "",
      "  assertStatus(",
      "    res,",
      "    401,",
      '    "Cart GetCurrent không gửi token phải trả về 401"',
      "  );",
      "});",
      "",
      'Scenario("Cart GetCurrent: token sai phải trả về 401", async ({ I }) => {',
      "  const invalidToken = `invalid-token-${uniqueSuffix()}`;",
      "",
      "  const res = await I.sendGetRequest(",
      '    "/api/cart",',
      "    authHeaders(invalidToken)",
      "  );",
      "",
      "  assertStatus(",
      "    res,",
      "    401,",
      '    "Cart GetCurrent dùng token sai phải trả về 401"',
      "  );",
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Cart_AddItem.md",
    title: "Black-box API Test - Cart AddItem",
    functionName: "Cart.AddItem",
    endpoint: "POST /api/cart/items hoặc POST /api/cart/add",
    output:
      "API thêm sản phẩm vào giỏ hàng thành công khi token, productId và quantity hợp lệ. Sau khi thêm, giỏ hàng phải có sản phẩm vừa thêm.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      ["productId", "Sản phẩm tồn tại", "V2", "Sản phẩm không tồn tại", "X2"],
      [
        "quantity",
        "quantity >= 1",
        "V3",
        "quantity <= 0 hoặc sai định dạng",
        "X3",
      ],
      ["stock", "Sản phẩm còn hàng", "V4", "Số lượng thêm vượt tồn kho", "X4"],
    ],
    boundary: [
      ["quantity", "`1`", "`0`", "`400 Bad Request`", "B1"],
      ["quantity", "`1`", "`-1`", "`400 Bad Request`", "B2"],
      ["productId", "id sản phẩm seed", "`99999999`", "`404 Not Found`", "B3"],
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B4"],
    ],
    testCases: [
      {
        statusKey: "Cart AddItem",
        name: "Thêm sản phẩm vào giỏ hàng thành công",
        input:
          "`POST /api/cart/items` với token hợp lệ, productId tồn tại, quantity=1",
        expected: "`2xx` hoặc `201`, giỏ hàng có sản phẩm vừa thêm",
        actualPassed:
          "API thêm sản phẩm thành công và giỏ hàng có item tương ứng",
        tags: "V1, V2, V3, V4",
        implemented: true,
      },
      {
        name: "AddItem productId không tồn tại",
        input: "`POST /api/cart/items` với productId=99999999",
        expected: "`404 Not Found`",
        tags: "X2",
        implemented: false,
      },
      {
        name: "AddItem quantity không hợp lệ",
        input: "`POST /api/cart/items` với quantity=0",
        expected: "`400 Bad Request`",
        tags: "X3",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Cart AddItem: thêm sản phẩm vào giỏ hàng thành công", async ({ I }) => {',
      "  const customer = await registerCustomer(I);",
      "  const product = await getSeedProduct(I);",
      "  const productId = getProductId(product);",
      "",
      "  await addCartItem(I, customer.token, productId, 1);",
      "",
      "  const cartRes = await getCurrentCart(I, customer.token);",
      "  const items = getCartItems(cartRes.data);",
      "",
      "  const addedItem = items.find((item) => getCartItemProductId(item) === productId);",
      "",
      '  assert(addedItem, "Giỏ hàng không có sản phẩm vừa thêm");',
      '  assert(getCartItemQuantity(addedItem) >= 1, "Số lượng sản phẩm trong giỏ phải >= 1");',
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Cart_UpdateItem.md",
    title: "Black-box API Test - Cart UpdateItem",
    functionName: "Cart.UpdateItem",
    endpoint: "PUT /api/cart/items/{cartItemId}",
    output:
      "API cập nhật số lượng item trong giỏ hàng. Endpoint cần nhận đúng cartItemId và quantity hợp lệ. Sau khi cập nhật, quantity trong giỏ hàng phải thay đổi đúng.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      [
        "cartItemId",
        "cartItemId tồn tại trong giỏ hàng",
        "V2",
        "Dùng productId thay cartItemId hoặc cartItemId không tồn tại",
        "X2",
      ],
      [
        "quantity",
        "quantity >= 1",
        "V3",
        "quantity <= 0 hoặc vượt tồn kho",
        "X3, X4",
      ],
    ],
    boundary: [
      [
        "cartItemId",
        "id item vừa thêm vào giỏ",
        "productId hoặc id không tồn tại",
        "`404 Not Found`",
        "B1",
      ],
      ["quantity", "`2`", "`0`", "`400 Bad Request`", "B2"],
      ["quantity", "`2`", "Vượt tồn kho", "`400 Bad Request`", "B3"],
    ],
    testCases: [
      {
        statusKey: "Cart UpdateItem",
        name: "Cập nhật số lượng sản phẩm trong giỏ hàng",
        input: "`PUT /api/cart/items/{cartItemId}` với quantity=2",
        expected: "`2xx` hoặc `204`, item trong giỏ có quantity=2",
        actualPassed:
          "API cập nhật quantity thành công, giỏ hàng trả về quantity=2",
        actualFailed:
          "Test đang fail nếu truyền productId thay vì cartItemId. API trả `404 cart_item_not_found`",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "UpdateItem dùng id không tồn tại",
        input: "`PUT /api/cart/items/99999999`",
        expected: "`404 Not Found`",
        tags: "X2",
        implemented: false,
      },
      {
        name: "UpdateItem quantity không hợp lệ",
        input: "`PUT /api/cart/items/{cartItemId}` với quantity=0",
        expected: "`400 Bad Request`",
        tags: "X3",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Cart UpdateItem: cập nhật số lượng sản phẩm trong giỏ hàng", async ({ I }) => {',
      "  const customer = await registerCustomer(I);",
      "  const product = await getSeedProduct(I);",
      "  const productId = getProductId(product);",
      "",
      "  await addCartItem(I, customer.token, productId, 1);",
      "  await updateCartItem(I, customer.token, productId, 2);",
      "",
      "  const cartRes = await getCurrentCart(I, customer.token);",
      "  const items = getCartItems(cartRes.data);",
      "",
      "  const updatedItem = items.find((item) => getCartItemProductId(item) === productId);",
      "",
      '  assert(updatedItem, "Không tìm thấy sản phẩm sau khi update");',
      '  assert.strictEqual(getCartItemQuantity(updatedItem), 2, "Số lượng sau khi update phải bằng 2");',
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Cart_RemoveItem.md",
    title: "Black-box API Test - Cart RemoveItem",
    functionName: "Cart.RemoveItem",
    endpoint: "DELETE /api/cart/items/{cartItemId}",
    output:
      "API xóa một item khỏi giỏ hàng. Sau khi xóa, item đó không còn xuất hiện trong danh sách items của giỏ hàng.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      [
        "cartItemId/productId",
        "Item tồn tại trong giỏ hàng",
        "V2",
        "Item không tồn tại",
        "X2",
      ],
      ["Cart state", "Giỏ hàng có item cần xóa", "V3", "Giỏ hàng rỗng", "X3"],
    ],
    boundary: [
      ["cartItemId", "id item vừa thêm", "`99999999`", "`404 Not Found`", "B1"],
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B2"],
    ],
    testCases: [
      {
        statusKey: "Cart RemoveItem",
        name: "Xóa một sản phẩm khỏi giỏ hàng",
        input: "Thêm sản phẩm vào giỏ rồi gọi API xóa item đó",
        expected: "`2xx` hoặc `204`, giỏ hàng không còn sản phẩm vừa xóa",
        actualPassed: "API xóa item thành công và sản phẩm không còn trong giỏ",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "RemoveItem id không tồn tại",
        input: "`DELETE /api/cart/items/99999999`",
        expected: "`404 Not Found`",
        tags: "X2",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Cart RemoveItem: xóa một sản phẩm khỏi giỏ hàng", async ({ I }) => {',
      "  const customer = await registerCustomer(I);",
      "  const product = await getSeedProduct(I);",
      "  const productId = getProductId(product);",
      "",
      "  await addCartItem(I, customer.token, productId, 1);",
      "  await removeCartItem(I, customer.token, productId);",
      "",
      "  const cartRes = await getCurrentCart(I, customer.token);",
      "  const items = getCartItems(cartRes.data);",
      "",
      "  const removedItem = items.find((item) => getCartItemProductId(item) === productId);",
      "",
      '  assert(!removedItem, "Sản phẩm đã xóa vẫn còn trong giỏ hàng");',
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Cart_Clear.md",
    title: "Black-box API Test - Cart Clear",
    functionName: "Cart.Clear",
    endpoint: "DELETE /api/cart/clear hoặc POST /api/cart/clear",
    output:
      "API xóa toàn bộ giỏ hàng của user. Sau khi clear, danh sách items trong giỏ hàng phải rỗng.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      ["Cart state", "Giỏ hàng có sản phẩm", "V2", "Giỏ hàng đã rỗng", "X2"],
      [
        "Clear result",
        "Sau khi clear, items rỗng",
        "V3",
        "Sau khi clear vẫn còn items",
        "X3",
      ],
    ],
    boundary: [
      ["Cart items", "Có ít nhất 1 item", "0 item", "`2xx` và vẫn rỗng", "B1"],
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B2"],
    ],
    testCases: [
      {
        statusKey: "Cart Clear",
        name: "Xóa toàn bộ giỏ hàng",
        input: "Thêm sản phẩm vào giỏ rồi gọi API clear cart",
        expected: "`2xx` hoặc `204`, giỏ hàng sau khi clear có items rỗng",
        actualPassed: "API clear cart thành công và giỏ hàng rỗng",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "Clear cart khi không có token",
        input: "Gọi API clear cart không gửi token",
        expected: "`401 Unauthorized`",
        tags: "X1",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Cart Clear: xóa toàn bộ giỏ hàng", async ({ I }) => {',
      "  const customer = await registerCustomer(I);",
      "  const product = await getSeedProduct(I);",
      "  const productId = getProductId(product);",
      "",
      "  await addCartItem(I, customer.token, productId, 1);",
      "  await clearCart(I, customer.token);",
      "",
      "  const cartRes = await getCurrentCart(I, customer.token);",
      "  const items = getCartItems(cartRes.data);",
      "",
      '  assert.strictEqual(items.length, 0, "Giỏ hàng sau khi clear phải rỗng");',
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Order_PlaceOrder.md",
    title: "Black-box API Test - Order PlaceOrder",
    functionName: "Order.PlaceOrder",
    endpoint: "POST /api/orders hoặc POST /api/orders/place",
    output:
      "API tạo đơn hàng từ giỏ hàng thành công khi user có token hợp lệ, giỏ hàng có sản phẩm và địa chỉ giao hàng hợp lệ.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      ["Cart", "Giỏ hàng có sản phẩm", "V2", "Giỏ hàng rỗng", "X2"],
      [
        "addressId",
        "Địa chỉ giao hàng tồn tại và thuộc user",
        "V3",
        "addressId không tồn tại hoặc thuộc user khác",
        "X3, X4",
      ],
      [
        "paymentMethod",
        "Phương thức thanh toán hợp lệ như COD",
        "V4",
        "paymentMethod không hợp lệ",
        "X5",
      ],
    ],
    boundary: [
      ["Cart", "Có 1 sản phẩm", "Giỏ hàng rỗng", "`400 Bad Request`", "B1"],
      [
        "addressId",
        "id địa chỉ vừa tạo",
        "`99999999`",
        "`404 Not Found` hoặc `400`",
        "B2",
      ],
      ["paymentMethod", "`COD`", "`INVALID`", "`400 Bad Request`", "B3"],
    ],
    testCases: [
      {
        statusKey: "Order PlaceOrder",
        name: "Đặt hàng từ giỏ hàng thành công",
        input:
          "User có token, giỏ hàng có sản phẩm, có địa chỉ giao hàng, paymentMethod=COD",
        expected: "`2xx` hoặc `201`, response có orderId hợp lệ",
        actualPassed: "API tạo đơn hàng thành công và trả về orderId hợp lệ",
        tags: "V1, V2, V3, V4",
        implemented: true,
      },
      {
        name: "PlaceOrder khi giỏ hàng rỗng",
        input: "`POST /api/orders` khi cart không có item",
        expected: "`400 Bad Request`",
        tags: "X2",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Order PlaceOrder: đặt hàng từ giỏ hàng thành công", async ({ I }) => {',
      "  const fixture = await createOrderFixture(I);",
      "",
      '  assert(fixture.orderId > 0, "Order PlaceOrder không trả về orderId hợp lệ");',
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Order_GetMine.md",
    title: "Black-box API Test - Order GetMine",
    functionName: "Order.GetMine",
    endpoint: "GET /api/orders/mine hoặc GET /api/orders/my",
    output:
      "API trả về danh sách đơn hàng của user đang đăng nhập. Danh sách cần có đơn hàng vừa tạo trong quá trình test.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      [
        "Order list",
        "User có ít nhất 1 đơn hàng",
        "V2",
        "User chưa có đơn hàng",
        "X2",
      ],
      [
        "Ownership",
        "Danh sách chỉ chứa đơn của user hiện tại",
        "V3",
        "Trả về đơn của user khác",
        "X3",
      ],
    ],
    boundary: [
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B1"],
      [
        "Order list",
        "Có 1 đơn vừa tạo",
        "Danh sách rỗng",
        "`2xx` với mảng rỗng",
        "B2",
      ],
    ],
    testCases: [
      {
        statusKey: "Order GetMine",
        name: "User xem được danh sách đơn hàng của mình",
        input: "Tạo đơn hàng rồi gọi API lấy danh sách đơn của user",
        expected: "`2xx`, danh sách orders có đơn vừa tạo",
        actualPassed: "API trả về danh sách đơn hàng và có orderId vừa tạo",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "GetMine không có token",
        input: "`GET /api/orders/mine` không gửi token",
        expected: "`401 Unauthorized`",
        tags: "X1",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Order GetMine: user xem được danh sách đơn hàng của mình", async ({ I }) => {',
      "  const fixture = await createOrderFixture(I);",
      "",
      "  const res = await getMyOrders(I, fixture.customer.token);",
      "",
      '  assert2xx(res, "Order GetMine phải thành công");',
      "",
      "  const orders = extractArray(res.data);",
      "",
      '  assert(Array.isArray(orders), "Order GetMine phải trả về danh sách orders");',
      "",
      "  const createdOrder = orders.find((order) => getOrderId(order) === fixture.orderId);",
      "",
      '  assert(createdOrder, "Danh sách đơn hàng không có đơn vừa tạo");',
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Order_GetById.md",
    title: "Black-box API Test - Order GetById",
    functionName: "Order.GetById",
    endpoint: "GET /api/orders/{orderId}",
    output:
      "API trả về chi tiết đơn hàng nếu orderId tồn tại và thuộc user hiện tại. orderId không tồn tại hoặc không thuộc quyền truy cập phải bị từ chối phù hợp.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      ["orderId", "orderId tồn tại", "V2", "orderId không tồn tại", "X2"],
      [
        "Ownership",
        "Đơn hàng thuộc user hiện tại",
        "V3",
        "Đơn hàng thuộc user khác",
        "X3",
      ],
    ],
    boundary: [
      ["orderId", "id đơn vừa tạo", "`99999999`", "`404 Not Found`", "B1"],
      ["orderId", "id hợp lệ", "`abc`", "`400` hoặc `404` tùy route", "B2"],
      ["Token", "Token hợp lệ", "Không gửi token", "`401 Unauthorized`", "B3"],
    ],
    testCases: [
      {
        statusKey: "Order GetById",
        name: "Xem chi tiết đơn hàng theo id",
        input:
          "`GET /api/orders/{orderId}` với orderId vừa tạo và token của chủ đơn",
        expected: "`2xx`, response có orderId đúng",
        actualPassed: "API trả về chi tiết đơn hàng đúng orderId",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "GetById với orderId không tồn tại",
        input: "`GET /api/orders/99999999`",
        expected: "`404 Not Found`",
        tags: "X2",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Order GetById: xem chi tiết đơn hàng theo id", async ({ I }) => {',
      "  const fixture = await createOrderFixture(I);",
      "",
      "  const res = await getOrderById(I, fixture.customer.token, fixture.orderId);",
      "",
      '  const order = extractObject(res.data, "order");',
      "",
      "  assert.strictEqual(",
      "    getOrderId(order),",
      "    fixture.orderId,",
      '    "Order GetById trả về orderId không đúng"',
      "  );",
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Order_Cancel.md",
    title: "Black-box API Test - Order Cancel",
    functionName: "Order.Cancel",
    endpoint:
      "POST /api/orders/{orderId}/cancel hoặc PUT /api/orders/{orderId}/cancel",
    output:
      "API cho phép user hủy đơn hàng của mình khi trạng thái đơn còn cho phép hủy. Sau khi hủy, trạng thái đơn cần thể hiện đã hủy.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      [
        "orderId",
        "orderId tồn tại và thuộc user",
        "V2",
        "orderId không tồn tại hoặc thuộc user khác",
        "X2, X3",
      ],
      [
        "Order status",
        "Trạng thái đơn cho phép hủy",
        "V3",
        "Trạng thái đơn không cho phép hủy",
        "X4",
      ],
      [
        "reason",
        "Lý do hủy hợp lệ",
        "V4",
        "Lý do hủy rỗng nếu hệ thống bắt buộc",
        "X5",
      ],
    ],
    boundary: [
      ["orderId", "id đơn vừa tạo", "`99999999`", "`404 Not Found`", "B1"],
      [
        "Order status",
        "Đơn mới tạo",
        "Đơn đã giao hoặc đã hoàn tất",
        "`400` hoặc `409`",
        "B2",
      ],
      ["reason", "Chuỗi hợp lệ", "Chuỗi rỗng", "`400` nếu bắt buộc", "B3"],
    ],
    testCases: [
      {
        statusKey: "Order Cancel",
        name: "User hủy đơn hàng của mình",
        input: "Tạo đơn hàng rồi gọi API cancel với reason hợp lệ",
        expected:
          "`2xx` hoặc `204`, trạng thái đơn chuyển sang canceled/cancelled/hủy",
        actualPassed:
          "API hủy đơn thành công và trạng thái đơn thể hiện đã hủy",
        tags: "V1, V2, V3, V4",
        implemented: true,
      },
      {
        name: "Cancel orderId không tồn tại",
        input: "`POST /api/orders/99999999/cancel`",
        expected: "`404 Not Found`",
        tags: "X2",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Order Cancel: user hủy đơn hàng của mình", async ({ I }) => {',
      "  const fixture = await createOrderFixture(I);",
      "",
      "  const res = await cancelOrder(I, fixture.customer.token, fixture.orderId);",
      "",
      '  assertStatusIn(res, [200, 204], "Order Cancel phải thành công");',
      "",
      "  const detailRes = await getOrderById(I, fixture.customer.token, fixture.orderId);",
      '  const order = extractObject(detailRes.data, "order");',
      "  const status = getOrderStatus(order).toLowerCase();",
      "",
      "  if (status) {",
      "    assert(",
      '      status.includes("cancel") || status.includes("hủy"),',
      '      "Trạng thái đơn sau khi hủy chưa đúng"',
      "    );",
      "  }",
      "});",
    ].join("\n"),
  },

  {
    file: "BB_API_Order_RequestRefund.md",
    title: "Black-box API Test - Order RequestRefund",
    functionName: "Order.RequestRefund",
    endpoint: "POST /api/orders/{orderId}/refund hoặc request-refund",
    output:
      "API xử lý yêu cầu hoàn tiền. Với đơn mới tạo, hệ thống có thể cho tạo yêu cầu hoàn tiền hoặc từ chối theo nghiệp vụ nếu trạng thái đơn chưa phù hợp.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      [
        "orderId",
        "orderId tồn tại và thuộc user",
        "V2",
        "orderId không tồn tại hoặc thuộc user khác",
        "X2, X3",
      ],
      [
        "Order status",
        "Trạng thái đơn cho phép yêu cầu hoàn tiền",
        "V3",
        "Trạng thái đơn chưa đủ điều kiện hoàn tiền",
        "X4",
      ],
      [
        "reason",
        "Lý do hoàn tiền hợp lệ",
        "V4",
        "Lý do rỗng nếu hệ thống bắt buộc",
        "X5",
      ],
    ],
    boundary: [
      ["orderId", "id đơn vừa tạo", "`99999999`", "`404 Not Found`", "B1"],
      [
        "Order status",
        "Đơn đủ điều kiện refund",
        "Đơn mới tạo/chưa thanh toán",
        "`400` hoặc `409`",
        "B2",
      ],
      ["reason", "Chuỗi hợp lệ", "Chuỗi rỗng", "`400` nếu bắt buộc", "B3"],
    ],
    testCases: [
      {
        statusKey: "Order RequestRefund",
        name: "Gửi yêu cầu hoàn tiền cho đơn hàng",
        input: "Tạo đơn hàng rồi gọi API request refund với reason hợp lệ",
        expected:
          "`2xx` nếu hợp lệ hoặc `400/409` nếu nghiệp vụ chưa cho refund ở trạng thái hiện tại",
        actualPassed: "API trả về status hợp lệ theo nghiệp vụ refund",
        tags: "V1, V2, V4, X4",
        implemented: true,
      },
      {
        name: "RequestRefund orderId không tồn tại",
        input: "`POST /api/orders/99999999/refund`",
        expected: "`404 Not Found`",
        tags: "X2",
        implemented: false,
      },
    ],
    code: [
      'Scenario("Order RequestRefund: gửi yêu cầu hoàn tiền cho đơn hàng", async ({ I }) => {',
      "  const fixture = await createOrderFixture(I);",
      "",
      "  const res = await requestRefund(I, fixture.customer.token, fixture.orderId);",
      "",
      "  assertStatusIn(",
      "    res,",
      "    [200, 201, 202, 204, 400, 409],",
      '    "RequestRefund phải trả về status hợp lệ"',
      "  );",
      "});",
    ].join("\n"),
  },
];

for (const doc of docs) {
  fs.writeFileSync(path.join(OUT_DIR, doc.file), renderDoc(doc), "utf8");
}

const totalTarget = docs.reduce(
  (sum, doc) => sum + getTargetTags(doc).length,
  0,
);
const totalCovered = docs.reduce(
  (sum, doc) => sum + getCoveredTags(doc).length,
  0,
);
const totalImplemented = docs.reduce(
  (sum, doc) => sum + doc.testCases.filter((tc) => tc.implemented).length,
  0,
);

const readmeRows = docs.map((doc, index) => [
  index + 1,
  inlineCode(doc.file),
  inlineCode(doc.functionName),
  getCoveredTags(doc).length + "/" + getTargetTags(doc).length,
  percent(getCoveredTags(doc).length, getTargetTags(doc).length),
]);

const readme = [
  "# Bộ tài liệu Markdown cho cart_order_api_test.js",
  "",
  "## 1. Danh sách file theo từng function/API",
  "",
  table(
    ["STT", "File .md", "Function/API", "Tag đã có test case", "Tỷ lệ"],
    readmeRows,
  ),
  "",
  "## 2. Tổng quan mức độ bao phủ",
  "",
  table(
    ["Nội dung", "Giá trị"],
    [
      ["Tổng số function/API", docs.length],
      ["Tổng số test case đã có trong file test", totalImplemented],
      ["Tổng số tag cần kiểm thử", totalTarget],
      ["Tổng số tag đã có test case", totalCovered],
      ["Tỷ lệ bao phủ tag", percent(totalCovered, totalTarget)],
    ],
  ),
  "",
  "## 3. Ghi chú",
  "",
  "Các file này dùng cho Black-box API Testing.",
  "",
  "- Input là HTTP request gồm method, endpoint, token, route parameter và body.",
  "- Expected Output là status code và response body mong đợi.",
  "- Actual Output sẽ được ghi là Pass nếu chạy script với `CART_ORDER_TEST_STATUS=passed`.",
  "- Nếu đang có scenario fail, có thể truyền `CART_ORDER_TEST_STATUS=failed` và `CART_ORDER_FAILED=Cart UpdateItem` để tài liệu ghi rõ test case đang fail.",
  "- Mức độ bao phủ trong tài liệu là mức độ bao phủ theo tag lớp tương đương, không phải code coverage.",
].join("\n");

fs.writeFileSync(path.join(OUT_DIR, "README.md"), readme, "utf8");

console.log("Đã tạo xong tài liệu .md cho cart_order_api_test.js");
console.log("Thư mục output:");
console.log(OUT_DIR);
console.log("");
console.log("Danh sách file:");
for (const doc of docs) {
  console.log("- " + doc.file);
}
console.log("- README.md");
