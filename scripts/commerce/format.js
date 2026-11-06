const USD = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

/**
 * Formats a number as US dollars, e.g. 1249 → "$1,249.00".
 * @param {number} value amount
 * @returns {string}
 */
export default function formatPrice(value) {
  return USD.format(Number(value) || 0);
}
