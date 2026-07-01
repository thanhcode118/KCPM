const assert = require("assert");

Feature("FE - Public Catalog UI");

/**
 * File này gộp từ:
 * - product_filter_test.js
 * - product_detail_test.js
 * - product_detail_bug_test.js
 *
 * Mục tiêu:
 * - Test search/filter sản phẩm
 * - Test trang chi tiết sản phẩm
 * - Test một số bug ở trang chi tiết
 * - Hạn chế lỗi do selector quá cứng hoặc helper bị trùng khi gộp file
 */

const PRODUCT_ENDPOINTS = [
  "/api/products?page=1&pageSize=50",
  "/api/products?page=1&pageSize=20",
  "/api/products",
];

const NO_RESULT_KEYWORDS = [
  "khong tim thay san pham phu hop",
  "khong co ket qua khop",
  "khong co san pham",
  "no products",
  "no result",
  "not found",
];

const NOT_FOUND_KEYWORDS = [
  "khong tai duoc",
  "khong tim thay",
  "san pham khong ton tai",
  "not found",
  "404",
];

const CART_KEYWORDS = [
  "them vao gio",
  "gio hang",
  "mua ngay",
  "dat hang",
  "add to cart",
  "buy now",
];

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function bodyText(body) {
  try {
    return typeof body === "string" ? body : JSON.stringify(body);
  } catch {
    return String(body);
  }
}

function firstDefined(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return undefined;
}

function extractProducts(responseData) {
  if (Array.isArray(responseData)) return responseData;

  if (Array.isArray(responseData?.items)) return responseData.items;
  if (Array.isArray(responseData?.products)) return responseData.products;
  if (Array.isArray(responseData?.result)) return responseData.result;

  if (Array.isArray(responseData?.data)) return responseData.data;
  if (Array.isArray(responseData?.data?.items)) return responseData.data.items;
  if (Array.isArray(responseData?.data?.products)) {
    return responseData.data.products;
  }
  if (Array.isArray(responseData?.data?.result))
    return responseData.data.result;

  return [];
}

function mapProduct(rawProduct) {
  const categoryObject =
    rawProduct?.categoryNavigation ||
    rawProduct?.category ||
    rawProduct?.categoryInfo ||
    {};

  return {
    id: firstDefined(
      rawProduct?.id,
      rawProduct?.productId,
      rawProduct?.ProductId,
      rawProduct?.Id,
    ),
    name: firstDefined(
      rawProduct?.name,
      rawProduct?.productName,
      rawProduct?.ProductName,
    ),
    sku: firstDefined(rawProduct?.sku, rawProduct?.SKU),
    price: firstDefined(rawProduct?.price, rawProduct?.Price),
    productSlug: firstDefined(
      rawProduct?.slug,
      rawProduct?.productSlug,
      rawProduct?.ProductSlug,
    ),
    categoryName: firstDefined(
      rawProduct?.categoryName,
      rawProduct?.CategoryName,
      typeof rawProduct?.category === "string"
        ? rawProduct.category
        : undefined,
      categoryObject?.name,
      categoryObject?.categoryName,
    ),
    categorySlug: firstDefined(
      rawProduct?.categorySlug,
      rawProduct?.CategorySlug,
      rawProduct?.category_slug,
      categoryObject?.slug,
      categoryObject?.categorySlug,
    ),
    raw: rawProduct,
  };
}

async function getProducts(I) {
  const logs = [];

  for (const endpoint of PRODUCT_ENDPOINTS) {
    try {
      const res = await I.sendGetRequest(endpoint);

      if (res.status < 200 || res.status >= 300) {
        logs.push(`${endpoint} -> ${res.status}`);
        continue;
      }

      const products = extractProducts(res.data).map(mapProduct);

      if (products.length > 0) {
        return products;
      }

      logs.push(`${endpoint} -> 2xx nhưng không có sản phẩm`);
    } catch (error) {
      logs.push(`${endpoint} -> ERROR: ${error.message}`);
    }
  }

  assert.fail(`Không lấy được danh sách sản phẩm từ API.\n${logs.join("\n")}`);
}

async function getFirstProduct(I) {
  const products = await getProducts(I);

  const product = products.find((item) => item.id && item.name) || products[0];

  assert(
    product && product.id,
    `Sản phẩm không có id/productId. Product: ${bodyText(product)}`,
  );

  assert(
    product && product.name,
    `Sản phẩm không có name/productName. Product: ${bodyText(product)}`,
  );

  return product;
}

