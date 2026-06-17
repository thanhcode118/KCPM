const assert = require("assert");

Feature("FE - Add To Cart Full Flow");

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function extractProducts(responseData) {
  if (Array.isArray(responseData)) return responseData;

  if (Array.isArray(responseData.items)) return responseData.items;
  if (Array.isArray(responseData.products)) return responseData.products;
  if (Array.isArray(responseData.result)) return responseData.result;

  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.data?.items)) return responseData.data.items;
  if (Array.isArray(responseData.data?.products)) {
    return responseData.data.products;
  }
  if (Array.isArray(responseData.data?.result)) return responseData.data.result;

  return [];
}

async function getProducts(I) {
  const res = await I.sendGetRequest("/api/products?page=1&pageSize=200");

  assert(
    res.status >= 200 && res.status < 300,
    `API /api/products trả về status ${res.status}`,
  );

  const products = extractProducts(res.data);

  assert(
    products.length > 0,
    `API /api/products không có sản phẩm. Response: ${JSON.stringify(res.data)}`,
  );

  return products.map((rawProduct) => ({
    id: rawProduct.id || rawProduct.productId,
    name: rawProduct.name || rawProduct.productName,
    sku: rawProduct.sku,
    price: rawProduct.price,
  }));
}

async function getFirstProductFromApi(I) {
  const products = await getProducts(I);

  const product = products[0];

  assert(
    product.id,
    `Sản phẩm không có id/productId. Product: ${JSON.stringify(product)}`,
  );

  return product;
}

async function resetGuestCartFromHome(I) {
  I.amOnPage("/");

  I.waitForElement("body", 15);
  I.wait(2);

  await I.executeScript(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("guest-cart");
    sessionStorage.clear();
  });

  I.refreshPage();

  I.waitForElement("body", 15);
  I.wait(2);
}

async function openFirstProductFromHomepage(I) {
  const products = await getProducts(I);

  I.amOnPage("/");

  I.waitForElement("body", 15);
  I.wait(5);

  const pageText = await I.grabTextFrom("body");
  const normalizedPageText = normalizeText(pageText);

  const visibleProduct = products.find((product) => {
    return (
      product.id &&
      product.name &&
      normalizedPageText.includes(normalizeText(product.name))
    );
  });

  assert(
    visibleProduct,
    `Không tìm thấy sản phẩm nào từ API đang hiển thị trên Homepage. Nội dung trang hiện tại: ${pageText}`,
  );

  const clickResult = await I.executeScript((productName) => {
    const normalizeText = (value) =>
      String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const productText = normalizeText(productName);

    const elements = Array.from(
      document.querySelectorAll(
        "a, button, div, article, section, app-product-card, .card, .product-card, .product-item",
      ),
    );

    const candidates = elements
      .filter((element) => {
        const text = normalizeText(element.innerText || element.textContent);
        const rect = element.getBoundingClientRect();

        return (
          text.includes(productText) &&
          rect.width > 0 &&
          rect.height > 0 &&
          element.tagName !== "BODY" &&
          element.tagName !== "HTML"
        );
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();

        return {
          element,
          area: rect.width * rect.height,
          textLength: String(element.innerText || element.textContent || "")
            .length,
        };
      })
      .sort((a, b) => {
        if (a.area !== b.area) return a.area - b.area;
        return a.textLength - b.textLength;
      });

    if (candidates.length === 0) {
      return {
        clicked: false,
        reason: "Không tìm thấy element chứa tên sản phẩm",
        productName,
        currentUrl: window.location.href,
      };
    }

    const productElement = candidates[0].element;

    const clickableElement =
      productElement.closest("a") ||
      productElement.closest("button") ||
      productElement.closest("[routerlink]") ||
      productElement.closest("[ng-reflect-router-link]") ||
      productElement.closest("[role='button']") ||
      productElement.querySelector("a") ||
      productElement.querySelector("button") ||
      productElement.querySelector("[routerlink]") ||
      productElement.querySelector("[ng-reflect-router-link]") ||
      productElement.querySelector("[role='button']") ||
      productElement;

    const eventOptions = {
      bubbles: true,
      cancelable: true,
      view: window,
    };

    clickableElement.dispatchEvent(new MouseEvent("mouseover", eventOptions));
    clickableElement.dispatchEvent(new MouseEvent("mousedown", eventOptions));
    clickableElement.dispatchEvent(new MouseEvent("mouseup", eventOptions));
    clickableElement.dispatchEvent(new MouseEvent("click", eventOptions));

    return {
      clicked: true,
      productName,
      currentUrl: window.location.href,
      clickedTag: clickableElement.tagName,
      clickedText:
        clickableElement.innerText || clickableElement.textContent || "",
    };
  }, visibleProduct.name);

  assert(
    clickResult.clicked,
    `Không click được sản phẩm "${visibleProduct.name}" trên Homepage. Kết quả: ${JSON.stringify(clickResult)}`,
  );

  I.wait(3);

  const currentUrl = await I.grabCurrentUrl();

  assert(
    currentUrl.includes("/product/"),
    `Đã click sản phẩm "${visibleProduct.name}" nhưng chưa chuyển sang trang chi tiết. URL hiện tại: ${currentUrl}. Click result: ${JSON.stringify(clickResult)}`,
  );

  return {
    id: visibleProduct.id,
    name: visibleProduct.name,
    href: currentUrl,
  };
}

