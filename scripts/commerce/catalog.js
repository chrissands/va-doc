/*
 * Commerce catalog facade. Blocks import ONLY this module (plus cart.js) for product data,
 * so the data source can be swapped without touching block code.
 *
 * The provider is chosen by the page metadata `commerce-provider` (default "mock").
 * Every provider exposes the same three functions and returns the normalized product shape
 * documented in scripts/commerce/README.md.
 */
import { getMetadata } from '../aem.js';
import formatPrice from './format.js';

export { formatPrice };

const PROVIDERS = {
  mock: () => import('./providers/mock.js'),
  'adobe-commerce': () => import('./providers/adobe-commerce.js'),
};

let providerPromise;

/**
 * Resolves (once) the provider module selected by page metadata.
 * @returns {Promise<{listProducts: Function, getProduct: Function, getCatalogMeta: Function}>}
 */
function provider() {
  if (!providerPromise) {
    const name = (getMetadata('commerce-provider') || getMetadata('Commerce-Provider') || 'mock')
      .trim().toLowerCase();
    const load = PROVIDERS[name] || PROVIDERS.mock;
    providerPromise = load().then((mod) => mod.default || mod);
  }
  return providerPromise;
}

/**
 * Lists products, optionally limited to a category and/or a list of SKUs.
 * When `skus` is given the result keeps the requested order.
 * @param {{category?: string, skus?: string[]}} [query]
 * @returns {Promise<object[]>} normalized products
 */
export async function listProducts(query = {}) {
  return (await provider()).listProducts(query);
}

/**
 * @param {string} sku product SKU
 * @returns {Promise<object|null>} normalized product, or null when unknown
 */
export async function getProduct(sku) {
  if (!sku) return null;
  return (await provider()).getProduct(sku.trim());
}

/**
 * Catalog-level facet metadata: categories, finishes, panelHeights, priceRanges, currency.
 * @returns {Promise<object>}
 */
export async function getCatalogMeta() {
  return (await provider()).getCatalogMeta();
}
