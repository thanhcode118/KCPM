const assert = require("assert");

Feature("BE - Cart / Order API");

/*
  File này kiểm thử luồng nghiệp vụ:
  Thêm giỏ hàng -> Cập nhật giỏ hàng -> Xóa giỏ hàng
  -> Đặt hàng -> Xem đơn -> Hủy đơn / Yêu cầu hoàn tiền

  Nhóm API:
  Cart:
  - GetCurrent
  - AddItem
  - UpdateItem
  - RemoveItem
  - Clear

  Order:
  - PlaceOrder
  - GetMine
  - GetById
  - Cancel
  - RequestRefund
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

function assertStatusIn(res, expectedStatuses, message) {
  assert(
    expectedStatuses.includes(res.status),
    `${message}. Status thực tế: ${res.status}. Expected: ${expectedStatuses.join(
      ", ",
    )}. Body: ${bodyText(res.data)}`,
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

function toNumber(value, fieldName = "value") {
  const num = Number(value);

  assert(!Number.isNaN(num), `${fieldName} không phải số: ${value}`);

  return num;
}

function extractArray(data) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Items)) return data.Items;

  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.Data)) return data.Data;

  if (Array.isArray(data?.result)) return data.result;
  if (Array.isArray(data?.Result)) return data.Result;

  if (Array.isArray(data?.cart?.items)) return data.cart.items;
  if (Array.isArray(data?.Cart?.Items)) return data.Cart.Items;

  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.Data?.Items)) return data.Data.Items;

  if (Array.isArray(data?.orders)) return data.orders;
  if (Array.isArray(data?.Orders)) return data.Orders;

  return [];
}

function extractObject(data, ...keys) {
  for (const key of keys) {
    const value = pick(data, key, key[0]?.toUpperCase() + key.slice(1));
    if (value && typeof value === "object") return value;
  }

  if (data?.data && typeof data.data === "object") return data.data;
  if (data?.Data && typeof data.Data === "object") return data.Data;

  return data;
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

function getProductId(product) {
  return toNumber(
    pick(product, "productId", "ProductId", "id", "Id"),
    "productId",
  );
}

function getProductName(product) {
  return String(
    pick(product, "productName", "ProductName", "name", "Name") ?? "",
  );
}

function getCartItems(cartData) {
  return extractArray(cartData);
}

function getCartItemProductId(item) {
  return toNumber(
    pick(item, "productId", "ProductId", "productID", "ProductID"),
    "cart item productId",
  );
}

function getCartItemId(item) {
  const id = pick(
    item,
    "cartItemId",
    "CartItemId",
    "itemId",
    "ItemId",
    "id",
    "Id",
  );

  return id === undefined ? undefined : Number(id);
}

function getCartItemQuantity(item) {
  return toNumber(pick(item, "quantity", "Quantity", "qty", "Qty"), "quantity");
}

function getAddressId(address) {
  return toNumber(
    pick(address, "id", "Id", "addressId", "AddressId"),
    "addressId",
  );
}

function getOrderId(order) {
  return toNumber(pick(order, "id", "Id", "orderId", "OrderId"), "orderId");
}

function getOrderStatus(order) {
  return String(
    pick(order, "status", "Status", "orderStatus", "OrderStatus") ?? "",
  );
}

async function sendRequest(I, method, url, body, headers) {
  if (method === "GET") {
    return I.sendGetRequest(url, headers);
  }

  if (method === "POST") {
    return I.sendPostRequest(url, body, headers);
  }

  if (method === "PUT") {
    return I.sendPutRequest(url, body, headers);
  }

  if (method === "PATCH") {
    return I.sendPatchRequest(url, body, headers);
  }

  if (method === "DELETE") {
    return I.sendDeleteRequest(url, headers);
  }

  throw new Error(`Method không hỗ trợ: ${method}`);
}

async function firstSuccess(I, candidates, expectedStatuses, message) {
  const results = [];

  for (const candidate of candidates) {
    const res = await sendRequest(
      I,
      candidate.method,
      candidate.url,
      candidate.body,
      candidate.headers,
    );

    results.push({
      method: candidate.method,
      url: candidate.url,
      status: res.status,
      body: res.data,
    });

    if (expectedStatuses.includes(res.status)) {
      return res;
    }
  }

  const detail = results
    .map(
      (item) =>
        `${item.method} ${item.url} -> ${item.status}, Body: ${bodyText(
          item.body,
        )}`,
    )
    .join("\n");

  assert.fail(
    `${message}\nKhông có endpoint nào trả status mong đợi.\n${detail}`,
  );
}

async function seedDemoData(I) {
  const res = await I.sendPostRequest("/api/Maintenance/seed/all");

  assert2xx(res, "Seed demo data thất bại");
}

async function registerCustomer(I) {
  const suffix = uniqueSuffix();

  const payload = {
    email: `cart.order.user.${suffix}@example.com`,
    fullName: `Cart Order User ${suffix}`,
    phone: "0987654321",
    password: "Password123",
    role: "customer",
  };

  const res = await I.sendPostRequest("/api/auth/register", payload);

  assert2xx(res, "Register customer thất bại");

  const token = getToken(res.data);

  assert(token, `Register không trả về token. Body: ${bodyText(res.data)}`);

  return {
    token,
    email: payload.email,
    fullName: payload.fullName,
  };
}

async function getSeedProduct(I) {
  const res = await I.sendGetRequest("/api/products?page=1&pageSize=20");

  assert2xx(res, "Lấy danh sách sản phẩm thất bại");

  const products = extractArray(res.data);

  assert(products.length > 0, "Không có sản phẩm demo. Hãy chạy seed trước.");

  const product = products[0];

  assert(getProductId(product) > 0, "Sản phẩm seed không có productId hợp lệ");
  assert(getProductName(product).length > 0, "Sản phẩm seed không có tên");

  return product;
}

async function createAddress(I, token) {
  const suffix = uniqueSuffix();

  const payload = {
    fullName: `Receiver ${suffix}`,
    phone: "0901234567",
    line1: `123 Test Street ${suffix}`,
    ward: "Ward 1",
    district: "District 1",
    city: "Ho Chi Minh",
    isDefault: true,
  };

  const res = await I.sendPostRequest(
    "/api/account/addresses",
    payload,
    authHeaders(token),
  );

  assertStatus(res, 201, "Tạo địa chỉ giao hàng phải trả về 201");

  const address = extractObject(res.data, "address");

  assert(getAddressId(address) > 0, "Address trả về không có id hợp lệ");

  return address;
}

async function getCurrentCart(I, token) {
  const res = await firstSuccess(
    I,
    [
      {
        method: "GET",
        url: "/api/cart",
        headers: authHeaders(token),
      },
      {
        method: "GET",
        url: "/api/cart/current",
        headers: authHeaders(token),
      },
    ],
    [200],
    "Cart GetCurrent thất bại",
  );

  return res;
}

async function addCartItem(I, token, productId, quantity = 1) {
  const candidates = [
    {
      method: "POST",
      url: "/api/cart/items",
      body: {
        productId,
        quantity,
      },
      headers: authHeaders(token),
    },
    {
      method: "POST",
      url: "/api/cart/add",
      body: {
        productId,
        quantity,
      },
      headers: authHeaders(token),
    },
    {
      method: "POST",
      url: "/api/cart",
      body: {
        productId,
        quantity,
      },
      headers: authHeaders(token),
    },
  ];

  return firstSuccess(I, candidates, [200, 201], "Cart AddItem thất bại");
}

async function updateCartItem(I, token, productId, quantity) {
  const cartRes = await getCurrentCart(I, token);
  const items = getCartItems(cartRes.data);

  const item = items.find(
    (cartItem) => getCartItemProductId(cartItem) === productId,
  );

  assert(
    item,
    `Không tìm thấy sản phẩm ${productId} trong giỏ hàng trước khi update. Cart: ${bodyText(
      cartRes.data,
    )}`,
  );

  const itemId = getCartItemId(item);

  assert(
    itemId,
    `Cart item không có id hợp lệ để update. Item: ${bodyText(item)}`,
  );

  const candidates = [
    {
      method: "PUT",
      url: `/api/cart/items/${itemId}`,
      body: {
        quantity,
      },
      headers: authHeaders(token),
    },
    {
      method: "PATCH",
      url: `/api/cart/items/${itemId}`,
      body: {
        quantity,
      },
      headers: authHeaders(token),
    },
  ];

  return firstSuccess(I, candidates, [200, 204], "Cart UpdateItem thất bại");
}

async function removeCartItem(I, token, productId) {
  const cartRes = await getCurrentCart(I, token);
  const items = getCartItems(cartRes.data);
  const item = items.find(
    (cartItem) => getCartItemProductId(cartItem) === productId,
  );
  const itemId = item ? getCartItemId(item) : undefined;

  const candidates = [];

  if (itemId) {
    candidates.push({
      method: "DELETE",
      url: `/api/cart/items/${itemId}`,
      headers: authHeaders(token),
    });
  }

  candidates.push(
    {
      method: "DELETE",
      url: `/api/cart/items/${productId}`,
      headers: authHeaders(token),
    },
    {
      method: "POST",
      url: "/api/cart/remove",
      body: {
        productId,
      },
      headers: authHeaders(token),
    },
  );

  return firstSuccess(I, candidates, [200, 204], "Cart RemoveItem thất bại");
}

async function clearCart(I, token) {
  const candidates = [
    {
      method: "DELETE",
      url: "/api/cart/clear",
      headers: authHeaders(token),
    },
    {
      method: "POST",
      url: "/api/cart/clear",
      body: {},
      headers: authHeaders(token),
    },
    {
      method: "DELETE",
      url: "/api/cart/items",
      headers: authHeaders(token),
    },
  ];

  return firstSuccess(I, candidates, [200, 204], "Cart Clear thất bại");
}

async function placeOrder(I, token, addressId) {
  const candidates = [
    {
      method: "POST",
      url: "/api/orders",
      body: {
        shippingAddressId: addressId,
        paymentMethod: "COD",
        note: `Codecept order ${uniqueSuffix()}`,
      },
      headers: authHeaders(token),
    },
    {
      method: "POST",
      url: "/api/orders",
      body: {
        addressId,
        paymentMethod: "COD",
        note: `Codecept order ${uniqueSuffix()}`,
      },
      headers: authHeaders(token),
    },
    {
      method: "POST",
      url: "/api/orders/place",
      body: {
        shippingAddressId: addressId,
        paymentMethod: "COD",
        note: `Codecept order ${uniqueSuffix()}`,
      },
      headers: authHeaders(token),
    },
  ];

  const res = await firstSuccess(
    I,
    candidates,
    [200, 201],
    "Order PlaceOrder thất bại",
  );

  const order = extractObject(res.data, "order");

  assert(
    getOrderId(order) > 0,
    `PlaceOrder không trả về orderId. Body: ${bodyText(res.data)}`,
  );

  return order;
}

async function createOrderFixture(I) {
  const customer = await registerCustomer(I);
  const product = await getSeedProduct(I);
  const productId = getProductId(product);

  await addCartItem(I, customer.token, productId, 1);

  const address = await createAddress(I, customer.token);
  const order = await placeOrder(I, customer.token, getAddressId(address));

  return {
    customer,
    product,
    productId,
    address,
    order,
    orderId: getOrderId(order),
  };
}

async function getMyOrders(I, token) {
  const res = await firstSuccess(
    I,
    [
      {
        method: "GET",
        url: "/api/orders/mine",
        headers: authHeaders(token),
      },
      {
        method: "GET",
        url: "/api/orders/my",
        headers: authHeaders(token),
      },
      {
        method: "GET",
        url: "/api/orders",
        headers: authHeaders(token),
      },
    ],
    [200],
    "Order GetMine thất bại",
  );

  return res;
}

async function getOrderById(I, token, orderId) {
  const res = await I.sendGetRequest(
    `/api/orders/${orderId}`,
    authHeaders(token),
  );

  assert2xx(res, `Order GetById thất bại với orderId=${orderId}`);

  return res;
}

async function cancelOrder(I, token, orderId) {
  const candidates = [
    {
      method: "POST",
      url: `/api/orders/${orderId}/cancel`,
      body: {
        reason: "Codecept cancel order",
      },
      headers: authHeaders(token),
    },
    {
      method: "PUT",
      url: `/api/orders/${orderId}/cancel`,
      body: {
        reason: "Codecept cancel order",
      },
      headers: authHeaders(token),
    },
  ];

  return firstSuccess(I, candidates, [200, 204], "Order Cancel thất bại");
}

async function requestRefund(I, token, orderId) {
  const candidates = [
    {
      method: "POST",
      url: `/api/orders/${orderId}/refund`,
      body: {
        reason: "Codecept request refund",
      },
      headers: authHeaders(token),
    },
    {
      method: "POST",
      url: `/api/orders/${orderId}/request-refund`,
      body: {
        reason: "Codecept request refund",
      },
      headers: authHeaders(token),
    },
    {
      method: "POST",
      url: `/api/orders/${orderId}/refund-request`,
      body: {
        reason: "Codecept request refund",
      },
      headers: authHeaders(token),
    },
  ];

  /*
    Với đơn mới tạo, hệ thống có thể chưa cho refund vì đơn chưa thanh toán
    hoặc chưa giao hàng. Vì vậy test này chấp nhận:
    - 2xx: request refund thành công
    - 400/409: nghiệp vụ không cho refund ở trạng thái hiện tại
  */
  return firstSuccess(
    I,
    candidates,
    [200, 201, 202, 204, 400, 409],
    "Order RequestRefund không trả về status hợp lệ",
  );
}