async function clickAddToCartButton(I) {
  const clickedResult = await I.executeScript(() => {
    const normalizeText = (value) =>
      String(value || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const buttons = Array.from(document.querySelectorAll("button"));

    const addToCartButton = buttons.find((button) => {
      const text = normalizeText(button.innerText || button.textContent);

      return (
        text.includes("them vao gio hang") ||
        text.includes("them vao gio") ||
        text.includes("add to cart")
      );
    });

    if (!addToCartButton) {
      return {
        clicked: false,
        buttonTexts: buttons.map(
          (button) => button.innerText || button.textContent || "",
        ),
      };
    }

    addToCartButton.click();

    return {
      clicked: true,
      buttonTexts: buttons.map(
        (button) => button.innerText || button.textContent || "",
      ),
    };
  });

  assert(
    clickedResult.clicked,
    `Không tìm thấy nút THÊM VÀO GIỎ HÀNG. Các button hiện có: ${JSON.stringify(clickedResult.buttonTexts)}`,
  );
}

async function readGuestCart(I, productId = null) {
  return await I.executeScript((id) => {
    const rawCart = localStorage.getItem("guest-cart");

    if (!rawCart) {
      return {
        hasCart: false,
        rawCart: null,
        items: [],
        matchedItem: null,
        subtotal: 0,
      };
    }

    try {
      const cart = JSON.parse(rawCart);
      const items = Array.isArray(cart.items) ? cart.items : [];

      const matchedItem = id
        ? items.find((item) => Number(item.productId) === Number(id))
        : null;

      return {
        hasCart: true,
        rawCart,
        items,
        matchedItem: matchedItem || null,
        subtotal: Number(cart.subtotal || 0),
      };
    } catch (error) {
      return {
        hasCart: true,
        rawCart,
        parseError: error.message,
        items: [],
        matchedItem: null,
        subtotal: 0,
      };
    }
  }, productId);
}

async function assertCartHasProduct(I, productId, minQuantity = 1) {
  const cartResult = await readGuestCart(I, productId);

  assert(
    cartResult.hasCart,
    "Sau khi bấm thêm vào giỏ hàng, localStorage không có guest-cart",
  );

  assert(
    Array.isArray(cartResult.items),
    `guest-cart không có mảng items hợp lệ. Cart: ${cartResult.rawCart}`,
  );

  assert(
    cartResult.matchedItem,
    `Đã bấm thêm sản phẩm id=${productId} nhưng guest-cart không có sản phẩm này. Cart hiện tại: ${cartResult.rawCart}`,
  );

  assert(
    Number(cartResult.matchedItem.quantity) >= minQuantity,
    `Số lượng sản phẩm trong giỏ không đúng. Cần >= ${minQuantity}. Item: ${JSON.stringify(cartResult.matchedItem)}`,
  );

  return cartResult;
}

async function clickQuantityMinus(I) {
  return await I.executeScript(() => {
    const buttons = Array.from(document.querySelectorAll("button"));

    const minusButton = buttons.find((button) => {
      const text = String(button.innerText || button.textContent || "").trim();

      return text === "-" || text === "−";
    });

    if (!minusButton) {
      return {
        clicked: false,
        buttonTexts: buttons.map(
          (button) => button.innerText || button.textContent || "",
        ),
      };
    }

    minusButton.click();

    return {
      clicked: true,
      buttonTexts: buttons.map(
        (button) => button.innerText || button.textContent || "",
      ),
    };
  });
}

Scenario(
  "OK: Đi từ Homepage vào chi tiết sản phẩm rồi thêm vào giỏ hàng thành công",
  async ({ I }) => {
    await resetGuestCartFromHome(I);

    const product = await openFirstProductFromHomepage(I);

    await clickAddToCartButton(I);

    I.wait(1);

    await assertCartHasProduct(I, product.id, 1);
  },
);

Scenario(
  "OK: Thêm cùng một sản phẩm 2 lần thì số lượng trong giỏ phải tăng",
  async ({ I }) => {
    await resetGuestCartFromHome(I);

    const product = await openFirstProductFromHomepage(I);

    await clickAddToCartButton(I);

    I.wait(1);

    await clickAddToCartButton(I);

    I.wait(1);

    await assertCartHasProduct(I, product.id, 2);
  },
);

Scenario(
  "OK: Giỏ hàng guest-cart vẫn còn sau khi refresh trang",
  async ({ I }) => {
    await resetGuestCartFromHome(I);

    const product = await openFirstProductFromHomepage(I);

    await clickAddToCartButton(I);

    I.wait(1);

    await assertCartHasProduct(I, product.id, 1);

    I.refreshPage();

    I.waitForElement("body", 15);
    I.wait(1);

    await assertCartHasProduct(I, product.id, 1);
  },
);

Scenario(
  "OK: Số lượng sản phẩm không được giảm dưới 1 trước khi thêm vào giỏ hàng",
  async ({ I }) => {
    await resetGuestCartFromHome(I);

    const product = await openFirstProductFromHomepage(I);

    await clickQuantityMinus(I);
    await clickQuantityMinus(I);
    await clickQuantityMinus(I);

    await clickAddToCartButton(I);

    I.wait(1);

    const cartResult = await assertCartHasProduct(I, product.id, 1);

    assert(
      Number(cartResult.matchedItem.quantity) >= 1,
      `Số lượng sản phẩm không được nhỏ hơn 1. Quantity hiện tại: ${cartResult.matchedItem.quantity}`,
    );
  },
);

Scenario(
  "BUG: Mở trực tiếp URL trang chi tiết rồi thêm vào giỏ hàng không lưu sản phẩm",
  async ({ I }) => {
    const product = await getFirstProductFromApi(I);

    await resetGuestCartFromHome(I);

    I.amOnPage(`/product/${product.id}`);

    I.waitForElement("body", 15);
    I.wait(2);

    await clickAddToCartButton(I);

    I.wait(1);

    const cartResult = await readGuestCart(I, product.id);

    assert(
      cartResult.hasCart,
      "BUG: Sau khi bấm thêm vào giỏ hàng, localStorage không có guest-cart",
    );

    assert(
      Array.isArray(cartResult.items),
      `BUG: guest-cart không có mảng items hợp lệ. Cart: ${cartResult.rawCart}`,
    );

    assert(
      cartResult.matchedItem,
      `BUG: Mở trực tiếp /product/${product.id}, bấm thêm giỏ hàng nhưng guest-cart không có sản phẩm này. Cart hiện tại: ${cartResult.rawCart}`,
    );

    assert(
      Number(cartResult.matchedItem.quantity) >= 1,
      `BUG: Sản phẩm có trong giỏ nhưng quantity không hợp lệ. Item: ${JSON.stringify(cartResult.matchedItem)}`,
    );
  },
);

Scenario(
  "BUG: Sau khi thêm sản phẩm, subtotal trong guest-cart phải lớn hơn 0",
  async ({ I }) => {
    await resetGuestCartFromHome(I);

    const product = await openFirstProductFromHomepage(I);

    await clickAddToCartButton(I);

    I.wait(1);

    const cartResult = await assertCartHasProduct(I, product.id, 1);

    const totalFromItems = cartResult.items.reduce((sum, item) => {
      return sum + Number(item.unitPrice || 0) * Number(item.quantity || 0);
    }, 0);

    assert(
      totalFromItems > 0,
      `Không tính được tổng tiền từ items. Cart: ${cartResult.rawCart}`,
    );

    assert(
      Number(cartResult.subtotal) === Number(totalFromItems),
      `BUG: subtotal trong guest-cart bị sai. Expected: ${totalFromItems}, Actual: ${cartResult.subtotal}. Cart: ${cartResult.rawCart}`,
    );
  },
);

Scenario(
  "OK: guest-cart bị dữ liệu lỗi thì trang không được crash",
  async ({ I }) => {
    const product = await getFirstProductFromApi(I);

    I.amOnPage("/");

    I.waitForElement("body", 15);

    await I.executeScript(() => {
      localStorage.removeItem("token");
      localStorage.setItem("guest-cart", "undefined");
      sessionStorage.clear();
    });

    I.amOnPage(`/product/${product.id}`);

    I.waitForElement("body", 15);
    I.wait(2);

    const bodyText = await I.grabTextFrom("body");
    const normalizedText = normalizeText(bodyText);

    assert(
      bodyText && bodyText.length > 0,
      "Trang bị crash hoặc không hiển thị nội dung khi guest-cart bị lỗi dữ liệu",
    );

    assert(
      !normalizedText.includes("application error"),
      `Trang hiển thị lỗi application error. Nội dung: ${bodyText}`,
    );
  },
);
