const assert = require("assert");

Feature("BE - Catalog API");

/*
  Nhóm API được test:
  - Product GetAll/Search
  - Search by keyword
  - Filter by category
  - Filter by price
  - Sort
  - Paging
  - Product GetById
  - Product GetById not found
  - Product GetReviews
  - Product AddReview
  - Category GetAll
  - Category GetById
*/

function uniqueSuffix() {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function bodyText(data) {
  try {
    return JSON.stringify(data).slice(0, 2000);
  } catch {
    return String(data);
  }
}

function assert2xx(res, message) {
  assert(
    res && res.status >= 200 && res.status < 300,
    `${message}. Status: ${res?.status}. Body: ${bodyText(res?.data)}`,
  );
}

function assertStatus(res, expectedStatus, message) {
  assert.strictEqual(
    res.status,
    expectedStatus,
    `${message}. Status thực tế: ${res.status}. Body: ${bodyText(res.data)}`,
  );
}

function pick(obj, ...keys) {
  if (!obj) return undefined;

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }

  return undefined;
}

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function toNumber(value) {
  const num = Number(value);
  assert(!Number.isNaN(num), `Giá trị không phải số: ${value}`);
  return num;
}

function extractArray(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Items)) return data.Items;

  if (Array.isArray(data?.products)) return data.products;
  if (Array.isArray(data?.Products)) return data.Products;

  if (Array.isArray(data?.categories)) return data.categories;
  if (Array.isArray(data?.Categories)) return data.Categories;

  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.Result)) return data.Result;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.Data)) return data.Data;

  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.Data?.Items)) return data.Data.Items;

  return [];
}

function extractProducts(data) {
  return extractArray(data);
}

function extractCategories(data) {
  return extractArray(data);
}

function extractProduct(data) {
  return (
    data?.product ||
    data?.Product ||
    data?.data?.product ||
    data?.Data?.Product ||
    data?.data ||
    data?.Data ||
    data
  );
}

function extractReview(data) {
  return (
    data?.review ||
    data?.Review ||
    data?.data?.review ||
    data?.Data?.Review ||
    data?.data ||
    data?.Data ||
    data
  );
}

function getProductId(product) {
  return toNumber(pick(product, "productId", "ProductId", "id", "Id"));
}

function getCategoryId(category) {
  return toNumber(pick(category, "id", "Id", "categoryId", "CategoryId"));
}

function getProductName(product) {
  return String(
    pick(product, "productName", "ProductName", "name", "Name") ?? "",
  );
}

function getProductPrice(product) {
  return toNumber(pick(product, "price", "Price"));
}

function getProductCategory(product) {
  return String(
    pick(product, "category", "Category", "categoryName", "CategoryName") ?? "",
  );
}

function getCategoryName(category) {
  return String(pick(category, "name", "Name") ?? "");
}

function getCategorySlug(category) {
  return String(pick(category, "slug", "Slug") ?? "");
}

function getTotal(data) {
  const total = pick(data, "total", "Total", "totalCount", "TotalCount");
  return total === undefined ? undefined : Number(total);
}

function getPage(data) {
  const page = pick(data, "page", "Page");
  return page === undefined ? undefined : Number(page);
}

function getPageSize(data) {
  const pageSize = pick(data, "pageSize", "PageSize");
  return pageSize === undefined ? undefined : Number(pageSize);
}

function getToken(data) {
  return (
    pick(data, "token", "Token", "accessToken", "AccessToken") ||
    pick(data?.data, "token", "Token", "accessToken", "AccessToken") ||
    pick(data?.Data, "token", "Token", "accessToken", "AccessToken")
  );
}

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
    "X-Auth-Token": token,
  };
}

function findSearchKeyword(product) {
  const candidates = [
    getProductName(product),
    pick(product, "sku", "Sku"),
    getProductCategory(product),
    pick(product, "brand", "Brand"),
    pick(product, "style", "Style"),
  ];

  for (const candidate of candidates) {
    const text = String(candidate ?? "").trim();

    if (!text) continue;

    const word = text
      .split(/\s+/)
      .map((item) => item.replace(/[^\p{L}\p{N}_-]/gu, ""))
      .find((item) => item.length >= 2);

    if (word) return word;
  }

  return "den";
}