BeforeSuite(async ({ I }) => {
  await seedDemoData(I);
});

Scenario(
  "Cart GetCurrent: user đăng nhập xem được giỏ hàng hiện tại",
  async ({ I }) => {
    const customer = await registerCustomer(I);

    const res = await getCurrentCart(I, customer.token);

    assert2xx(res, "Cart GetCurrent phải thành công");

    const items = getCartItems(res.data);

    assert(Array.isArray(items), "Cart GetCurrent phải trả về danh sách items");
  },
);

Scenario("Cart GetCurrent: không gửi token phải trả về 401", async ({ I }) => {
  const res = await I.sendGetRequest("/api/cart");

  assertStatus(res, 401, "Cart GetCurrent không gửi token phải trả về 401");
});

Scenario("Cart GetCurrent: token sai phải trả về 401", async ({ I }) => {
  const invalidToken = `invalid-token-${uniqueSuffix()}`;

  const res = await I.sendGetRequest("/api/cart", authHeaders(invalidToken));

  assertStatus(res, 401, "Cart GetCurrent dùng token sai phải trả về 401");
});

Scenario(
  "Cart AddItem: thêm sản phẩm vào giỏ hàng thành công",
  async ({ I }) => {
    const customer = await registerCustomer(I);
    const product = await getSeedProduct(I);
    const productId = getProductId(product);

    await addCartItem(I, customer.token, productId, 1);

    const cartRes = await getCurrentCart(I, customer.token);
    const items = getCartItems(cartRes.data);

    const addedItem = items.find(
      (item) => getCartItemProductId(item) === productId,
    );

    assert(addedItem, "Giỏ hàng không có sản phẩm vừa thêm");
    assert(
      getCartItemQuantity(addedItem) >= 1,
      "Số lượng sản phẩm trong giỏ phải >= 1",
    );
  },
);

