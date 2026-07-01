const fs = require("fs");
const path = require("path");

const OUT_DIR = path.join(__dirname, "docs", "blackbox", "api", "catalog");

const TEST_FILE = "codecept-tests/tests/be/catalog_api_test.js";
const RUN_CMD = "npm run test:be:catalog";

const TEST_STATUS = String(process.env.CATALOG_TEST_STATUS || "").toLowerCase();
const IS_TEST_PASSED = ["pass", "passed", "ok"].includes(TEST_STATUS);

const RUN_RESULT = IS_TEST_PASSED
  ? "Đã chạy catalog_api_test.js và các scenario pass"
  : "Chưa cập nhật kết quả chạy thực tế";

fs.mkdirSync(OUT_DIR, { recursive: true });

function cell(value) {
  return String(value ?? "")
    .replace(/\r?\n/g, "<br>")
    .replace(/\|/g, "\\|");
}

function table(headers, rows) {
  return [
    `| ${headers.map(cell).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(cell).join(" | ")} |`),
  ].join("\n");
}

function extractTags(text) {
  const tags = new Set();
  const regex = /\b[VX]\d+\b/g;
  let match;

  while ((match = regex.exec(String(text || ""))) !== null) {
    tags.add(match[0]);
  }

  return [...tags];
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
    const input = row[0];

    for (const tag of extractTags(row[2])) {
      map[tag] = `${input}: ${row[1]}`;
    }

    for (const tag of extractTags(row[4])) {
      map[tag] = `${input}: ${row[3]}`;
    }
  }

  return map;
}

function actualOutput(tc) {
  if (!tc.implemented) {
    return "Chưa có trong file test hiện tại";
  }

  if (IS_TEST_PASSED) {
    return tc.actualPassed || "API trả về đúng như Expected Output";
  }

  return "Chưa cập nhật kết quả chạy";
}

function resultText(tc) {
  if (!tc.implemented) return "Chưa kiểm thử";
  return IS_TEST_PASSED ? "Pass" : "Chưa cập nhật";
}

function renderCoverage(doc) {
  const targetTags = getTargetTags(doc);
  const coveredTags = getCoveredTags(doc);
  const coveredSet = new Set(coveredTags);
  const meaningMap = getTagMeaningMap(doc);

  const tagRows = targetTags.map((tag) => [
    tag,
    meaningMap[tag] || "Trường hợp đầu vào đã thiết kế",
    coveredSet.has(tag)
      ? IS_TEST_PASSED
        ? "Đã kiểm thử"
        : "Đã có test case"
      : "Chưa có test case",
  ]);

  const missingTags = targetTags.filter((tag) => !coveredSet.has(tag));

  const note = missingTags.length
    ? `Các tag chưa có test case riêng là: \`${missingTags.join(", ")}\`. Có thể bổ sung thêm sau để tăng mức độ bao phủ.`
    : "Các tag đã thiết kế đều đã có test case tương ứng trong file test.";

  return `## 5. Mức độ bao phủ

Vì đây là kiểm thử Black-box API nên nhóm không đo line coverage hay branch coverage của mã nguồn.  
Mức độ bao phủ được đánh giá dựa trên các tag trong bảng lớp tương đương.

${table(["Tag", "Trường hợp kiểm thử", "Trạng thái"], tagRows)}

Kết quả:

${table(
  ["Nội dung", "Giá trị"],
  [
    ["Tổng số tag cần kiểm thử", targetTags.length],
    ["Số tag đã có test case", coveredTags.length],
    ["Tỷ lệ bao phủ theo tag", percent(coveredTags.length, targetTags.length)],
  ],
)}

Nhận xét:

API này hiện đã bao phủ được ${coveredTags.length}/${targetTags.length} tag đã thiết kế, tương ứng ${percent(
    coveredTags.length,
    targetTags.length,
  )}. ${note}
`;
}