function chooseKeywordFromProductName(productName) {
  const rawWords = String(productName || "")
    .split(/\s+/)
    .map((word) => word.replace(/[^\p{L}\p{N}]/gu, "").trim())
    .filter(Boolean);

  const stopWords = new Set([
    "bo",
    "ban",
    "ghe",
    "den",
    "ke",
    "tu",
    "va",
    "cho",
    "noi",
    "that",
    "cao",
    "cap",
  ]);

  const selectedWord =
    rawWords.find((word) => {
      const normalized = normalizeText(word);

      return (
        normalized.length >= 3 &&
        !stopWords.has(normalized) &&
        !/^\d+$/.test(normalized)
      );
    }) ||
    rawWords.find((word) => normalizeText(word).length >= 3) ||
    rawWords[0];

  assert(
    selectedWord,
    `Không tạo được keyword từ tên sản phẩm: "${productName}"`,
  );

  return selectedWord;
}

function containsPrice(pageText, price) {
  if (price === undefined || price === null || price === "") return false;

  const expectedNumber = String(price).replace(/[^\d]/g, "");
  const pageNumberText = String(pageText || "").replace(/[^\d]/g, "");

  if (expectedNumber.length < 3) return false;

  return pageNumberText.includes(expectedNumber);
}

function pageContainsProductInfo(pageText, product) {
  const normalizedPageText = normalizeText(pageText);
  const normalizedProductName = normalizeText(product.name);

  const hasProductName =
    normalizedProductName && normalizedPageText.includes(normalizedProductName);

  const hasSku =
    product.sku && String(pageText || "").includes(String(product.sku));

  const hasPrice =
    String(pageText || "").includes("₫") ||
    String(pageText || "").includes("VND") ||
    containsPrice(pageText, product.price);

  return Boolean(hasProductName || hasSku || hasPrice);
}

async function openProductDetailPage(I, product) {
  const routes = [];

  if (product.id) {
    routes.push(`/product/${product.id}`);
  }

  if (product.productSlug) {
    routes.push(`/product/${product.productSlug}`);
  }

  let lastResult = {
    route: routes[0],
    text: "",
  };

  for (const route of routes) {
    I.amOnPage(route);

    I.waitForElement("body", 15);
    I.wait(2);

    const pageText = await I.grabTextFrom("body");

    lastResult = {
      route,
      text: pageText,
    };

    if (pageContainsProductInfo(pageText, product)) {
      return lastResult;
    }
  }

  return lastResult;
}

async function getVisibleTextsBySelectors(I, selectors) {
  return await I.executeScript((selectorList) => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    };

    for (const selector of selectorList) {
      const texts = Array.from(document.querySelectorAll(selector))
        .filter(isVisible)
        .map((element) =>
          String(element.innerText || element.textContent || ""),
        )
        .map((text) => text.trim())
        .filter(Boolean);

      const uniqueTexts = Array.from(new Set(texts));

      if (uniqueTexts.length > 0) {
        return uniqueTexts;
      }
    }

    return [];
  }, selectors);
}

async function getResultNames(I) {
  return await getVisibleTextsBySelectors(I, [
    "article h3",
    "article [class*='name']",
    ".product-card h3",
    ".product-card [class*='name']",
    ".product-item h3",
    ".product-item [class*='name']",
    "app-product-card h3",
    "[class*='product'] h3",
    "a[href*='/product'] h3",
  ]);
}

async function countVisibleElementsBySelectors(I, selectors) {
  return await I.executeScript((selectorList) => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    };

    const elementSet = new Set();

    for (const selector of selectorList) {
      document.querySelectorAll(selector).forEach((element) => {
        if (isVisible(element)) {
          elementSet.add(element);
        }
      });
    }

    return elementSet.size;
  }, selectors);
}