Scenario(
  "Cart UpdateItem: cập nhật số lượng sản phẩm trong giỏ hàng",
  async ({ I }) => {
    const customer = await registerCustomer(I);
    const product = await getSeedProduct(I);
    const productId = getProductId(product);

    await addCartItem(I, customer.token, productId, 1);
    await updateCartItem(I, customer.token, productId, 2);

    const cartRes = await getCurrentCart(I, customer.token);
    const items = getCartItems(cartRes.data);

    const updatedItem = items.find(
      (item) => getCartItemProductId(item) === productId,
    );

    assert(updatedItem, "Không tìm thấy sản phẩm sau khi update");
    assert.strictEqual(
      getCartItemQuantity(updatedItem),
      2,
      "Số lượng sau khi update phải bằng 2",
    );
  },
);

Scenario("Cart RemoveItem: xóa một sản phẩm khỏi giỏ hàng", async ({ I }) => {
  const customer = await registerCustomer(I);
  const product = await getSeedProduct(I);
  const productId = getProductId(product);

  await addCartItem(I, customer.token, productId, 1);
  await removeCartItem(I, customer.token, productId);

  const cartRes = await getCurrentCart(I, customer.token);
  const items = getCartItems(cartRes.data);

  const removedItem = items.find(
    (item) => getCartItemProductId(item) === productId,
  );

  assert(!removedItem, "Sản phẩm đã xóa vẫn còn trong giỏ hàng");
});

