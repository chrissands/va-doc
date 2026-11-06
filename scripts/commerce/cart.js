/*
 * UI-only demo cart. Items live in localStorage ("vce-cart") as [{ sku, qty, options }].
 * No pricing, checkout or server calls: with Adobe Commerce this module would be replaced by
 * the storefront cart drop-in (@dropins/storefront-cart) behind the same two functions.
 */
const KEY = 'vce-cart';

/** @returns {{sku: string, qty: number, options: object}[]} */
export function getCart() {
  try {
    const items = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(items) ? items : [];
  } catch (e) {
    return [];
  }
}

/** @returns {number} total quantity across all lines */
export function getCartCount() {
  return getCart().reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
}

/**
 * Adds an item (merging with an identical sku + options line) and notifies listeners
 * via the window event "cart:updated" ({ detail: { count } }).
 * @param {{sku: string, qty?: number, options?: object}} item
 * @returns {number} new cart count
 */
export function addToCart({ sku, qty = 1, options = {} }) {
  const items = getCart();
  const key = JSON.stringify(options);
  const line = items.find((i) => i.sku === sku && JSON.stringify(i.options || {}) === key);
  if (line) line.qty = Math.min(999, line.qty + qty);
  else items.push({ sku, qty, options });
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch (e) {
    // storage full or disabled: the demo cart simply does not persist
  }
  const count = items.reduce((sum, i) => sum + i.qty, 0);
  window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count } }));
  return count;
}
