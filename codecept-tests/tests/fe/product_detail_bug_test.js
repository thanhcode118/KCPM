const assert = require('assert');

Feature('FE - Product Detail Bugs');

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

function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

async function getFirstProduct(I) {
  const res = await I.sendGetRequest('/api/products?page=1&pageSize=20');

  assert(
    res.status >= 200 && res.status < 300,
    `API /api/products trả về status ${res.status}`
  );

  const products = extractProducts(res.data);

  assert(
    products.length > 0,
    `API /api/products không có sản phẩm. Response: ${JSON.stringify(res.data)}`
  );

  const product = products[0];

  return {
    id: product.id || product.productId,
    name: product.name || product.productName,
    sku: product.sku,
    productSlug: product.slug,
    categoryName: product.category,
    categorySlug: product.categorySlug || product.categoryNavigation?.slug
  };
}

Scenario('BUG: Truy cập sản phẩm không tồn tại phải hiển thị thông báo lỗi', async ({ I }) => {
  I.amOnPage('/product/99999999');

  I.waitForElement('body', 10);
  I.wait(2);

  const bodyText = await I.grabTextFrom('body');
  const normalizedBody = normalizeText(bodyText);

  assert(
    normalizedBody.includes('khong tai duoc') ||
      normalizedBody.includes('khong tim thay') ||
      normalizedBody.includes('san pham khong ton tai') ||
      normalizedBody.includes('not found'),
    `BUG: Trang sản phẩm không tồn tại không hiển thị thông báo lỗi rõ ràng. Nội dung hiện tại: "${bodyText}"`
  );
});

Scenario('BUG: Breadcrumb danh mục trong trang chi tiết phải dùng slug danh mục, không dùng slug sản phẩm', async ({ I }) => {
  const product = await getFirstProduct(I);

  assert(product.id, `Sản phẩm không có id/productId: ${JSON.stringify(product)}`);
  assert(product.productSlug, `Sản phẩm không có slug sản phẩm: ${JSON.stringify(product)}`);
  assert(product.categorySlug, `Sản phẩm không có slug danh mục: ${JSON.stringify(product)}`);

  I.amOnPage(`/product/${product.id}`);

  I.waitForElement('body', 15);
  I.waitForText(product.sku, 15);

  const categoryLinks = await I.grabAttributeFromAll('a[href*="/collections/"]', 'href');

  assert(
    categoryLinks.length > 0,
    'Không tìm thấy link breadcrumb danh mục trên trang chi tiết'
  );

  const categoryLink = categoryLinks[0];

  assert(
    categoryLink.includes(`/collections/${product.categorySlug}`),
    `BUG: Link danh mục đang sai. Link hiện tại: "${categoryLink}". Đúng phải chứa: "/collections/${product.categorySlug}"`
  );

  assert(
    !categoryLink.includes(`/collections/${product.productSlug}`),
    `BUG: Link danh mục đang dùng slug sản phẩm thay vì slug danh mục. Product slug: "${product.productSlug}"`
  );
});