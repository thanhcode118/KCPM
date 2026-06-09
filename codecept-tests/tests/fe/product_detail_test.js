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

Scenario('Trang chi tiết sản phẩm hiển thị đúng thông tin từ API', async ({ I }) => {
  const product = await getProductForDetailTest(I);

  I.amOnPage(`/product/${product.id}`);

  I.waitForElement('body', 15);

  const pageText = await I.grabTextFrom('body');

  assert(
    normalizeText(pageText).includes(normalizeText(product.name)),
    `Trang chi tiết không hiển thị tên sản phẩm từ API. API: "${product.name}"`
  );

  if (product.sku) {
    assert(
      pageText.includes(product.sku),
      `Trang chi tiết không hiển thị SKU từ API: ${product.sku}`
    );
  }

  assert(
    pageText.includes('₫') || pageText.includes('VND'),
    'Trang chi tiết không hiển thị giá sản phẩm'
  );

  I.seeElement('img');
});

Scenario('Trang chi tiết sản phẩm có nút thêm vào giỏ hàng', async ({ I }) => {
  const product = await getProductForDetailTest(I);

  I.amOnPage(`/product/${product.id}`);

  I.waitForElement('body', 15);

  const pageText = await I.grabTextFrom('body');

  assert(
    normalizeText(pageText).includes('them vao gio') ||
      normalizeText(pageText).includes('gio hang') ||
      normalizeText(pageText).includes('add to cart'),
    'Trang chi tiết không có nút hoặc nội dung thêm vào giỏ hàng'
  );
});