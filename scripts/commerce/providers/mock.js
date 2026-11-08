/*
 * Mock catalog provider (demo default): reads scripts/commerce/mock-catalog.json once.
 * The JSON is already in the normalized shape, so no mapping is required.
 */
let dataPromise;

/** Fetches the mock catalog once and caches the promise (failed loads are retried). */
function load() {
  if (!dataPromise) {
    const base = window.hlx?.codeBasePath || '';
    dataPromise = fetch(`${base}/scripts/commerce/mock-catalog.json`)
      .then((resp) => {
        if (!resp.ok) throw new Error(`mock catalog: HTTP ${resp.status}`);
        return resp.json();
      })
      .catch((error) => {
        dataPromise = undefined;
        throw error;
      });
  }
  return dataPromise;
}

const norm = (sku) => String(sku).trim().toUpperCase();

/** @param {{category?: string, skus?: string[]}} query */
async function listProducts({ category, skus } = {}) {
  const { products } = await load();
  if (skus?.length) {
    const bySku = new Map(products.map((p) => [norm(p.sku), p]));
    return skus.map((s) => bySku.get(norm(s))).filter(Boolean);
  }
  return category ? products.filter((p) => p.category === category) : [...products];
}

/** @param {string} sku */
async function getProduct(sku) {
  const { products } = await load();
  return products.find((p) => norm(p.sku) === norm(sku)) || null;
}

async function getCatalogMeta() {
  const {
    currency, categories, finishes, panelHeights, priceRanges,
  } = await load();
  return {
    currency, categories, finishes, panelHeights, priceRanges,
  };
}

export default { listProducts, getProduct, getCatalogMeta };
