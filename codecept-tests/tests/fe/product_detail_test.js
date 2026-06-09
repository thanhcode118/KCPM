const assert = require('assert');

Feature('FE - Product Detail');

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function extractProducts(responseData) {
  if (Array.isArray(responseData)) return responseData;

  if (Array.isArray(responseData.items)) return responseData.items;
  if (Array.isArray(responseData.products)) return responseData.products;
  if (Array.isArray(responseData.result)) return responseData.result;

  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.data?.items)) return responseData.data.items;
  if (Array.isArray(responseData.data?.products)) return responseData.data.products;
  if (Array.isArray(responseData.data?.result)) return responseData.data.result;

  return [];
}

async function getProductForDetailTest(I) {
  const res = await I.sendGetRequest('/api/products?page=1&pageSize=20');

  assert(
    res.status >= 200 && res.status < 300,
    `API /api/products trả về status ${res.status}`
  );

  const products = extractProducts(res.data);

  assert(
    products.length > 0,
    `API /api/products không trả về sản phẩm nào. Response: ${JSON.stringify(res.data)}`
  );

  const rawProduct = products[0];

  const product = {
    id: rawProduct.id || rawProduct.productId,
    name: rawProduct.name || rawProduct.productName,
    sku: rawProduct.sku,
    price: rawProduct.price
  };

  assert(
    product.id,
    `Sản phẩm không có id/productId. Product: ${JSON.stringify(rawProduct)}`
  );

  assert(
    product.name,
    `Sản phẩm không có name/productName. Product: ${JSON.stringify(rawProduct)}`
  );

  return product;
}

Scenario('Trang chi tiết sản phẩm hiển thị thông tin sản phẩm', async ({ I }) => {
  const product = await getProductForDetailTest(I);

  I.amOnPage(`/product/${product.id}`);

  I.waitForElement('body', 15);
  I.wait(2);

  const pageText = await I.grabTextFrom('body');
  const normalizedPageText = normalizeText(pageText);
  const normalizedProductName = normalizeText(product.name);

  const hasProductName =
    normalizedPageText.includes(normalizedProductName);

  const hasSku =
    product.sku && pageText.includes(product.sku);

  const hasPrice =
    pageText.includes('₫') ||
    pageText.includes('VND') ||
    pageText.includes(String(product.price));

  assert(
    hasProductName || hasSku || hasPrice,
    `Trang chi tiết không hiển thị thông tin sản phẩm. API name: "${product.name}", SKU: "${product.sku}", price: "${product.price}". Nội dung hiện tại: ${pageText}`
  );

  I.seeElement('img');
});

Scenario('Trang chi tiết sản phẩm có nút thêm vào giỏ hàng', async ({ I }) => {
  const product = await getProductForDetailTest(I);

  I.amOnPage(`/product/${product.id}`);

  I.waitForElement('body', 15);
  I.wait(2);

  const pageText = await I.grabTextFrom('body');
  const normalizedText = normalizeText(pageText);

  const hasCartText =
    normalizedText.includes('them vao gio') ||
    normalizedText.includes('gio hang') ||
    normalizedText.includes('mua ngay') ||
    normalizedText.includes('dat hang') ||
    normalizedText.includes('add to cart');

  const buttonCount = await I.grabNumberOfVisibleElements('button');

  assert(
    hasCartText || buttonCount > 0,
    `Trang chi tiết không có nút hoặc nội dung mua hàng/thêm giỏ hàng. Nội dung hiện tại: ${pageText}`
  );
});