function productMatchesKeyword(product, keyword) {
  const target = normalize(keyword);

  const fields = [
    getProductName(product),
    pick(product, "sku", "Sku"),
    getProductCategory(product),
    pick(product, "brand", "Brand"),
    pick(product, "style", "Style"),
    pick(product, "material", "Material"),
    pick(product, "color", "Color"),
  ];

  return fields.some((field) => normalize(field).includes(target));
}

async function seedDemoData(I) {
  const res = await I.sendPostRequest("/api/Maintenance/seed/all");

  assert2xx(res, "Seed demo data thất bại");
}

async function registerNewCustomer(I) {
  const suffix = uniqueSuffix();

  const payload = {
    email: `catalog.user.${suffix}@example.com`,
    fullName: `Catalog User ${suffix}`,
    phone: "0987654321",
    password: "Password123",
    role: "customer",
  };

  const res = await I.sendPostRequest("/api/auth/register", payload);

  assert2xx(res, "Register customer để test AddReview thất bại");

  const token = getToken(res.data);

  assert(token, `Register không trả về token. Body: ${bodyText(res.data)}`);

  return {
    token,
    email: payload.email,
    fullName: payload.fullName,
  };
}

async function getProductList(I, queryString = "") {
  const res = await I.sendGetRequest(`/api/products${queryString}`);

  assert2xx(res, `GET /api/products${queryString} thất bại`);

  const products = extractProducts(res.data);

  assert(
    Array.isArray(products),
    `Danh sách sản phẩm trả về không phải array. Body: ${bodyText(res.data)}`,
  );

  return {
    res,
    products,
  };
}

async function getSeedProduct(I) {
  const { products } = await getProductList(I, "?page=1&pageSize=20");

  assert(
    products.length > 0,
    "Không có sản phẩm demo. Hãy chạy seed trước khi test.",
  );

  return products[0];
}

async function getCategoryList(I) {
  const res = await I.sendGetRequest("/api/categories");

  assert2xx(res, "GET /api/categories thất bại");

  const categories = extractCategories(res.data);

  assert(
    Array.isArray(categories),
    `Danh sách category trả về không phải array. Body: ${bodyText(res.data)}`,
  );

  return {
    res,
    categories,
  };
}

async function getSeedCategory(I) {
  const { categories } = await getCategoryList(I);

  assert(
    categories.length > 0,
    "Không có category demo. Hãy chạy seed trước khi test.",
  );

  const activeCategory =
    categories.find((category) => {
      const isActive = pick(category, "isActive", "IsActive");
      return isActive === true || isActive === undefined;
    }) || categories[0];

  return activeCategory;
}

BeforeSuite(async ({ I }) => {
  await seedDemoData(I);
});

Scenario(
  "Product GetAll/Search: lấy danh sách sản phẩm thành công",
  async ({ I }) => {
    const { res, products } = await getProductList(I, "?page=1&pageSize=20");

    assert(products.length > 0, "API /api/products không trả về sản phẩm nào");

    const total = getTotal(res.data);
    const page = getPage(res.data);
    const pageSize = getPageSize(res.data);

    if (total !== undefined) {
      assert(
        total >= products.length,
        "Total phải lớn hơn hoặc bằng số item trả về",
      );
    }

    if (page !== undefined) {
      assert.strictEqual(page, 1, "Page trả về không đúng");
    }

    if (pageSize !== undefined) {
      assert.strictEqual(pageSize, 20, "PageSize trả về không đúng");
    }

    const firstProduct = products[0];

    assert(
      getProductId(firstProduct) > 0,
      "Sản phẩm đầu tiên không có productId hợp lệ",
    );

    assert(
      getProductName(firstProduct).length > 0,
      "Sản phẩm đầu tiên không có tên",
    );
  },
);