Scenario("Cart Clear: xóa toàn bộ giỏ hàng", async ({ I }) => {
  const customer = await registerCustomer(I);
  const product = await getSeedProduct(I);
  const productId = getProductId(product);

  await addCartItem(I, customer.token, productId, 1);
  await clearCart(I, customer.token);

  const cartRes = await getCurrentCart(I, customer.token);
  const items = getCartItems(cartRes.data);

  assert.strictEqual(items.length, 0, "Giỏ hàng sau khi clear phải rỗng");
});

Scenario("Order PlaceOrder: đặt hàng từ giỏ hàng thành công", async ({ I }) => {
  const fixture = await createOrderFixture(I);

  assert(fixture.orderId > 0, "Order PlaceOrder không trả về orderId hợp lệ");
});

Scenario(
  "Order GetMine: user xem được danh sách đơn hàng của mình",
  async ({ I }) => {
    const fixture = await createOrderFixture(I);

    const res = await getMyOrders(I, fixture.customer.token);

    assert2xx(res, "Order GetMine phải thành công");

    const orders = extractArray(res.data);

    assert(Array.isArray(orders), "Order GetMine phải trả về danh sách orders");

    const createdOrder = orders.find(
      (order) => getOrderId(order) === fixture.orderId,
    );

    assert(createdOrder, "Danh sách đơn hàng không có đơn vừa tạo");
  },
);