function renderDoc(doc) {
  return `# ${doc.title}

## 1. Thông tin chung

${table(
  ["Nội dung", "Giá trị"],
  [
    ["Nhóm test", "Black-box BE/API"],
    ["File test tự động", `\`${TEST_FILE}\``],
    ["Function/API được test", `\`${doc.functionName}\``],
    ["Method/Endpoint", `\`${doc.endpoint}\``],
    ["Công cụ", "CodeceptJS REST helper"],
    ["Lệnh chạy", `\`${RUN_CMD}\``],
    ["Kết quả chạy thực tế", `\`${RUN_RESULT}\``],
  ],
)}

## 2. Mục tiêu kiểm thử

Tài liệu này mô tả cách kiểm thử API từ bên ngoài thông qua HTTP request và HTTP response.

Với nhóm Catalog, input thường là query string, route parameter, token đăng nhập hoặc request body.  
Output cần kiểm tra là status code, danh sách dữ liệu, chi tiết dữ liệu hoặc thông báo lỗi tương ứng.

---

# NỘI DUNG THIẾT KẾ KIỂM THỬ API

---

## 1. Xác định lớp tương đương

${table(
  ["Biến đầu vào", "Lớp hợp lệ", "Tag", "Lớp không hợp lệ", "Tag"],
  doc.equivalence,
)}

### Output cần kiểm tra

${doc.output}

---

## 2. Phân tích giá trị biên / biên dữ liệu API

Với API Catalog, không phải input nào cũng có miền số rõ ràng.  
Do đó, phần này kết hợp kiểm tra giá trị biên số và biên dữ liệu nghiệp vụ như rỗng, sai định dạng hoặc không tồn tại.

${table(
  [
    "Biến đầu vào",
    "Giá trị hợp lệ đại diện",
    "Giá trị biên / giá trị lỗi",
    "Expected Output",
    "Tag biên",
  ],
  doc.boundary,
)}

---

## 3. Thiết kế test case

${table(
  [
    "STT",
    "Tên test case",
    "Input",
    "Expected Output",
    "Actual Output",
    "Kết quả",
    "Tag được bao phủ",
  ],
  doc.testCases.map((tc, index) => [
    index + 1,
    tc.name,
    tc.input,
    tc.expected,
    actualOutput(tc),
    resultText(tc),
    tc.tags,
  ]),
)}

---

## 4. Mã kiểm thử tự động

Đoạn kiểm thử tương ứng trong \`${TEST_FILE}\`:

\`\`\`javascript
${doc.code.trim()}
\`\`\`

---

${renderCoverage(doc)}

### Kết luận

Function/API này được kiểm thử theo hướng **Black-box API Testing** vì test chỉ gửi request vào endpoint và kiểm tra response trả về, không gọi trực tiếp mã nguồn bên trong.

---
`;
}