Scenario(
  "Product Search by keyword: tìm kiếm sản phẩm theo keyword",
  async ({ I }) => {
    const seedProduct = await getSeedProduct(I);
    const keyword = findSearchKeyword(seedProduct);

    const { products } = await getProductList(
      I,
      `?q=${encodeURIComponent(keyword)}&page=1&pageSize=50`,
    );

    assert(
      Array.isArray(products),
      "Kết quả search sản phẩm phải là một danh sách",
    );

    assert(
      products.length > 0,
      `Search keyword "${keyword}" không trả về sản phẩm nào`,
    );

    assert(
      products.some((product) => productMatchesKeyword(product, keyword)),
      `Không có sản phẩm nào khớp keyword "${keyword}"`,
    );
  },
);

Scenario(
  "Product Filter by category: lọc sản phẩm theo danh mục",
  async ({ I }) => {
    const seedProduct = await getSeedProduct(I);
    const categoryName = getProductCategory(seedProduct);

    assert(
      categoryName.length > 0,
      `Sản phẩm dùng để test không có category. Product: ${bodyText(seedProduct)}`,
    );

    const { products } = await getProductList(
      I,
      `?category=${encodeURIComponent(categoryName)}&page=1&pageSize=50`,
    );

    assert(
      products.length > 0,
      `Filter category "${categoryName}" không trả về sản phẩm nào`,
    );

    for (const product of products) {
      assert.strictEqual(
        normalize(getProductCategory(product)),
        normalize(categoryName),
        `Sản phẩm trả về không thuộc category "${categoryName}". Product: ${bodyText(product)}`,
      );
    }
  },
);

Scenario(
  "Product Filter by price: lọc sản phẩm theo khoảng giá",
  async ({ I }) => {
    const seedProduct = await getSeedProduct(I);
    const price = getProductPrice(seedProduct);

    const { products } = await getProductList(
      I,
      `?minPrice=${price}&maxPrice=${price}&page=1&pageSize=50`,
    );

    assert(
      products.length > 0,
      `Filter minPrice=maxPrice=${price} không trả về sản phẩm nào`,
    );

    for (const product of products) {
      const productPrice = getProductPrice(product);

      assert(
        productPrice >= price && productPrice <= price,
        `Sản phẩm có giá nằm ngoài khoảng lọc. Price: ${productPrice}, Expected: ${price}`,
      );
    }
  },
);

Scenario("Product Sort: sắp xếp sản phẩm theo giá tăng dần", async ({ I }) => {
  const { products } = await getProductList(
    I,
    "?sort=price-asc&page=1&pageSize=50",
  );

  assert(products.length > 1, "Cần ít nhất 2 sản phẩm để kiểm tra sort");

  for (let i = 1; i < products.length; i++) {
    const previousPrice = getProductPrice(products[i - 1]);
    const currentPrice = getProductPrice(products[i]);

    assert(
      previousPrice <= currentPrice,
      `Sort price-asc sai tại vị trí ${i}. ${previousPrice} > ${currentPrice}`,
    );
  }
});

Scenario("Product Paging: phân trang sản phẩm đúng pageSize", async ({ I }) => {
  const pageSize = 5;

  const page1 = await getProductList(I, `?page=1&pageSize=${pageSize}`);
  const page2 = await getProductList(I, `?page=2&pageSize=${pageSize}`);

  assert(
    page1.products.length <= pageSize,
    `Page 1 trả về nhiều hơn pageSize ${pageSize}`,
  );

  assert(
    page2.products.length <= pageSize,
    `Page 2 trả về nhiều hơn pageSize ${pageSize}`,
  );

  const responsePage1 = getPage(page1.res.data);
  const responsePageSize1 = getPageSize(page1.res.data);

  if (responsePage1 !== undefined) {
    assert.strictEqual(responsePage1, 1, "Response page 1 không đúng");
  }

  if (responsePageSize1 !== undefined) {
    assert.strictEqual(
      responsePageSize1,
      pageSize,
      "Response pageSize không đúng",
    );
  }

  const idsPage1 = page1.products.map(getProductId);
  const idsPage2 = page2.products.map(getProductId);

  const duplicatedIds = idsPage1.filter((id) => idsPage2.includes(id));

  assert(
    duplicatedIds.length === 0,
    `Page 1 và Page 2 bị trùng sản phẩm: ${duplicatedIds.join(", ")}`,
  );
});