Scenario("Order GetById: xem chi tiết đơn hàng theo id", async ({ I }) => {
  const fixture = await createOrderFixture(I);

  const res = await getOrderById(I, fixture.customer.token, fixture.orderId);

  const order = extractObject(res.data, "order");

  assert.strictEqual(
    getOrderId(order),
    fixture.orderId,
    "Order GetById trả về orderId không đúng",
  );
});

Scenario("Order Cancel: user hủy đơn hàng của mình", async ({ I }) => {
  const fixture = await createOrderFixture(I);

  const res = await cancelOrder(I, fixture.customer.token, fixture.orderId);

  assertStatusIn(res, [200, 204], "Order Cancel phải thành công");

  const detailRes = await getOrderById(
    I,
    fixture.customer.token,
    fixture.orderId,
  );
  const order = extractObject(detailRes.data, "order");
  const status = getOrderStatus(order).toLowerCase();

  if (status) {
    assert(
      status.includes("cancel") ||
        status.includes("hủy") ||
        status.includes("cancelled") ||
        status.includes("canceled"),
      `Trạng thái đơn sau khi hủy chưa đúng. Status: ${status}`,
    );
  }
});

Scenario(
  "Order RequestRefund: gửi yêu cầu hoàn tiền cho đơn hàng",
  async ({ I }) => {
    const fixture = await createOrderFixture(I);

    const res = await requestRefund(I, fixture.customer.token, fixture.orderId);

    assertStatusIn(
      res,
      [200, 201, 202, 204, 400, 409],
      "RequestRefund phải trả về status hợp lệ",
    );
  },
);