const docs = [
  {
    file: "BB_API_Product_GetAll.md",
    title: "Black-box API Test - Product GetAll",
    functionName: "Product.GetAll/Search",
    endpoint: "GET /api/products?page={page}&pageSize={pageSize}",
    output:
      "API trả về `2xx`, danh sách sản phẩm và thông tin phân trang nếu input hợp lệ.",
    equivalence: [
      ["page", "page là số nguyên >= 1", "V1", "page <= 0", "X1"],
      [
        "pageSize",
        "pageSize là số nguyên hợp lệ",
        "V2",
        "pageSize <= 0 hoặc quá lớn",
        "X2",
      ],
      [
        "Dữ liệu sản phẩm",
        "Có dữ liệu sản phẩm sau khi seed",
        "V3",
        "Không có dữ liệu sản phẩm",
        "X3",
      ],
    ],
    boundary: [
      ["page", "`1`", "`0`", "`400` hoặc xử lý an toàn", "B1"],
      ["pageSize", "`20`", "`0`", "`400` hoặc xử lý an toàn", "B2"],
      ["pageSize", "`20`", "`9999`", "Không crash", "B3"],
    ],
    testCases: [
      {
        name: "Lấy danh sách sản phẩm thành công",
        input: "`GET /api/products?page=1&pageSize=20`",
        expected: "`2xx`, danh sách có sản phẩm, productId và tên hợp lệ",
        actualPassed: "API trả về danh sách sản phẩm hợp lệ",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "page không hợp lệ",
        input: "`GET /api/products?page=0&pageSize=20`",
        expected: "`400` hoặc xử lý an toàn",
        tags: "X1",
        implemented: false,
      },
    ],
    code: `
Scenario("Product GetAll/Search: lấy danh sách sản phẩm thành công", async ({ I }) => {
  const { res, products } = await getProductList(I, "?page=1&pageSize=20");

  assert(products.length > 0, "API /api/products không trả về sản phẩm nào");

  const firstProduct = products[0];

  assert(getProductId(firstProduct) > 0, "Sản phẩm đầu tiên không có productId hợp lệ");
  assert(getProductName(firstProduct).length > 0, "Sản phẩm đầu tiên không có tên");
});
`,
  },

  {
    file: "BB_API_Product_Search.md",
    title: "Black-box API Test - Product Search",
    functionName: "Product.Search",
    endpoint: "GET /api/products?q={keyword}",
    output:
      "API trả về `2xx` và danh sách sản phẩm khớp keyword. Nếu keyword không tồn tại thì không được crash.",
    equivalence: [
      [
        "q",
        "Keyword có tồn tại trong dữ liệu sản phẩm",
        "V1",
        "Keyword không khớp sản phẩm nào",
        "X1",
      ],
      [
        "q",
        "Keyword đúng định dạng",
        "V2",
        "Keyword rỗng hoặc chỉ có khoảng trắng",
        "X2",
      ],
    ],
    boundary: [
      [
        "q",
        "Keyword lấy từ sản phẩm seed",
        "`not-found-keyword-xxxx`",
        "`2xx` với danh sách rỗng",
        "B1",
      ],
      ["q", "`den`", "Chuỗi rỗng", "`2xx` hoặc danh sách mặc định", "B2"],
    ],
    testCases: [
      {
        name: "Tìm kiếm sản phẩm theo keyword",
        input: "`GET /api/products?q={keyword}&page=1&pageSize=50`",
        expected: "`2xx`, có ít nhất một sản phẩm khớp keyword",
        actualPassed: "API trả về sản phẩm khớp keyword",
        tags: "V1, V2",
        implemented: true,
      },
      {
        name: "Tìm kiếm keyword không tồn tại",
        input: "`GET /api/products?q=not-found-keyword-xxxx`",
        expected: "`2xx` với danh sách rỗng",
        tags: "X1",
        implemented: false,
      },
    ],
    code: `
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
`,
  },

  {
    file: "BB_API_Product_FilterByCategory.md",
    title: "Black-box API Test - Product Filter By Category",
    functionName: "Product.FilterByCategory",
    endpoint: "GET /api/products?category={categoryName}",
    output: "API trả về `2xx` và các sản phẩm thuộc đúng category được lọc.",
    equivalence: [
      [
        "category",
        "Category tồn tại trong dữ liệu seed",
        "V1",
        "Category không tồn tại",
        "X1",
      ],
      [
        "category",
        "Category có sản phẩm",
        "V2",
        "Category rỗng hoặc sai định dạng",
        "X2",
      ],
    ],
    boundary: [
      [
        "category",
        "Category lấy từ sản phẩm seed",
        "`unknown-category-xxxx`",
        "`2xx` với danh sách rỗng",
        "B1",
      ],
      [
        "category",
        "Category hợp lệ",
        "Chuỗi rỗng",
        "`2xx` hoặc danh sách mặc định",
        "B2",
      ],
    ],
    testCases: [
      {
        name: "Lọc sản phẩm theo danh mục",
        input: "`GET /api/products?category={categoryName}&page=1&pageSize=50`",
        expected: "`2xx`, tất cả sản phẩm trả về thuộc đúng category",
        actualPassed: "API trả về sản phẩm đúng category",
        tags: "V1, V2",
        implemented: true,
      },
      {
        name: "Lọc category không tồn tại",
        input: "`GET /api/products?category=unknown-category-xxxx`",
        expected: "`2xx` với danh sách rỗng",
        tags: "X1",
        implemented: false,
      },
    ],
    code: `
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
`,
  },

  {
    file: "BB_API_Product_FilterByPrice.md",
    title: "Black-box API Test - Product Filter By Price",
    functionName: "Product.FilterByPrice",
    endpoint: "GET /api/products?minPrice={minPrice}&maxPrice={maxPrice}",
    output: "API trả về `2xx` và chỉ gồm sản phẩm có giá nằm trong khoảng lọc.",
    equivalence: [
      [
        "minPrice",
        "minPrice là số >= 0",
        "V1",
        "minPrice âm hoặc sai định dạng",
        "X1",
      ],
      [
        "maxPrice",
        "maxPrice >= minPrice",
        "V2",
        "maxPrice nhỏ hơn minPrice",
        "X2",
      ],
      [
        "price range",
        "Khoảng giá khớp sản phẩm seed",
        "V3",
        "Khoảng giá không có sản phẩm",
        "X3",
      ],
    ],
    boundary: [
      [
        "minPrice",
        "Giá sản phẩm seed",
        "`-1`",
        "`400` hoặc xử lý an toàn",
        "B1",
      ],
      [
        "maxPrice",
        "Giá sản phẩm seed",
        "Nhỏ hơn minPrice",
        "`400` hoặc danh sách rỗng",
        "B2",
      ],
    ],
    testCases: [
      {
        name: "Lọc sản phẩm theo khoảng giá",
        input: "`GET /api/products?minPrice={price}&maxPrice={price}`",
        expected: "`2xx`, sản phẩm trả về nằm trong khoảng giá",
        actualPassed: "API trả về sản phẩm đúng khoảng giá",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "Khoảng giá không hợp lệ",
        input: "`GET /api/products?minPrice=100000&maxPrice=1`",
        expected: "`400` hoặc danh sách rỗng",
        tags: "X2",
        implemented: false,
      },
    ],
    code: `
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
`,
  },

  {
    file: "BB_API_Product_Sort.md",
    title: "Black-box API Test - Product Sort",
    functionName: "Product.Sort",
    endpoint: "GET /api/products?sort=price-asc",
    output:
      "API trả về danh sách sản phẩm được sắp xếp đúng theo tiêu chí sort.",
    equivalence: [
      ["sort", "`price-asc`", "V1", "Giá trị sort không hợp lệ", "X1"],
      ["sort", "`price-desc`", "V2", "sort rỗng", "X2"],
      [
        "Dữ liệu sản phẩm",
        "Có ít nhất 2 sản phẩm để so sánh",
        "V3",
        "Không đủ dữ liệu để kiểm tra sort",
        "X3",
      ],
    ],
    boundary: [
      [
        "sort",
        "`price-asc`",
        "`invalid-sort`",
        "`400` hoặc trả mặc định an toàn",
        "B1",
      ],
      [
        "Số lượng sản phẩm",
        ">= 2 sản phẩm",
        "0 hoặc 1 sản phẩm",
        "Không đủ điều kiện so sánh",
        "B2",
      ],
    ],
    testCases: [
      {
        name: "Sắp xếp sản phẩm theo giá tăng dần",
        input: "`GET /api/products?sort=price-asc&page=1&pageSize=50`",
        expected: "`2xx`, giá sản phẩm tăng dần",
        actualPassed: "API trả về danh sách tăng dần theo giá",
        tags: "V1, V3",
        implemented: true,
      },
      {
        name: "Sort không hợp lệ",
        input: "`GET /api/products?sort=invalid-sort`",
        expected: "`400` hoặc trả mặc định an toàn",
        tags: "X1",
        implemented: false,
      },
    ],
    code: `
Scenario("Product Sort: sắp xếp sản phẩm theo giá tăng dần", async ({ I }) => {
  const { products } = await getProductList(I, "?sort=price-asc&page=1&pageSize=50");

  assert(products.length > 1, "Cần ít nhất 2 sản phẩm để kiểm tra sort");

  for (let i = 1; i < products.length; i++) {
    const previousPrice = getProductPrice(products[i - 1]);
    const currentPrice = getProductPrice(products[i]);

    assert(previousPrice <= currentPrice, "Sort price-asc sai");
  }
});
`,
  },

  {
    file: "BB_API_Product_Paging.md",
    title: "Black-box API Test - Product Paging",
    functionName: "Product.Paging",
    endpoint: "GET /api/products?page={page}&pageSize={pageSize}",
    output:
      "API trả về đúng số lượng sản phẩm theo pageSize, page 1 và page 2 không bị trùng sản phẩm.",
    equivalence: [
      ["page", "page 1 hợp lệ", "V1", "page <= 0", "X1"],
      ["page", "page 2 hợp lệ", "V2", "page sai định dạng", "X2"],
      ["pageSize", "pageSize hợp lệ", "V3", "pageSize <= 0", "X3"],
      [
        "Dữ liệu phân trang",
        "Page 1 và page 2 không trùng dữ liệu",
        "V4",
        "Hai page bị trùng dữ liệu",
        "X4",
      ],
    ],
    boundary: [
      ["page", "`1`", "`0`", "`400` hoặc xử lý an toàn", "B1"],
      ["pageSize", "`5`", "`0`", "`400` hoặc xử lý an toàn", "B2"],
    ],
    testCases: [
      {
        name: "Phân trang sản phẩm đúng pageSize",
        input:
          "`GET /api/products?page=1&pageSize=5` và `GET /api/products?page=2&pageSize=5`",
        expected:
          "`2xx`, mỗi page không vượt pageSize và không trùng productId",
        actualPassed:
          "API phân trang đúng, page 1 và page 2 không trùng sản phẩm",
        tags: "V1, V2, V3, V4",
        implemented: true,
      },
      {
        name: "pageSize không hợp lệ",
        input: "`GET /api/products?page=1&pageSize=0`",
        expected: "`400` hoặc xử lý an toàn",
        tags: "X3",
        implemented: false,
      },
    ],
    code: `
Scenario("Product Paging: phân trang sản phẩm đúng pageSize", async ({ I }) => {
  const pageSize = 5;

  const page1 = await getProductList(I, "?page=1&pageSize=" + pageSize);
  const page2 = await getProductList(I, "?page=2&pageSize=" + pageSize);

  assert(page1.products.length <= pageSize, "Page 1 trả về nhiều hơn pageSize");
  assert(page2.products.length <= pageSize, "Page 2 trả về nhiều hơn pageSize");

  const idsPage1 = page1.products.map(getProductId);
  const idsPage2 = page2.products.map(getProductId);

  const duplicatedIds = idsPage1.filter((id) => idsPage2.includes(id));

  assert(duplicatedIds.length === 0, "Page 1 và Page 2 bị trùng sản phẩm");
});
`,
  },

  {
    file: "BB_API_Product_GetById.md",
    title: "Black-box API Test - Product GetById",
    functionName: "Product.GetById",
    endpoint: "GET /api/products/{id}",
    output:
      "API trả về `2xx` và chi tiết sản phẩm nếu id tồn tại. Nếu id không tồn tại thì trả về `404 Not Found`.",
    equivalence: [
      ["id", "id sản phẩm tồn tại", "V1", "id sản phẩm không tồn tại", "X1"],
      ["id", "id là số nguyên dương", "V2", "id sai định dạng", "X2"],
      [
        "Dữ liệu sản phẩm",
        "Sản phẩm có tên và productId hợp lệ",
        "V3",
        "Sản phẩm thiếu dữ liệu bắt buộc",
        "X3",
      ],
    ],
    boundary: [
      ["id", "id lấy từ sản phẩm seed", "`99999999`", "`404 Not Found`", "B1"],
      ["id", "id seed", "`abc`", "`400` hoặc `404` tùy route", "B2"],
    ],
    testCases: [
      {
        name: "Lấy chi tiết sản phẩm theo id",
        input: "`GET /api/products/{productId}` với id tồn tại",
        expected: "`2xx`, productId đúng, tên sản phẩm không rỗng",
        actualPassed: "API trả về chi tiết sản phẩm đúng id",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "Sản phẩm không tồn tại",
        input: "`GET /api/products/99999999`",
        expected: "`404 Not Found`",
        actualPassed: "API trả về `404 Not Found`",
        tags: "X1",
        implemented: true,
      },
      {
        name: "id sai định dạng",
        input: "`GET /api/products/abc`",
        expected: "`400` hoặc `404`, không crash",
        tags: "X2",
        implemented: false,
      },
    ],
    code: `
Scenario("Product GetById: lấy chi tiết sản phẩm theo id", async ({ I }) => {
  const seedProduct = await getSeedProduct(I);
  const productId = getProductId(seedProduct);

  const res = await I.sendGetRequest("/api/products/" + productId);

  assert2xx(res, "GET product by id thất bại");

  const product = extractProduct(res.data);

  assert.strictEqual(getProductId(product), productId, "ProductId trả về không đúng");
  assert(getProductName(product).length > 0, "Chi tiết sản phẩm không có productName");
});

Scenario("Product GetById not found: sản phẩm không tồn tại phải trả về 404", async ({ I }) => {
  const res = await I.sendGetRequest("/api/products/99999999");

  assertStatus(res, 404, "Product không tồn tại phải trả về 404");
});
`,
  },

  {
    file: "BB_API_Product_GetReviews.md",
    title: "Black-box API Test - Product GetReviews",
    functionName: "Product.GetReviews",
    endpoint: "GET /api/products/{id}/reviews",
    output:
      "API trả về danh sách review của đúng sản phẩm. Danh sách có thể rỗng nhưng không được crash.",
    equivalence: [
      [
        "productId",
        "id sản phẩm tồn tại",
        "V1",
        "id sản phẩm không tồn tại",
        "X1",
      ],
      [
        "reviews",
        "Review trả về thuộc đúng productId",
        "V2",
        "Review thuộc sai productId",
        "X2",
      ],
      [
        "reviews",
        "Response là danh sách",
        "V3",
        "Response không phải danh sách",
        "X3",
      ],
    ],
    boundary: [
      [
        "productId",
        "id sản phẩm seed",
        "`99999999`",
        "`404` hoặc danh sách rỗng",
        "B1",
      ],
      [
        "reviews",
        "Array hợp lệ",
        "Response không phải array",
        "Test fail",
        "B2",
      ],
    ],
    testCases: [
      {
        name: "Lấy danh sách review của sản phẩm",
        input: "`GET /api/products/{productId}/reviews`",
        expected:
          "`2xx`, response là danh sách review, review thuộc đúng productId",
        actualPassed: "API trả về danh sách review hợp lệ",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "Lấy review của sản phẩm không tồn tại",
        input: "`GET /api/products/99999999/reviews`",
        expected: "`404` hoặc danh sách rỗng",
        tags: "X1",
        implemented: false,
      },
    ],
    code: `
Scenario("Product GetReviews: lấy danh sách review của sản phẩm", async ({ I }) => {
  const seedProduct = await getSeedProduct(I);
  const productId = getProductId(seedProduct);

  const res = await I.sendGetRequest("/api/products/" + productId + "/reviews");

  assert2xx(res, "GET reviews thất bại");

  const reviews = extractArray(res.data);

  assert(Array.isArray(reviews), "Danh sách review trả về không phải array");

  for (const review of reviews) {
    assert.strictEqual(
      toNumber(pick(review, "productId", "ProductId")),
      productId,
      "Review trả về không thuộc productId đang test"
    );
  }
});
`,
  },

  {
    file: "BB_API_Product_AddReview.md",
    title: "Black-box API Test - Product AddReview",
    functionName: "Product.AddReview",
    endpoint: "POST /api/products/{id}/reviews",
    output:
      "API cho phép user đăng nhập thêm review cho sản phẩm hợp lệ. Response cần đúng productId, rating và comment.",
    equivalence: [
      [
        "Authorization token",
        "Token user hợp lệ",
        "V1",
        "Không có token hoặc token sai",
        "X1",
      ],
      [
        "productId",
        "id sản phẩm tồn tại",
        "V2",
        "id sản phẩm không tồn tại",
        "X2",
      ],
      [
        "rating",
        "rating nằm trong khoảng 1 đến 5",
        "V3",
        "rating ngoài khoảng 1 đến 5",
        "X3",
      ],
      ["comment", "comment không rỗng", "V4", "comment rỗng", "X4"],
    ],
    boundary: [
      ["rating", "`5`", "`0` hoặc `6`", "`400 Bad Request`", "B1"],
      ["comment", "Chuỗi hợp lệ", "Chuỗi rỗng", "`400 Bad Request`", "B2"],
      [
        "Authorization token",
        "Token hợp lệ",
        "Không gửi token",
        "`401 Unauthorized`",
        "B3",
      ],
    ],
    testCases: [
      {
        name: "User đăng nhập thêm review cho sản phẩm",
        input:
          "`POST /api/products/{productId}/reviews` kèm token, rating=5, comment hợp lệ",
        expected: "`2xx`, review trả về đúng productId, rating và comment",
        actualPassed: "API tạo review thành công và dữ liệu trả về đúng",
        tags: "V1, V2, V3, V4",
        implemented: true,
      },
      {
        name: "AddReview không có token",
        input: "`POST /api/products/{productId}/reviews` không gửi token",
        expected: "`401 Unauthorized`",
        tags: "X1",
        implemented: false,
      },
      {
        name: "AddReview rating ngoài khoảng",
        input: "`POST /api/products/{productId}/reviews` với rating=6",
        expected: "`400 Bad Request`",
        tags: "X3",
        implemented: false,
      },
    ],
    code: `
Scenario("Product AddReview: user đăng nhập có thể thêm review cho sản phẩm", async ({ I }) => {
  const customer = await registerNewCustomer(I);
  const seedProduct = await getSeedProduct(I);
  const productId = getProductId(seedProduct);

  const payload = {
    productId,
    author: customer.fullName,
    rating: 5,
    comment: "Codecept catalog review " + uniqueSuffix(),
  };

  const res = await I.sendPostRequest(
    "/api/products/" + productId + "/reviews",
    payload,
    authHeaders(customer.token)
  );

  assert2xx(res, "POST review thất bại");

  const review = extractReview(res.data);

  assert.strictEqual(toNumber(pick(review, "productId", "ProductId")), productId);
  assert.strictEqual(Number(pick(review, "rating", "Rating")), payload.rating);
  assert.strictEqual(String(pick(review, "comment", "Comment")), payload.comment);
});
`,
  },

  {
    file: "BB_API_Category_GetAll.md",
    title: "Black-box API Test - Category GetAll",
    functionName: "Category.GetAll",
    endpoint: "GET /api/categories",
    output:
      "API trả về `2xx` và danh sách danh mục. Mỗi category cần có id và name hợp lệ.",
    equivalence: [
      [
        "Dữ liệu category",
        "Có dữ liệu category sau khi seed",
        "V1",
        "Không có dữ liệu category",
        "X1",
      ],
      [
        "Category item",
        "Category có id hợp lệ",
        "V2",
        "Category thiếu id",
        "X2",
      ],
      [
        "Category item",
        "Category có name hợp lệ",
        "V3",
        "Category thiếu name",
        "X3",
      ],
    ],
    boundary: [
      [
        "Dữ liệu category",
        "Có ít nhất 1 category",
        "Danh sách rỗng",
        "`2xx` với mảng rỗng hoặc test fail tùy mục tiêu",
        "B1",
      ],
      [
        "Category item",
        "id > 0 và name không rỗng",
        "id null hoặc name rỗng",
        "Test fail",
        "B2",
      ],
    ],
    testCases: [
      {
        name: "Lấy danh sách danh mục thành công",
        input: "`GET /api/categories`",
        expected:
          "`2xx`, danh sách category có dữ liệu, category đầu tiên có id và name",
        actualPassed: "API trả về danh sách category hợp lệ",
        tags: "V1, V2, V3",
        implemented: true,
      },
    ],
    code: `
Scenario("Category GetAll: lấy danh sách danh mục thành công", async ({ I }) => {
  const { categories } = await getCategoryList(I);

  assert(categories.length > 0, "API /api/categories không trả về category nào");

  const firstCategory = categories[0];

  assert(getCategoryId(firstCategory) > 0, "Category đầu tiên không có id hợp lệ");
  assert(getCategoryName(firstCategory).length > 0, "Category đầu tiên không có name");
});
`,
  },

  {
    file: "BB_API_Category_GetById.md",
    title: "Black-box API Test - Category GetById",
    functionName: "Category.GetById",
    endpoint: "GET /api/categories/{id}",
    output:
      "API trả về `2xx` và chi tiết category nếu id tồn tại. Nếu id không tồn tại thì nên trả `404 Not Found`.",
    equivalence: [
      ["id", "id category tồn tại", "V1", "id category không tồn tại", "X1"],
      ["id", "id là số nguyên dương", "V2", "id sai định dạng", "X2"],
      [
        "Category detail",
        "Category có name và slug hợp lệ",
        "V3",
        "Category thiếu name hoặc slug",
        "X3",
      ],
    ],
    boundary: [
      ["id", "id category seed", "`99999999`", "`404 Not Found`", "B1"],
      ["id", "id seed", "`abc`", "`400` hoặc `404` tùy route", "B2"],
      [
        "Category detail",
        "name và slug không rỗng",
        "name hoặc slug rỗng",
        "Test fail",
        "B3",
      ],
    ],
    testCases: [
      {
        name: "Lấy chi tiết danh mục theo id",
        input: "`GET /api/categories/{categoryId}` với id tồn tại",
        expected: "`2xx`, category id đúng, name và slug không rỗng",
        actualPassed: "API trả về chi tiết category đúng id",
        tags: "V1, V2, V3",
        implemented: true,
      },
      {
        name: "Category không tồn tại",
        input: "`GET /api/categories/99999999`",
        expected: "`404 Not Found`",
        tags: "X1",
        implemented: false,
      },
    ],
    code: `
Scenario("Category GetById: lấy chi tiết danh mục theo id", async ({ I }) => {
  const seedCategory = await getSeedCategory(I);
  const categoryId = getCategoryId(seedCategory);

  const res = await I.sendGetRequest("/api/categories/" + categoryId);

  assert2xx(res, "GET category by id thất bại");

  const category = extractProduct(res.data);

  assert.strictEqual(getCategoryId(category), categoryId, "Category id trả về không đúng");
  assert(getCategoryName(category).length > 0, "Chi tiết category không có name");
  assert(getCategorySlug(category).length > 0, "Chi tiết category không có slug");
});
`,
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

const readmeRows = docs.map((doc, index) => [
  index + 1,
  `\`${doc.file}\``,
  `\`${doc.functionName}\``,
  getCoveredTags(doc).length + "/" + getTargetTags(doc).length,
  percent(getCoveredTags(doc).length, getTargetTags(doc).length),
]);

const readme = `# Bộ tài liệu Markdown cho catalog_api_test.js

## 1. Danh sách file theo từng function/API

${table(["STT", "File .md", "Function/API", "Tag đã có test case", "Tỷ lệ"], readmeRows)}

## 2. Tổng quan mức độ bao phủ

${table(
  ["Nội dung", "Giá trị"],
  [
    ["Tổng số function/API", docs.length],
    ["Tổng số tag cần kiểm thử", totalTarget],
    ["Tổng số tag đã có test case", totalCovered],
    ["Tỷ lệ bao phủ tag", percent(totalCovered, totalTarget)],
  ],
)}

## 3. Ghi chú

Các file này dùng cho Black-box API Testing.

- Input là HTTP request gồm method, endpoint, query string, route parameter, token và body.
- Expected Output là status code và response body mong đợi.
- Actual Output sẽ được ghi là Pass nếu chạy script với \`CATALOG_TEST_STATUS=passed\`.
- Mức độ bao phủ trong tài liệu là mức độ bao phủ theo tag lớp tương đương, không phải code coverage.
`;

fs.writeFileSync(path.join(OUT_DIR, "README.md"), readme, "utf8");

console.log("Đã tạo xong tài liệu .md cho catalog_api_test.js");
console.log("Thư mục output:");
console.log(OUT_DIR);
console.log("");
console.log("Danh sách file:");
for (const doc of docs) {
  console.log("- " + doc.file);
}
console.log("- README.md");