Scenario("Product GetById: lấy chi tiết sản phẩm theo id", async ({ I }) => {
  const seedProduct = await getSeedProduct(I);
  const productId = getProductId(seedProduct);

  const res = await I.sendGetRequest(`/api/products/${productId}`);

  assert2xx(res, `GET /api/products/${productId} thất bại`);

  const product = extractProduct(res.data);

  assert.strictEqual(
    getProductId(product),
    productId,
    "ProductId trả về không đúng",
  );

  assert(
    getProductName(product).length > 0,
    "Chi tiết sản phẩm không có productName",
  );
});

Scenario(
  "Product GetById not found: sản phẩm không tồn tại phải trả về 404",
  async ({ I }) => {
    const notFoundId = 99999999;

    const res = await I.sendGetRequest(`/api/products/${notFoundId}`);

    assertStatus(res, 404, `GET /api/products/${notFoundId} phải trả về 404`);
  },
);

Scenario(
  "Product GetReviews: lấy danh sách review của sản phẩm",
  async ({ I }) => {
    const seedProduct = await getSeedProduct(I);
    const productId = getProductId(seedProduct);

    const res = await I.sendGetRequest(`/api/products/${productId}/reviews`);

    assert2xx(res, `GET /api/products/${productId}/reviews thất bại`);

    const reviews = extractArray(res.data);

    assert(Array.isArray(reviews), "Danh sách review trả về không phải array");

    for (const review of reviews) {
      assert.strictEqual(
        toNumber(pick(review, "productId", "ProductId")),
        productId,
        "Review trả về không thuộc productId đang test",
      );
    }
  },
);

Scenario(
  "Product AddReview: user đăng nhập có thể thêm review cho sản phẩm",
  async ({ I }) => {
    const customer = await registerNewCustomer(I);
    const seedProduct = await getSeedProduct(I);
    const productId = getProductId(seedProduct);

    const payload = {
      productId,
      author: customer.fullName,
      rating: 5,
      comment: `Codecept catalog review ${uniqueSuffix()}`,
    };

    const res = await I.sendPostRequest(
      `/api/products/${productId}/reviews`,
      payload,
      authHeaders(customer.token),
    );

    assert2xx(res, `POST /api/products/${productId}/reviews thất bại`);

    const review = extractReview(res.data);

    assert.strictEqual(
      toNumber(pick(review, "productId", "ProductId")),
      productId,
      "Review được tạo không đúng productId",
    );

    assert.strictEqual(
      Number(pick(review, "rating", "Rating")),
      payload.rating,
      "Rating của review không đúng",
    );

    assert.strictEqual(
      String(pick(review, "comment", "Comment")),
      payload.comment,
      "Comment của review không đúng",
    );
  },
);

Scenario(
  "Category GetAll: lấy danh sách danh mục thành công",
  async ({ I }) => {
    const { categories } = await getCategoryList(I);

    assert(
      categories.length > 0,
      "API /api/categories không trả về category nào",
    );

    const firstCategory = categories[0];

    assert(
      getCategoryId(firstCategory) > 0,
      "Category đầu tiên không có id hợp lệ",
    );

    assert(
      getCategoryName(firstCategory).length > 0,
      "Category đầu tiên không có name",
    );
  },
);

Scenario("Category GetById: lấy chi tiết danh mục theo id", async ({ I }) => {
  const seedCategory = await getSeedCategory(I);
  const categoryId = getCategoryId(seedCategory);

  const res = await I.sendGetRequest(`/api/categories/${categoryId}`);

  assert2xx(res, `GET /api/categories/${categoryId} thất bại`);

  const category = extractProduct(res.data);

  assert.strictEqual(
    getCategoryId(category),
    categoryId,
    "Category id trả về không đúng",
  );

  assert(
    getCategoryName(category).length > 0,
    "Chi tiết category không có name",
  );

  const slug = getCategorySlug(category);

  assert(slug.length > 0, "Chi tiết category không có slug");
});