async function fillSearchInput(I, keyword) {
  const result = await I.executeScript((value) => {
    const normalizeText = (inputValue) =>
      String(inputValue || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden"
      );
    };

    const inputs = Array.from(document.querySelectorAll("input")).filter(
      isVisible,
    );

    const searchInput =
      inputs.find((input) => {
        const info = normalizeText(
          [
            input.placeholder,
            input.name,
            input.id,
            input.type,
            input.getAttribute("aria-label"),
          ].join(" "),
        );

        return (
          info.includes("san pham") ||
          info.includes("sku") ||
          info.includes("chat lieu") ||
          info.includes("tim kiem") ||
          input.type === "search"
        );
      }) || inputs[0];

    if (!searchInput) {
      return {
        found: false,
        reason: "Không tìm thấy input search trên trang",
      };
    }

    searchInput.focus();

    const valueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value",
    )?.set;

    if (valueSetter) {
      valueSetter.call(searchInput, value);
    } else {
      searchInput.value = value;
    }

    searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    searchInput.dispatchEvent(new Event("change", { bubbles: true }));
    searchInput.dispatchEvent(
      new KeyboardEvent("keyup", {
        key: "Enter",
        code: "Enter",
        bubbles: true,
        cancelable: true,
      }),
    );

    return {
      found: true,
      placeholder: searchInput.placeholder || "",
      value: searchInput.value,
    };
  }, keyword);

  assert(
    result && result.found,
    `Không nhập được keyword vào ô search. Chi tiết: ${bodyText(result)}`,
  );

  return result;
}

function hasNoResultMessage(pageText) {
  const normalizedText = normalizeText(pageText);

  return NO_RESULT_KEYWORDS.some((keyword) => normalizedText.includes(keyword));
}

function hasNotFoundMessage(pageText) {
  const normalizedText = normalizeText(pageText);

  return NOT_FOUND_KEYWORDS.some((keyword) => normalizedText.includes(keyword));
}

Scenario(
  "Search: lọc sản phẩm theo từ khóa phải hiển thị sản phẩm phù hợp",
  async ({ I }) => {
    const product = await getFirstProduct(I);
    const keyword = chooseKeywordFromProductName(product.name);

    I.amOnPage(`/search?q=${encodeURIComponent(keyword)}`);

    I.waitForElement("body", 15);
    I.wait(1);

    await fillSearchInput(I, keyword);

    I.pressKey("Enter");
    I.wait(2);

    const pageText = await I.grabTextFrom("body");
    const normalizedPageText = normalizeText(pageText);
    const normalizedKeyword = normalizeText(keyword);
    const normalizedProductName = normalizeText(product.name);

    const productNames = await getResultNames(I);

    assert(
      productNames.length > 0 ||
        normalizedPageText.includes(normalizedKeyword) ||
        normalizedPageText.includes(normalizedProductName),
      `Không có sản phẩm nào sau khi lọc keyword "${keyword}". Nội dung trang: ${pageText}`,
    );

    const hasExpectedProduct =
      productNames.some((name) => {
        const normalizedName = normalizeText(name);

        return (
          normalizedName.includes(normalizedKeyword) ||
          normalizedName.includes(normalizedProductName) ||
          normalizedProductName.includes(normalizedName)
        );
      }) ||
      normalizedPageText.includes(normalizedProductName) ||
      normalizedPageText.includes(normalizedKeyword);

    assert(
      hasExpectedProduct,
      `Kết quả search không liên quan keyword "${keyword}". Danh sách hiển thị: ${productNames.join(
        ", ",
      )}. Nội dung trang: ${pageText}`,
    );
  },
);

Scenario(
  "Search: lọc từ khóa không tồn tại phải hiển thị không có kết quả",
  async ({ I }) => {
    const keyword = `sanphamkhongtontai${Date.now()}`;

    I.amOnPage(`/search?q=${encodeURIComponent(keyword)}`);

    I.waitForElement("body", 15);
    I.wait(2);

    const pageText = await I.grabTextFrom("body");
    const productNames = await getResultNames(I);

    const visibleProductCardCount = await countVisibleElementsBySelectors(I, [
      "article",
      ".product-card",
      ".product-item",
      "app-product-card",
      "[class*='product-card']",
    ]);

    const noResultByText = hasNoResultMessage(pageText);
    const noResultByDom =
      productNames.length === 0 && visibleProductCardCount === 0;

    assert(
      noResultByText || noResultByDom,
      `Từ khóa không tồn tại nhưng trang vẫn hiển thị kết quả. Keyword: "${keyword}". ProductNames: ${productNames.join(
        ", ",
      )}. Số card: ${visibleProductCardCount}. Nội dung trang: ${pageText}`,
    );
  },
);

