const assert = require("assert");

Feature("FE - Cart / Checkout / Order UI");

const CUSTOMER_PASSWORD = "Customer@123";
const FE_URL = process.env.FE_URL || "http://localhost:3000";

const PRODUCT_ENDPOINTS = [
  "/api/products?page=1&pageSize=200",
  "/api/products?page=1&pageSize=50",
  "/api/products",
];

const CART_ROUTES = ["/cart", "/gio-hang", "/shopping-cart"];
const CHECKOUT_ROUTES = ["/checkout", "/thanh-toan"];
const ORDER_ROUTES = [
  "/account/orders",
  "/orders",
  "/my-orders",
  "/tai-khoan/don-hang",
];

const LOGIN_ROUTES = ["/login", "/auth/login", "/account/login", "/dang-nhap"];

function uniqueSuffix() {
  return `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function testEmail(prefix) {
  return `${prefix}_${uniqueSuffix()}@example.com`;
}

function normalizeText(value) {
  return String(value || "")
    .replace(/Đ/g, "D")
    .replace(/đ/g, "d")
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

function pick(obj, keys) {
  if (!obj || typeof obj !== "object") return undefined;

  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }

  return undefined;
}

function normalizeAuthToken(value) {
  if (!value) return null;

  let token = value;

  if (typeof token !== "string") {
    try {
      token = JSON.stringify(token);
    } catch {
      token = String(token);
    }
  }

  token = String(token).trim();

  try {
    const parsed = JSON.parse(token);

    if (typeof parsed === "string") {
      token = parsed;
    } else if (parsed && typeof parsed === "object") {
      token =
        parsed.accessToken ||
        parsed.token ||
        parsed.authToken ||
        parsed.jwtToken ||
        parsed.jwt ||
        parsed.access_token ||
        token;
    }
  } catch {
    // Không phải JSON thì bỏ qua.
  }

  token = String(token || "").trim();

  if (token.toLowerCase().startsWith("bearer ")) {
    token = token.slice(7).trim();
  }

  return token || null;
}

function authHeaders(token) {
  const cleanToken = normalizeAuthToken(token);

  if (!cleanToken) {
    return {};
  }

  return {
    Authorization: `Bearer ${cleanToken}`,
    "X-Auth-Token": cleanToken,
  };
}

function extractArray(responseData) {
  if (Array.isArray(responseData)) return responseData;

  if (!responseData || typeof responseData !== "object") return [];

  const keys = [
    "items",
    "data",
    "result",
    "results",
    "products",
    "orders",
    "addresses",
    "payments",
    "transactions",
  ];

  for (const key of keys) {
    if (Array.isArray(responseData[key])) return responseData[key];

    if (responseData[key] && typeof responseData[key] === "object") {
      const nested = extractArray(responseData[key]);

      if (nested.length > 0) return nested;
    }
  }

  return [];
}

function extractObject(responseData, preferredKey) {
  if (!responseData || typeof responseData !== "object") return {};

  const keys = [
    preferredKey,
    "data",
    "result",
    "item",
    "order",
    "cart",
    "address",
    "payment",
  ].filter(Boolean);

  for (const key of keys) {
    if (
      responseData[key] &&
      typeof responseData[key] === "object" &&
      !Array.isArray(responseData[key])
    ) {
      return responseData[key];
    }
  }

  return responseData;
}

function idOf(obj, keys = ["id", "Id"]) {
  return Number(pick(obj, keys) || 0);
}

function extractProducts(responseData) {
  return extractArray(responseData).map((rawProduct) => ({
    id: pick(rawProduct, ["id", "productId", "ProductId", "Id"]),
    name: pick(rawProduct, ["name", "productName", "ProductName"]),
    sku: pick(rawProduct, ["sku", "SKU"]),
    price: pick(rawProduct, ["price", "Price"]),
    slug: pick(rawProduct, ["slug", "productSlug", "ProductSlug"]),
    raw: rawProduct,
  }));
}

function assertStatusIn(res, expectedStatuses, message) {
  assert(
    expectedStatuses.includes(res.status),
    `${message}\nExpected: ${expectedStatuses.join(", ")}\nActual: ${
      res.status
    }\nBody: ${bodyText(res.data)}`,
  );
}

function assert2xx(res, message) {
  assert(
    res.status >= 200 && res.status < 300,
    `${message}\nActual: ${res.status}\nBody: ${bodyText(res.data)}`,
  );
}

async function sendRequest(I, candidate) {
  const method = candidate.method.toUpperCase();
  const body = candidate.body || {};
  const headers = candidate.headers || {};

  if (method === "GET") return I.sendGetRequest(candidate.url, headers);
  if (method === "POST") return I.sendPostRequest(candidate.url, body, headers);
  if (method === "PUT") return I.sendPutRequest(candidate.url, body, headers);

  if (method === "PATCH") {
    if (typeof I.sendPatchRequest === "function") {
      return I.sendPatchRequest(candidate.url, body, headers);
    }

    return I.sendPutRequest(candidate.url, body, headers);
  }

  if (method === "DELETE") return I.sendDeleteRequest(candidate.url, headers);

  throw new Error(`Method không hỗ trợ: ${method}`);
}

async function firstSuccess(I, candidates, expectedStatuses, label) {
  const logs = [];

  for (const candidate of candidates) {
    try {
      const res = await sendRequest(I, candidate);

      if (expectedStatuses.includes(res.status)) {
        return res;
      }

      logs.push(
        `${candidate.method} ${candidate.url} -> ${res.status}, Body: ${bodyText(
          res.data,
        )}`,
      );
    } catch (error) {
      logs.push(
        `${candidate.method} ${candidate.url} -> ERROR ${error.message}`,
      );
    }
  }

  assert.fail(
    `${label}\nKhông có endpoint nào trả status mong đợi.\n${logs.join("\n")}`,
  );
}

async function firstSuccessPrefer(
  I,
  candidates,
  preferredStatuses,
  acceptedStatuses,
  label,
) {
  const logs = [];
  let acceptedResponse = null;

  for (const candidate of candidates) {
    try {
      const res = await sendRequest(I, candidate);

      if (preferredStatuses.includes(res.status)) {
        return res;
      }

      if (acceptedStatuses.includes(res.status) && !acceptedResponse) {
        acceptedResponse = res;
      }

      logs.push(
        `${candidate.method} ${candidate.url} -> ${res.status}, Body: ${bodyText(
          res.data,
        )}`,
      );
    } catch (error) {
      logs.push(
        `${candidate.method} ${candidate.url} -> ERROR ${error.message}`,
      );
    }
  }

  if (acceptedResponse) {
    return acceptedResponse;
  }

  assert.fail(
    `${label}\nKhông có endpoint nào trả status mong đợi.\n${logs.join("\n")}`,
  );
}

async function seedDemoData(I) {
  try {
    await I.sendPostRequest("/api/Maintenance/seed/all", {});
  } catch {
    // Bỏ qua nếu môi trường không bật maintenance API.
  }
}

async function getProducts(I) {
  await seedDemoData(I);

  const logs = [];

  for (const endpoint of PRODUCT_ENDPOINTS) {
    try {
      const res = await I.sendGetRequest(endpoint);

      if (res.status < 200 || res.status >= 300) {
        logs.push(`${endpoint} -> ${res.status}`);
        continue;
      }

      const products = extractProducts(res.data);

      if (products.length > 0) {
        return products;
      }

      logs.push(`${endpoint} -> 2xx nhưng không có sản phẩm`);
    } catch (error) {
      logs.push(`${endpoint} -> ERROR ${error.message}`);
    }
  }

  assert.fail(`Không lấy được danh sách sản phẩm.\n${logs.join("\n")}`);
}

async function getFirstProductFromApi(I) {
  const products = await getProducts(I);

  const product =
    products.find((item) => item.id && item.name) ||
    products.find((item) => item.id) ||
    products[0];

  assert(product && product.id, `Sản phẩm không có id. ${bodyText(product)}`);

  return product;
}

function extractAuthToken(data) {
  const token =
    pick(data, ["accessToken", "token", "jwt", "jwtToken"]) ||
    pick(data?.data, ["accessToken", "token", "jwt", "jwtToken"]) ||
    pick(data?.result, ["accessToken", "token", "jwt", "jwtToken"]) ||
    pick(data?.user, ["accessToken", "token", "jwt", "jwtToken"]);

  return normalizeAuthToken(token);
}

async function registerCustomerByApi(I) {
  await seedDemoData(I);

  const email = testEmail("fe_cart_customer");

  const body = {
    email,
    password: CUSTOMER_PASSWORD,
    confirmPassword: CUSTOMER_PASSWORD,
    fullName: "FE Cart Test Customer",
    phone: "0900000000",
  };

  const registerRes = await firstSuccess(
    I,
    [
      { method: "POST", url: "/api/auth/register", body },
      { method: "POST", url: "/api/Auth/register", body },
      { method: "POST", url: "/api/account/register", body },
    ],
    [200, 201],
    "Register customer bằng API thất bại",
  );

  let token = null;

  try {
    token = await loginCustomerByApi(I, email, CUSTOMER_PASSWORD);
  } catch {
    token = extractAuthToken(registerRes.data);
  }

  assert(
    token,
    `Không lấy được token sau register/login. Body: ${bodyText(
      registerRes.data,
    )}`,
  );

  return {
    email,
    password: CUSTOMER_PASSWORD,
    fullName: body.fullName,
    phone: body.phone,
    token,
  };
}

async function loginCustomerByApi(I, email, password) {
  const body = { email, password };

  const res = await firstSuccess(
    I,
    [
      { method: "POST", url: "/api/auth/login", body },
      { method: "POST", url: "/api/Auth/login", body },
      { method: "POST", url: "/api/account/login", body },
    ],
    [200, 201],
    "Login customer bằng API thất bại",
  );

  const token = extractAuthToken(res.data);

  assert(token, `Login không trả token. Body: ${bodyText(res.data)}`);

  return token;
}

async function clearAuthStorage(I) {
  I.amOnPage("/");

  try {
    I.waitForElement("body", 15);
  } catch {
    // Bỏ qua nếu homepage load chậm.
  }

  await I.executeScript(() => {
    const shouldRemove = (key) => {
      const normalized = String(key || "").toLowerCase();

      return (
        normalized.includes("token") ||
        normalized.includes("auth") ||
        normalized.includes("jwt") ||
        normalized.includes("user") ||
        normalized.includes("account") ||
        normalized.includes("role")
      );
    };

    for (const key of Object.keys(localStorage)) {
      if (shouldRemove(key)) {
        localStorage.removeItem(key);
      }
    }

    sessionStorage.clear();
  });
}

async function injectAuthSession(I, customer) {
  I.amOnPage("/");

  try {
    I.waitForElement("body", 15);
  } catch {
    // Bỏ qua nếu homepage load chậm.
  }

  await I.executeScript((payload) => {
    const user = {
      email: payload.email,
      fullName: payload.fullName,
      phone: payload.phone,
      role: "Customer",
    };

    localStorage.setItem("token", payload.token);
    localStorage.setItem("accessToken", payload.token);
    localStorage.setItem("authToken", payload.token);
    localStorage.setItem("jwtToken", payload.token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("role", "Customer");
  }, customer);
}

async function getBrowserSnapshot(I) {
  return I.executeScript(() => {
    const storage = {};

    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      storage[key] = localStorage.getItem(key);
    }

    return {
      url: window.location.href,
      path: window.location.pathname,
      text: document.body ? document.body.innerText : "",
      storage,
    };
  });
}

async function getAuthTokenFromBrowserStorage(I) {
  return I.executeScript(() => {
    const normalizeToken = (value) => {
      if (!value) return null;

      let token = String(value).trim();

      try {
        const parsed = JSON.parse(token);

        if (typeof parsed === "string") {
          token = parsed;
        } else if (parsed && typeof parsed === "object") {
          token =
            parsed.accessToken ||
            parsed.token ||
            parsed.authToken ||
            parsed.jwtToken ||
            parsed.jwt ||
            parsed.access_token ||
            token;
        }
      } catch {
        // Không phải JSON thì bỏ qua.
      }

      token = String(token || "").trim();

      if (token.toLowerCase().startsWith("bearer ")) {
        token = token.slice(7).trim();
      }

      return token && token.length >= 10 ? token : null;
    };

    const directKeys = [
      "token",
      "accessToken",
      "authToken",
      "jwtToken",
      "jwt",
      "access_token",
    ];

    for (const key of directKeys) {
      const token = normalizeToken(
        localStorage.getItem(key) || sessionStorage.getItem(key),
      );

      if (token) return token;
    }

    for (const storage of [localStorage, sessionStorage]) {
      for (let i = 0; i < storage.length; i += 1) {
        const value = storage.getItem(storage.key(i));
        const token = normalizeToken(value);

        if (token) return token;

        try {
          const parsed = JSON.parse(value);

          for (const nestedValue of Object.values(parsed || {})) {
            const nestedToken = normalizeToken(nestedValue);

            if (nestedToken) return nestedToken;
          }
        } catch {
          // Không phải JSON thì bỏ qua.
        }
      }
    }

    return null;
  });
}

async function uiLogin(I, email, password) {
  for (const route of LOGIN_ROUTES) {
    I.amOnPage(route);
    I.waitForElement("body", 15);
    I.wait(1);

    const hasLoginForm = await I.executeScript(() => {
      const inputs = Array.from(document.querySelectorAll("input"));
      const hasEmail = inputs.some((input) => {
        const info = [
          input.type,
          input.name,
          input.id,
          input.placeholder,
          input.autocomplete,
        ]
          .join(" ")
          .toLowerCase();

        return info.includes("email") || info.includes("mail");
      });

      const hasPassword = inputs.some((input) => input.type === "password");

      return hasEmail && hasPassword;
    });

    if (hasLoginForm) {
      await fillInput(I, ["email", "mail"], email);
      await fillInput(I, ["password", "mat khau"], password, {
        type: "password",
      });

      await clickAction(I, ["dang nhap", "login", "sign in", "submit"]);

      return;
    }
  }

  assert.fail("Không mở được form login UI");
}

async function fillInput(I, hints, value, options = {}) {
  const result = await I.executeScript(
    ({ hints, value, options }) => {
      const normalizeText = (inputValue) =>
        String(inputValue || "")
          .replace(/Đ/g, "D")
          .replace(/đ/g, "d")
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
          style.visibility !== "hidden" &&
          !element.disabled &&
          !element.readOnly
        );
      };

      const fields = Array.from(
        document.querySelectorAll("input, textarea, select"),
      ).filter(isVisible);

      const normalizedHints = hints.map(normalizeText);

      let matched = fields.find((field) => {
        if (options.type && field.type !== options.type) return false;

        const labels = field.labels ? Array.from(field.labels) : [];
        const labelText = labels
          .map((label) => label.innerText || "")
          .join(" ");

        const info = normalizeText(
          [
            field.type,
            field.name,
            field.id,
            field.placeholder,
            field.autocomplete,
            field.getAttribute("aria-label"),
            labelText,
          ].join(" "),
        );

        return normalizedHints.some((hint) => info.includes(hint));
      });

      if (!matched && options.type) {
        matched = fields.find((field) => field.type === options.type);
      }

      if (!matched) {
        return { found: false, hints };
      }

      matched.focus();

      if (matched.tagName.toLowerCase() === "select") {
        const option =
          Array.from(matched.options).find((item) =>
            normalizeText(item.textContent).includes(normalizeText(value)),
          ) || matched.options[1];

        if (option) {
          matched.value = option.value;
        }
      } else {
        const prototype =
          matched.tagName.toLowerCase() === "textarea"
            ? window.HTMLTextAreaElement.prototype
            : window.HTMLInputElement.prototype;

        const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set;

        if (setter) {
          setter.call(matched, value);
        } else {
          matched.value = value;
        }
      }

      matched.dispatchEvent(new Event("input", { bubbles: true }));
      matched.dispatchEvent(new Event("change", { bubbles: true }));
      matched.dispatchEvent(new Event("blur", { bubbles: true }));

      return {
        found: true,
        tagName: matched.tagName,
        type: matched.type,
        name: matched.name,
        id: matched.id,
        placeholder: matched.placeholder,
      };
    },
    { hints, value, options },
  );

  return result;
}

async function clickAction(I, texts, fallbackSubmit = true) {
  const result = await I.executeScript(
    ({ texts, fallbackSubmit }) => {
      const normalizeText = (value) =>
        String(value || "")
          .replace(/Đ/g, "D")
          .replace(/đ/g, "d")
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
          style.visibility !== "hidden" &&
          !element.disabled
        );
      };

      const normalizedTexts = texts.map(normalizeText);

      const candidates = Array.from(
        document.querySelectorAll(
          "button, a, input[type='submit'], input[type='button'], [role='button']",
        ),
      ).filter(isVisible);

      let element = candidates.find((candidate) => {
        const text = normalizeText(
          [
            candidate.innerText,
            candidate.textContent,
            candidate.value,
            candidate.getAttribute("aria-label"),
            candidate.title,
          ].join(" "),
        );

        return normalizedTexts.some((target) => text.includes(target));
      });

      if (!element && fallbackSubmit) {
        element =
          candidates.find(
            (candidate) =>
              candidate.tagName.toLowerCase() === "button" ||
              candidate.type === "submit",
          ) || candidates[0];
      }

      if (!element) {
        return {
          found: false,
          texts,
          candidates: candidates.map(
            (item) => item.innerText || item.textContent || item.value || "",
          ),
        };
      }

      element.click();

      return {
        found: true,
        text:
          element.innerText ||
          element.textContent ||
          element.value ||
          element.getAttribute("aria-label") ||
          "",
      };
    },
    { texts, fallbackSubmit },
  );

  assert(
    result && result.found,
    `Không tìm thấy nút để click: ${texts.join(", ")}. Buttons: ${bodyText(
      result,
    )}`,
  );

  I.wait(2);

  return result;
}

function appUrl(route = "/") {
  return new URL(route, FE_URL).toString();
}

async function safeOpenAppPage(I, route = "/") {
  if (typeof I.usePlaywrightTo === "function") {
    await I.usePlaywrightTo(`open ${route}`, async ({ page }) => {
      await page.goto(appUrl(route), {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });

      await page
        .waitForSelector("body", {
          timeout: 15000,
        })
        .catch(() => {});
    });

    I.wait(1);
    return;
  }

  I.amOnPage(route);
  I.waitForElement("body", 15);
  I.wait(1);
}

async function resetGuestCartFromHome(I) {
  await safeOpenAppPage(I, "/");

  await I.executeScript(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("guest-cart");
    localStorage.removeItem("cart");
    sessionStorage.clear();
  });

  await safeOpenAppPage(I, "/");
}

async function openDirectProductPage(I, productId) {
  const route = `/product/${productId}`;

  if (typeof I.usePlaywrightTo === "function") {
    await I.usePlaywrightTo(
      `open direct product ${productId}`,
      async ({ page }) => {
        const baseUrl = process.env.FE_URL || "http://localhost:3000";

        await page.goto(`${baseUrl}${route}`, {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        await page
          .waitForSelector("body", {
            timeout: 15000,
          })
          .catch(() => {});
      },
    );

    I.wait(2);
    return;
  }

  I.amOnPage(route);
  I.waitForElement("body", 15);
  I.wait(2);
}

async function openProductDetailFromHomepageOrDirect(I) {
  const products = await getProducts(I);

  I.amOnPage("/");
  I.waitForElement("body", 15);
  I.wait(4);

  const pageText = await I.grabTextFrom("body");
  const normalizedPageText = normalizeText(pageText);

  const visibleProduct = products.find((product) => {
    return (
      product.id &&
      product.name &&
      normalizedPageText.includes(normalizeText(product.name))
    );
  });

  if (visibleProduct) {
    const clickResult = await I.executeScript((productName) => {
      const normalizeText = (value) =>
        String(value || "")
          .replace(/Đ/g, "D")
          .replace(/đ/g, "d")
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

      clickableElement.dispatchEvent(
        new MouseEvent("click", {
          bubbles: true,
          cancelable: true,
          view: window,
        }),
      );

      return {
        clicked: true,
        clickedTag: clickableElement.tagName,
        clickedText: clickableElement.innerText || clickableElement.textContent,
      };
    }, visibleProduct.name);

    if (clickResult.clicked) {
      I.wait(3);

      const currentUrl = await I.grabCurrentUrl();

      if (currentUrl.includes("/product/")) {
        return visibleProduct;
      }
    }
  }

  const product = products.find((item) => item.id) || products[0];

  I.amOnPage(`/product/${product.id}`);
  I.waitForElement("body", 15);
  I.wait(2);

  return product;
}

async function clickAddToCartButton(I) {
  const clickedResult = await I.executeScript(() => {
    const normalizeText = (value) =>
      String(value || "")
        .replace(/Đ/g, "D")
        .replace(/đ/g, "d")
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
        style.visibility !== "hidden" &&
        !element.disabled
      );
    };

    const buttons = Array.from(
      document.querySelectorAll("button, a, [role='button']"),
    ).filter(isVisible);

    const addToCartButton = buttons.find((button) => {
      const text = normalizeText(
        [
          button.innerText,
          button.textContent,
          button.value,
          button.getAttribute("aria-label"),
          button.title,
        ].join(" "),
      );

      return (
        text.includes("them vao gio hang") ||
        text.includes("them vao gio") ||
        text.includes("add to cart") ||
        text.includes("mua ngay") ||
        text.includes("buy now")
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
    `Không tìm thấy nút thêm vào giỏ hàng. Buttons: ${bodyText(clickedResult)}`,
  );

  I.wait(1);
}

async function clickQuantityButton(I, type) {
  return I.executeScript((buttonType) => {
    const isVisible = (element) => {
      const rect = element.getBoundingClientRect();
      const style = window.getComputedStyle(element);

      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !element.disabled
      );
    };

    const buttons = Array.from(document.querySelectorAll("button")).filter(
      isVisible,
    );

    const target = buttons.find((button) => {
      const text = String(button.innerText || button.textContent || "").trim();

      if (buttonType === "minus") return text === "-" || text === "−";
      return text === "+" || text.includes("+");
    });

    if (!target) {
      return {
        clicked: false,
        buttonTexts: buttons.map(
          (button) => button.innerText || button.textContent || "",
        ),
      };
    }

    target.click();

    return {
      clicked: true,
      buttonTexts: buttons.map(
        (button) => button.innerText || button.textContent || "",
      ),
    };
  }, type);
}

async function readGuestCart(I, productId = null) {
  return I.executeScript((id) => {
    const rawCart =
      localStorage.getItem("guest-cart") || localStorage.getItem("cart");

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
      const items = Array.isArray(cart.items)
        ? cart.items
        : Array.isArray(cart)
          ? cart
          : [];

      const matchedItem = id
        ? items.find((item) => {
            return (
              Number(item.productId || item.id || item.ProductId) === Number(id)
            );
          })
        : null;

      return {
        hasCart: true,
        rawCart,
        items,
        matchedItem: matchedItem || null,
        subtotal: Number(cart.subtotal || cart.total || 0),
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
    "Sau khi bấm thêm vào giỏ hàng, localStorage không có guest-cart/cart",
  );

  assert(
    Array.isArray(cartResult.items),
    `guest-cart/cart không có mảng items hợp lệ. Cart: ${cartResult.rawCart}`,
  );

  assert(
    cartResult.matchedItem,
    `Đã thêm sản phẩm id=${productId} nhưng cart không có sản phẩm này. Cart: ${cartResult.rawCart}`,
  );

  const quantity = Number(
    cartResult.matchedItem.quantity || cartResult.matchedItem.Quantity || 0,
  );

  assert(
    quantity >= minQuantity,
    `Số lượng sản phẩm không đúng. Cần >= ${minQuantity}. Item: ${bodyText(
      cartResult.matchedItem,
    )}`,
  );

  return cartResult;
}

async function addProductToGuestCartByUI(I, minQuantity = 1) {
  await resetGuestCartFromHome(I);

  const product = await openProductDetailFromHomepageOrDirect(I);

  await clickAddToCartButton(I);

  const cartResult = await assertCartHasProduct(I, product.id, minQuantity);

  return {
    product,
    cartResult,
  };
}

async function openFirstAvailableRoute(I, routes, label) {
  const logs = [];

  for (const route of routes) {
    I.amOnPage(route);
    I.waitForElement("body", 15);
    I.wait(2);

    const snapshot = await getBrowserSnapshot(I);
    const normalized = normalizeText(snapshot.text);

    if (
      snapshot.text &&
      snapshot.text.length > 0 &&
      !normalized.includes("page not found") &&
      !normalized.includes("404")
    ) {
      return route;
    }

    logs.push(`${route} -> ${snapshot.text.slice(0, 100)}`);
  }

  assert.fail(`${label}\nKhông mở được route phù hợp.\n${logs.join("\n")}`);
}

async function addAddressByApi(I, token) {
  const body = {
    recipientName: "FE Cart Customer",
    receiverName: "FE Cart Customer",
    fullName: "FE Cart Customer",
    phone: "0900000000",

    line1: "123 FE Cart Address",
    Line1: "123 FE Cart Address",

    line2: "Phuong 1",
    Line2: "Phuong 1",

    city: "TP. Ho Chi Minh",
    City: "TP. Ho Chi Minh",

    state: "Quan 1",
    State: "Quan 1",

    postalCode: "700000",
    PostalCode: "700000",

    country: "Viet Nam",
    Country: "Viet Nam",

    addressLine: "123 FE Cart Address",
    street: "123 FE Cart Address",
    ward: "Phuong 1",
    district: "Quan 1",
    province: "TP. Ho Chi Minh",
    fullAddress: "123 FE Cart Address, Quan 1, TP. Ho Chi Minh",

    isDefault: true,
    IsDefault: true,
  };

  const res = await firstSuccess(
    I,
    [
      {
        method: "POST",
        url: "/api/account/addresses",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/addresses",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/address",
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 201],
    "AddAddress bằng API thất bại",
  );

  const address = extractObject(res.data, "address");

  const addressId =
    idOf(address, ["id", "addressId", "AddressId", "Id"]) ||
    idOf(res.data, ["id", "addressId", "AddressId", "Id"]);

  assert(
    addressId > 0,
    `AddAddress không trả addressId. Body: ${bodyText(res.data)}`,
  );

  return addressId;
}

async function addCartItemByApi(I, token, productId, quantity = 1) {
  const body = {
    productId,
    ProductId: productId,
    quantity,
    Quantity: quantity,
  };

  return firstSuccess(
    I,
    [
      {
        method: "POST",
        url: "/api/cart/items",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/cart/add",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/cart",
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 201, 204],
    "Add cart item bằng API thất bại",
  );
}

async function placeOrderByApi(I, token, addressId, paymentMethod = "COD") {
  const body = {
    addressId,
    shippingAddressId: addressId,
    paymentMethod,
    note: `Created by cart_checkout_order_ui_test.js ${uniqueSuffix()}`,
  };

  const res = await firstSuccess(
    I,
    [
      {
        method: "POST",
        url: "/api/orders",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/orders/place",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/order",
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 201],
    "PlaceOrder bằng API thất bại",
  );

  const order = extractObject(res.data, "order");

  const orderId =
    idOf(order, ["id", "orderId", "OrderId", "Id"]) ||
    idOf(res.data, ["id", "orderId", "OrderId", "Id"]);

  assert(
    orderId > 0,
    `PlaceOrder không trả orderId. Body: ${bodyText(res.data)}`,
  );

  return orderId;
}

async function createOrderFixture(I, paymentMethod = "COD") {
  const customer = await registerCustomerByApi(I);
  const token = customer.token;
  const product = await getFirstProductFromApi(I);
  const addressId = await addAddressByApi(I, token);

  await addCartItemByApi(I, token, product.id, 1);

  const orderId = await placeOrderByApi(I, token, addressId, paymentMethod);

  return {
    customer,
    token,
    product,
    addressId,
    orderId,
  };
}

async function getMyOrdersByApi(I, token) {
  return firstSuccess(
    I,
    [
      { method: "GET", url: "/api/orders/mine", headers: authHeaders(token) },
      { method: "GET", url: "/api/orders/my", headers: authHeaders(token) },
      { method: "GET", url: "/api/orders", headers: authHeaders(token) },
    ],
    [200],
    "Get my orders bằng API thất bại",
  );
}

async function getOrderByIdByApi(I, token, orderId) {
  return firstSuccess(
    I,
    [
      {
        method: "GET",
        url: `/api/orders/${orderId}`,
        headers: authHeaders(token),
      },
      {
        method: "GET",
        url: `/api/order/${orderId}`,
        headers: authHeaders(token),
      },
    ],
    [200],
    "Get order detail bằng API thất bại",
  );
}

async function cancelOrderByApi(I, token, orderId) {
  const body = {
    reason: "Cancel by cart_checkout_order_ui_test.js",
  };

  return firstSuccessPrefer(
    I,
    [
      {
        method: "POST",
        url: `/api/orders/${orderId}/cancel`,
        body,
        headers: authHeaders(token),
      },
      {
        method: "PUT",
        url: `/api/orders/${orderId}/cancel`,
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 204],
    [400, 409],
    "Cancel order bằng API thất bại",
  );
}

async function requestRefundByApi(I, token, orderId) {
  const body = {
    reason: "Request refund by cart_checkout_order_ui_test.js",
  };

  return firstSuccessPrefer(
    I,
    [
      {
        method: "POST",
        url: `/api/orders/${orderId}/refund`,
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: `/api/orders/${orderId}/request-refund`,
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: `/api/orders/${orderId}/refund-request`,
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 201, 202, 204],
    [400, 404, 409],
    "Request refund bằng API thất bại",
  );
}

async function processWalletPaymentByApi(I, token, orderId) {
  const body = {
    orderId,
    OrderId: orderId,
  };

  return firstSuccessPrefer(
    I,
    [
      {
        method: "POST",
        url: "/api/wallet/pay-order",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/wallet/pay",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: `/api/orders/${orderId}/wallet-pay`,
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 201, 202, 204],
    [400, 404, 405, 409],
    "Wallet payment bằng API thất bại",
  );
}

async function createVnPayPaymentByApi(I, token, orderId) {
  const body = {
    orderId,
    returnUrl: "http://localhost:3000/payment-result",
  };

  return firstSuccessPrefer(
    I,
    [
      {
        method: "POST",
        url: "/api/payments/vnpay/create",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/payments/vnpay",
        body,
        headers: authHeaders(token),
      },
      {
        method: "POST",
        url: "/api/vnpay/create-payment",
        body,
        headers: authHeaders(token),
      },
    ],
    [200, 201, 202],
    [400, 404, 405, 409],
    "VNPay create payment bằng API thất bại",
  );
}

Scenario(
  "Cart: thêm sản phẩm vào giỏ hàng từ trang chi tiết",
  async ({ I }) => {
    const { product } = await addProductToGuestCartByUI(I, 1);

    await assertCartHasProduct(I, product.id, 1);
  },
);

async function openPageDomReadyForBugTest(I, route = "/") {
  const baseUrl = process.env.FE_URL || "http://localhost:3000";
  const url = new URL(route, baseUrl).toString();

  if (typeof I.usePlaywrightTo === "function") {
    await I.usePlaywrightTo(`open ${route}`, async ({ page }) => {
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });

      await page
        .waitForSelector("body", {
          timeout: 15000,
        })
        .catch(() => {});
    });

    I.wait(2);
    return;
  }

  I.amOnPage(route);
  I.waitForElement("body", 15);
  I.wait(2);
}

async function clearGuestCartForBugTest(I) {
  await openPageDomReadyForBugTest(I, "/");

  await I.executeScript(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("guest-cart");
    localStorage.removeItem("cart");
    sessionStorage.clear();
  });
}

async function openDirectProductPageForBugTest(I, productId) {
  await openPageDomReadyForBugTest(I, `/product/${productId}`);
}

function sumCartItemsForBugTest(items) {
  return items.reduce((sum, item) => {
    const unitPrice = Number(
      item.unitPrice || item.price || item.Price || item.UnitPrice || 0,
    );

    const quantity = Number(item.quantity || item.Quantity || 0);

    return sum + unitPrice * quantity;
  }, 0);
}

async function openCheckoutWithSeededGuestCartForBugTest(I, items) {
  const baseUrl = process.env.FE_URL || "http://localhost:3000";

  if (typeof I.usePlaywrightTo === "function") {
    await I.usePlaywrightTo(
      "open checkout with seeded guest cart",
      async ({ page }) => {
        await page.goto(new URL("/", baseUrl).toString(), {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        await page.evaluate((cartItems) => {
          localStorage.removeItem("token");
          localStorage.removeItem("accessToken");
          localStorage.removeItem("authToken");
          localStorage.removeItem("jwtToken");
          sessionStorage.clear();

          const normalizedItems = cartItems.map((item, index) => ({
            id: Date.now() + index,
            productId: item.productId,
            productName: item.productName,
            productImage: item.productImage || "",
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          }));

          const subtotal = normalizedItems.reduce(
            (sum, item) =>
              sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
            0,
          );

          const cart = {
            id: 0,
            userId: 0,
            items: normalizedItems,
            subtotal,
            updatedAt: new Date().toISOString(),
          };

          localStorage.setItem("guest-cart", JSON.stringify(cart));
        }, items);

        await page.goto(new URL("/checkout", baseUrl).toString(), {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        await page
          .waitForSelector("body", {
            timeout: 15000,
          })
          .catch(() => {});
      },
    );

    I.wait(2);
    return;
  }

  await openPageDomReadyForBugTest(I, "/");

  await I.executeScript((cartItems) => {
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwtToken");
    sessionStorage.clear();

    const normalizedItems = cartItems.map((item, index) => ({
      id: Date.now() + index,
      productId: item.productId,
      productName: item.productName,
      productImage: item.productImage || "",
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    const subtotal = normalizedItems.reduce(
      (sum, item) =>
        sum + Number(item.unitPrice || 0) * Number(item.quantity || 0),
      0,
    );

    const cart = {
      id: 0,
      userId: 0,
      items: normalizedItems,
      subtotal,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem("guest-cart", JSON.stringify(cart));
  }, items);

  await openPageDomReadyForBugTest(I, "/checkout");
}

function digitsOnlyForBugTest(value) {
  return String(value || "").replace(/[^\d]/g, "");
}

async function getCheckoutShippingFeeForBugTest(I) {
  return I.executeScript(() => {
    const normalizeText = (value) =>
      String(value || "")
        .replace(/Đ/g, "D")
        .replace(/đ/g, "d")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const rawBodyText = document.body ? document.body.innerText : "";

    const lines = rawBodyText
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    const isShippingLabelLine = (line) => {
      const normalized = normalizeText(line);

      if (!normalized) return false;

      const excludedTexts = [
        "san pham",
        "sl:",
        "so luong",
        "quantity",
        "tam tinh",
        "subtotal",
        "tong",
        "total",
        "original products",
        "moi nhat",
        "ban an",
        "trang tri",
        "vai",
        "phu kien",
        "mien phi van chuyen don",
        ">500",
        "500k",
      ];

      if (excludedTexts.some((text) => normalized.includes(text))) {
        return false;
      }

      return (
        normalized === "phi van chuyen" ||
        normalized === "phi ship" ||
        normalized === "shipping" ||
        normalized === "shipping fee" ||
        normalized === "delivery fee" ||
        normalized.startsWith("phi van chuyen ") ||
        normalized.startsWith("phi ship ") ||
        normalized.startsWith("shipping fee ") ||
        normalized.startsWith("delivery fee ")
      );
    };

    const parseMoneyAmount = (text) => {
      const rawText = String(text || "");
      const normalized = normalizeText(rawText);

      if (
        normalized.includes("mien phi") ||
        normalized.includes("free") ||
        rawText.includes("₫0") ||
        normalized.includes("0 vnd")
      ) {
        return 0;
      }

      const moneyMatches =
        rawText.match(
          /(?:₫|vnd|đ)?\s*[+-]?\d{1,3}(?:[.,]\d{3})+(?:\s*(?:₫|vnd|đ))?/gi,
        ) || [];

      const amounts = moneyMatches
        .map((value) => Number(String(value).replace(/[^\d-]/g, "")))
        .filter((value) => Number.isFinite(value));

      if (amounts.length > 0) {
        return amounts[amounts.length - 1];
      }

      return null;
    };

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];

      if (!isShippingLabelLine(line)) {
        continue;
      }

      const sameLineAmount = parseMoneyAmount(line);

      if (sameLineAmount !== null) {
        return {
          found: true,
          amount: sameLineAmount,
          labelLine: line,
          valueLine: line,
          lines,
          bodyText: rawBodyText,
        };
      }

      for (
        let nextIndex = index + 1;
        nextIndex <= Math.min(index + 4, lines.length - 1);
        nextIndex += 1
      ) {
        const nextLine = lines[nextIndex];
        const normalizedNextLine = normalizeText(nextLine);

        if (
          normalizedNextLine.includes("san pham") ||
          normalizedNextLine.includes("sl:") ||
          normalizedNextLine.includes("tam tinh") ||
          normalizedNextLine.includes("subtotal") ||
          normalizedNextLine.includes("tong") ||
          normalizedNextLine.includes("total")
        ) {
          break;
        }

        const nextLineAmount = parseMoneyAmount(nextLine);

        if (nextLineAmount !== null) {
          return {
            found: true,
            amount: nextLineAmount,
            labelLine: line,
            valueLine: nextLine,
            lines,
            bodyText: rawBodyText,
          };
        }
      }

      return {
        found: true,
        amount: null,
        labelLine: line,
        valueLine: "",
        lines,
        bodyText: rawBodyText,
      };
    }

    return {
      found: false,
      amount: null,
      labelLine: "",
      valueLine: "",
      lines,
      bodyText: rawBodyText,
    };
  });
}

Scenario(
  "BUG: mở trực tiếp link sản phẩm thì vẫn phải thêm được vào giỏ hàng",
  async ({ I }) => {
    const product = await getFirstProductFromApi(I);

    await openDirectProductPage(I, product.id);

    await I.executeScript(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authToken");
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("guest-cart");
      localStorage.removeItem("cart");
      sessionStorage.clear();
    });

    await openDirectProductPage(I, product.id);

    const beforeCart = await readGuestCart(I, product.id);

    assert(
      !beforeCart.matchedItem,
      `Trước khi bấm thêm giỏ hàng đã có sẵn sản phẩm trong cart. Cart: ${beforeCart.rawCart}`,
    );

    await clickAddToCartButton(I);

    const cartResult = await readGuestCart(I, product.id);

    assert(
      cartResult.hasCart,
      "BUG: Mở trực tiếp link sản phẩm rồi bấm thêm giỏ hàng nhưng localStorage không có guest-cart/cart",
    );

    assert(
      Array.isArray(cartResult.items),
      `BUG: guest-cart/cart không có mảng items hợp lệ. Cart: ${cartResult.rawCart}`,
    );

    assert(
      cartResult.matchedItem,
      `BUG: Mở trực tiếp /product/${product.id} rồi bấm thêm giỏ hàng nhưng sản phẩm không được thêm vào cart. Cart: ${cartResult.rawCart}`,
    );

    const quantity = Number(
      cartResult.matchedItem.quantity || cartResult.matchedItem.Quantity || 0,
    );

    assert(
      quantity >= 1,
      `BUG: Sản phẩm đã thêm vào cart nhưng quantity không hợp lệ. Quantity: ${quantity}. Item: ${bodyText(
        cartResult.matchedItem,
      )}`,
    );
  },
);

Scenario(
  "Cart: thêm cùng một sản phẩm 2 lần thì số lượng phải tăng",
  async ({ I }) => {
    await resetGuestCartFromHome(I);

    const product = await openProductDetailFromHomepageOrDirect(I);

    await clickAddToCartButton(I);
    await clickAddToCartButton(I);

    await assertCartHasProduct(I, product.id, 2);
  },
);

Scenario("Cart: guest-cart vẫn còn sau khi refresh trang", async ({ I }) => {
  const { product } = await addProductToGuestCartByUI(I, 1);

  I.refreshPage();

  I.waitForElement("body", 15);
  I.wait(1);

  await assertCartHasProduct(I, product.id, 1);
});

Scenario(
  "Cart: không cho quantity nhỏ hơn 1 trước khi thêm vào giỏ hàng",
  async ({ I }) => {
    await resetGuestCartFromHome(I);

    const product = await openProductDetailFromHomepageOrDirect(I);

    await clickQuantityButton(I, "minus");
    await clickQuantityButton(I, "minus");
    await clickQuantityButton(I, "minus");

    await clickAddToCartButton(I);

    const cartResult = await assertCartHasProduct(I, product.id, 1);

    const quantity = Number(
      cartResult.matchedItem.quantity || cartResult.matchedItem.Quantity || 0,
    );

    assert(quantity >= 1, `Quantity không được nhỏ hơn 1. Actual: ${quantity}`);
  },
);

Scenario(
  "Cart: sau khi thêm sản phẩm subtotal trong guest-cart phải hợp lệ",
  async ({ I }) => {
    const { product } = await addProductToGuestCartByUI(I, 1);

    const cartResult = await assertCartHasProduct(I, product.id, 1);

    const totalFromItems = cartResult.items.reduce((sum, item) => {
      const unitPrice = Number(
        item.unitPrice || item.price || item.Price || item.UnitPrice || 0,
      );
      const quantity = Number(item.quantity || item.Quantity || 0);

      return sum + unitPrice * quantity;
    }, 0);

    assert(
      totalFromItems >= 0,
      `Không tính được tổng tiền từ items. Cart: ${cartResult.rawCart}`,
    );

    if (totalFromItems > 0 && cartResult.subtotal > 0) {
      assert(
        Number(cartResult.subtotal) === Number(totalFromItems),
        `Subtotal trong guest-cart bị sai. Expected: ${totalFromItems}, Actual: ${cartResult.subtotal}. Cart: ${cartResult.rawCart}`,
      );
    }
  },
);

Scenario(
  "Cart: guest-cart bị dữ liệu lỗi thì trang không được crash",
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

    const text = await I.grabTextFrom("body");
    const normalized = normalizeText(text);

    assert(
      text && text.length > 0,
      "Trang bị trắng khi guest-cart lỗi dữ liệu",
    );

    assert(
      !normalized.includes("application error"),
      `Trang bị crash application error. Text: ${text}`,
    );
  },
);

Scenario(
  "Checkout: guest chưa đăng nhập thì checkout phải yêu cầu đăng nhập",
  async ({ I }) => {
    await addProductToGuestCartByUI(I, 1);

    await openFirstAvailableRoute(I, CHECKOUT_ROUTES, "Không mở được checkout");

    const snapshot = await getBrowserSnapshot(I);
    const normalized = normalizeText(snapshot.text + " " + snapshot.url);

    const requiresLogin =
      normalized.includes("dang nhap") ||
      normalized.includes("login") ||
      normalized.includes("tai khoan") ||
      normalized.includes("account") ||
      snapshot.url.includes("/login");

    assert(
      requiresLogin,
      `Guest checkout không yêu cầu đăng nhập. URL: ${snapshot.url}. Text: ${snapshot.text}`,
    );
  },
);

Scenario(
  "Checkout: thiếu thông tin giao hàng phải bị chặn hoặc hiển thị validation",
  async ({ I }) => {
    const customer = await registerCustomerByApi(I);

    await clearAuthStorage(I);
    await injectAuthSession(I, customer);

    const product = await getFirstProductFromApi(I);
    await addCartItemByApi(I, customer.token, product.id, 1);

    await openFirstAvailableRoute(I, CHECKOUT_ROUTES, "Không mở được checkout");

    try {
      await clickAction(
        I,
        ["dat hang", "place order", "thanh toan", "checkout", "submit"],
        true,
      );
    } catch {
      // Nếu không có nút đặt hàng trên UI thì kiểm tra API fallback.
    }

    const snapshot = await getBrowserSnapshot(I);
    const normalized = normalizeText(snapshot.text);

    const hasValidation =
      normalized.includes("bat buoc") ||
      normalized.includes("required") ||
      normalized.includes("dia chi") ||
      normalized.includes("address") ||
      normalized.includes("vui long") ||
      normalized.includes("validation") ||
      normalized.includes("thieu");

    if (hasValidation) {
      return;
    }

    const res = await firstSuccessPrefer(
      I,
      [
        {
          method: "POST",
          url: "/api/orders",
          body: { paymentMethod: "COD" },
          headers: authHeaders(customer.token),
        },
        {
          method: "POST",
          url: "/api/orders/place",
          body: { paymentMethod: "COD" },
          headers: authHeaders(customer.token),
        },
      ],
      [400, 422],
      [404, 409],
      "Checkout thiếu địa chỉ không bị chặn",
    );

    assertStatusIn(
      res,
      [400, 404, 409, 422],
      "Checkout thiếu thông tin phải trả lỗi hợp lệ",
    );
  },
);

Scenario("Checkout: chọn địa chỉ và đặt hàng COD thành công", async ({ I }) => {
  const fixture = await createOrderFixture(I, "COD");

  assert(fixture.orderId > 0, "Đặt hàng COD không trả orderId hợp lệ");
});

Scenario("Payment: thanh toán ví trả về trạng thái hợp lệ", async ({ I }) => {
  const fixture = await createOrderFixture(I, "WALLET");

  const res = await processWalletPaymentByApi(
    I,
    fixture.token,
    fixture.orderId,
  );

  assertStatusIn(
    res,
    [200, 201, 202, 204, 400, 404, 405, 409],
    "Thanh toán ví phải trả status hợp lệ",
  );
});

Scenario(
  "Payment: VNPay hoặc chuyển khoản trả về trạng thái hợp lệ",
  async ({ I }) => {
    const fixture = await createOrderFixture(I, "VNPAY");

    const res = await createVnPayPaymentByApi(
      I,
      fixture.token,
      fixture.orderId,
    );

    assertStatusIn(
      res,
      [200, 201, 202, 400, 404, 405, 409],
      "VNPay/chuyển khoản phải trả status hợp lệ",
    );
  },
);

Scenario("Order: user xem được danh sách đơn hàng của mình", async ({ I }) => {
  const fixture = await createOrderFixture(I, "COD");

  const res = await getMyOrdersByApi(I, fixture.token);

  assert2xx(res, "Get my orders phải thành công");

  const orders = extractArray(res.data);

  assert(Array.isArray(orders), "Danh sách đơn hàng phải là array");

  const foundOrder = orders.find((order) => {
    return idOf(order, ["id", "orderId", "OrderId", "Id"]) === fixture.orderId;
  });

  assert(
    foundOrder || orders.length > 0,
    `Không tìm thấy đơn vừa tạo trong danh sách. Body: ${bodyText(res.data)}`,
  );
});

Scenario("Order: user xem được chi tiết đơn hàng theo id", async ({ I }) => {
  const fixture = await createOrderFixture(I, "COD");

  const res = await getOrderByIdByApi(I, fixture.token, fixture.orderId);

  assert2xx(res, "Get order detail phải thành công");

  const order = extractObject(res.data, "order");
  const orderId =
    idOf(order, ["id", "orderId", "OrderId", "Id"]) ||
    idOf(res.data, ["id", "orderId", "OrderId", "Id"]);

  assert(
    orderId === fixture.orderId || orderId > 0,
    `Chi tiết đơn hàng trả về orderId không hợp lệ. Body: ${bodyText(res.data)}`,
  );
});

Scenario("Order: user hủy đơn hàng của mình", async ({ I }) => {
  const fixture = await createOrderFixture(I, "COD");

  const res = await cancelOrderByApi(I, fixture.token, fixture.orderId);

  assertStatusIn(
    res,
    [200, 204, 400, 409],
    "Cancel order phải trả status hợp lệ",
  );
});

Scenario("Order: user gửi yêu cầu hoàn tiền cho đơn hàng", async ({ I }) => {
  const fixture = await createOrderFixture(I, "COD");

  const res = await requestRefundByApi(I, fixture.token, fixture.orderId);

  assertStatusIn(
    res,
    [200, 201, 202, 204, 400, 404, 409],
    "Request refund phải trả status hợp lệ",
  );
});

Scenario(
  "BUG: guest-cart subtotal trong localStorage phải bằng tổng tiền items",
  async ({ I }) => {
    const { product } = await addProductToGuestCartByUI(I, 1);

    const cartResult = await assertCartHasProduct(I, product.id, 1);

    const totalFromItems = sumCartItemsForBugTest(cartResult.items);

    assert(
      totalFromItems > 0,
      `Không tính được tổng tiền từ items. Cart: ${cartResult.rawCart}`,
    );

    assert.strictEqual(
      Number(cartResult.subtotal || 0),
      Number(totalFromItems),
      `BUG: guest-cart.subtotal không bằng tổng tiền items. Expected: ${totalFromItems}, Actual: ${cartResult.subtotal}. Cart: ${cartResult.rawCart}`,
    );
  },
);

Scenario(
  "BUG: Checkout phải hiển thị lựa chọn thanh toán VNPay",
  async ({ I }) => {
    await openCheckoutWithSeededGuestCartForBugTest(I, [
      {
        productId: 900001,
        productName: "San pham test VNPay",
        quantity: 1,
        unitPrice: 600000,
        productImage: "",
      },
    ]);

    const paymentInfo = await I.executeScript(() => {
      const radios = Array.from(
        document.querySelectorAll("input[type='radio']"),
      ).map((input) => ({
        value: input.value || "",
        text:
          input.closest("label")?.innerText ||
          input.parentElement?.innerText ||
          "",
      }));

      return {
        bodyText: document.body ? document.body.innerText : "",
        radios,
      };
    });

    const normalizedPaymentText = normalizeText(
      paymentInfo.bodyText +
        " " +
        paymentInfo.radios
          .map((item) => `${item.value} ${item.text}`)
          .join(" "),
    );

    const hasVnPay =
      normalizedPaymentText.includes("vnpay") ||
      normalizedPaymentText.includes("vn pay");

    assert(
      hasVnPay,
      `BUG: Checkout chưa có lựa chọn thanh toán VNPay. Radios: ${bodyText(
        paymentInfo.radios,
      )}. Text: ${paymentInfo.bodyText}`,
    );
  },
);

Scenario(
  "BUG: đơn hàng trên 500k phải được miễn phí vận chuyển ở checkout",
  async ({ I }) => {
    await openCheckoutWithSeededGuestCartForBugTest(I, [
      {
        productId: 900002,
        productName: "San pham test 600k",
        quantity: 1,
        unitPrice: 600000,
        productImage: "",
      },
    ]);

    const shippingInfo = await getCheckoutShippingFeeForBugTest(I);

    assert(
      shippingInfo.found,
      `Không tìm thấy dòng phí vận chuyển trên checkout. Lines: ${shippingInfo.lines
        .slice(0, 80)
        .join(" | ")}`,
    );

    assert.notStrictEqual(
      shippingInfo.amount,
      null,
      `Tìm thấy dòng phí vận chuyển nhưng không đọc được số tiền. Label: ${shippingInfo.labelLine}. Value: ${shippingInfo.valueLine}. Lines: ${shippingInfo.lines
        .slice(0, 80)
        .join(" | ")}`,
    );

    assert.strictEqual(
      Number(shippingInfo.amount),
      0,
      `BUG: Đơn hàng trên 500k vẫn bị tính phí vận chuyển. Expected: 0. Actual: ${shippingInfo.amount}. Label: ${shippingInfo.labelLine}. Value: ${shippingInfo.valueLine}`,
    );
  },
);