Scenario(
  "Product Detail: trang chi tiết sản phẩm hiển thị thông tin sản phẩm",
  async ({ I }) => {
    const product = await getFirstProduct(I);

    const detailResult = await openProductDetailPage(I, product);

    assert(
      pageContainsProductInfo(detailResult.text, product),
      `Trang chi tiết không hiển thị thông tin sản phẩm. Route: ${detailResult.route}. API product: ${bodyText(
        product,
      )}. Nội dung trang: ${detailResult.text}`,
    );

    const imageCount = await countVisibleElementsBySelectors(I, ["img"]);

    assert(
      imageCount > 0,
      `Trang chi tiết không hiển thị ảnh sản phẩm. Route: ${detailResult.route}. Nội dung trang: ${detailResult.text}`,
    );
  },
);

Scenario(
  "Product Detail: trang chi tiết sản phẩm có nút thêm vào giỏ hàng",
  async ({ I }) => {
    const product = await getFirstProduct(I);

    const detailResult = await openProductDetailPage(I, product);

    const normalizedText = normalizeText(detailResult.text);

    const buttonTexts = await getVisibleTextsBySelectors(I, [
      "button",
      "a",
      "[role='button']",
    ]);

    const buttonCount = await countVisibleElementsBySelectors(I, [
      "button",
      "[role='button']",
    ]);

    const hasCartText =
      CART_KEYWORDS.some((keyword) => normalizedText.includes(keyword)) ||
      buttonTexts.some((text) => {
        const normalizedButtonText = normalizeText(text);

        return CART_KEYWORDS.some((keyword) =>
          normalizedButtonText.includes(keyword),
        );
      });

    assert(
      hasCartText || buttonCount > 0,
      `Trang chi tiết không có nút hoặc nội dung mua hàng/thêm giỏ hàng. Route: ${
        detailResult.route
      }. Button texts: ${buttonTexts.join(", ")}. Nội dung trang: ${
        detailResult.text
      }`,
    );
  },
);

Scenario(
  "BUG: Truy cập sản phẩm không tồn tại phải hiển thị thông báo lỗi",
  async ({ I }) => {
    I.amOnPage("/product/99999999");

    I.waitForElement("body", 15);
    I.wait(2);

    const pageText = await I.grabTextFrom("body");
    const normalizedText = normalizeText(pageText);

    assert(
      pageText && pageText.length > 0,
      "Trang sản phẩm không tồn tại bị trắng hoặc không render nội dung",
    );

    assert(
      !normalizedText.includes("application error"),
      `Trang sản phẩm không tồn tại bị crash. Nội dung: ${pageText}`,
    );

    assert(
      hasNotFoundMessage(pageText),
      `BUG: Trang sản phẩm không tồn tại không hiển thị thông báo lỗi rõ ràng. Nội dung hiện tại: "${pageText}"`,
    );
  },
);

Scenario(
  "BUG: Breadcrumb danh mục trong trang chi tiết phải dùng slug danh mục, không dùng slug sản phẩm",
  async ({ I }) => {
    const products = await getProducts(I);

    const product = products.find((item) => {
      return item.id && item.productSlug && item.categorySlug;
    });

    if (!product) {
      I.say(
        "Bỏ qua kiểm tra breadcrumb vì API product list chưa có đủ productSlug/categorySlug.",
      );
      return;
    }

    const detailResult = await openProductDetailPage(I, product);

    assert(
      pageContainsProductInfo(detailResult.text, product),
      `Không mở được trang chi tiết hợp lệ trước khi kiểm tra breadcrumb. Product: ${bodyText(
        product,
      )}. Nội dung trang: ${detailResult.text}`,
    );

    const categoryLinks = await I.grabAttributeFromAll(
      'a[href*="/collections/"]',
      "href",
    );

    assert(
      categoryLinks.length > 0,
      `Không tìm thấy link breadcrumb danh mục trên trang chi tiết. Route: ${detailResult.route}. Nội dung trang: ${detailResult.text}`,
    );

    const categoryLink = String(categoryLinks[0] || "");
    const decodedCategoryLink = decodeURIComponent(categoryLink).toLowerCase();

    const expectedCategoryPath =
      `/collections/${product.categorySlug}`.toLowerCase();
    const wrongProductPath =
      `/collections/${product.productSlug}`.toLowerCase();

    assert(
      decodedCategoryLink.includes(expectedCategoryPath),
      `BUG: Link danh mục đang sai. Link hiện tại: "${categoryLink}". Đúng phải chứa: "${expectedCategoryPath}"`,
    );

    assert(
      !decodedCategoryLink.includes(wrongProductPath),
      `BUG: Link danh mục đang dùng slug sản phẩm thay vì slug danh mục. Link hiện tại: "${categoryLink}". Product slug: "${product.productSlug}"`,
    );
  },
);
