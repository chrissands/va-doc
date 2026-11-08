/*
 * Adobe Commerce provider — DOCUMENTED, INACTIVE STUB (never selected in the demo).
 *
 * Activate with page metadata (or bulk metadata for the /vce/** folder):
 *   commerce-provider       adobe-commerce
 *   commerce-endpoint       https://catalog-service.adobe.io/graphql (or your Mesh/Catalog URL)
 *   commerce-environment-id <Magento-Environment-Id>
 *   commerce-store-view     default (Magento-Store-View-Code)
 *   commerce-api-key        <x-api-key> (optional, SaaS Catalog Service)
 *
 * It queries Catalog Service GraphQL (`products(skus:)` and `productSearch(...)`) and maps
 * ProductView results onto the same normalized shape the mock provider returns, so blocks
 * keep working unchanged. Project-specific data (lead time, panel height, finishes…) is read
 * from custom product attributes with the codes listed in ATTR below; adjust to your catalog.
 */
import { getMetadata } from '../../aem.js';

/** Custom attribute codes expected on the Commerce side (roles visible_in_pdp / _search). */
const ATTR = {
  series: 'vce_series',
  configuration: 'vce_configuration',
  footprint: 'vce_footprint',
  panelHeight: 'vce_panel_height',
  finishes: 'vce_finishes', // comma list of finish ids
  quickship: 'vce_quickship', // "1"/"0"
  leadTime: 'vce_lead_time',
  leadTimeDays: 'vce_lead_time_days',
  badges: 'vce_badges', // comma list
  priceNote: 'vce_price_note',
  inventory: 'vce_inventory_label',
  popularity: 'vce_popularity',
  specs: 'vce_specs_json', // JSON blob: { highlights, table, care, footprint }
  warranty: 'vce_warranty_json',
  downloads: 'vce_downloads_json',
  certifications: 'vce_certifications_json',
};

const PRODUCT_FIELDS = `
  __typename sku name urlKey description shortDescription
  images(roles: []) { url label roles }
  attributes(roles: []) { name label value }
  ... on SimpleProductView { price { final { amount { value currency } } } }
  ... on ComplexProductView {
    priceRange { minimum { final { amount { value currency } } } }
    options {
      id title required multi
      values {
        id title inStock
        ... on ProductViewOptionValueSwatch { type value }
        ... on ProductViewOptionValueProduct { product { sku price { final { amount { value } } } } }
      }
    }
  }`;

const PRODUCTS_QUERY = `query VceProducts($skus: [String]) { products(skus: $skus) { ${PRODUCT_FIELDS} } }`;

const SEARCH_QUERY = `query VceSearch($filter: [SearchClauseInput!], $size: Int) {
  productSearch(phrase: "", filter: $filter, page_size: $size, current_page: 1) {
    total_count
    items { productView { ${PRODUCT_FIELDS} } }
    facets { attribute title buckets { title ... on ScalarBucket { count } ... on RangeBucket { from to count } } }
  }
}`;

/** POSTs a GraphQL query to the configured Catalog Service endpoint. */
async function gql(query, variables) {
  const endpoint = getMetadata('commerce-endpoint');
  if (!endpoint) throw new Error('adobe-commerce provider: missing "commerce-endpoint" metadata');
  const headers = {
    'Content-Type': 'application/json',
    'Magento-Environment-Id': getMetadata('commerce-environment-id'),
    'Magento-Store-View-Code': getMetadata('commerce-store-view') || 'default',
    'Magento-Store-Code': getMetadata('commerce-store') || 'main_website_store',
    'Magento-Website-Code': getMetadata('commerce-website') || 'base',
    'Magento-Customer-Group': getMetadata('commerce-customer-group') || 'b6589fc6ab0dc82cf12099d1c2d40ab994e8410c',
  };
  const apiKey = getMetadata('commerce-api-key');
  if (apiKey) headers['x-api-key'] = apiKey;
  const resp = await fetch(endpoint, { method: 'POST', headers, body: JSON.stringify({ query, variables }) });
  const json = await resp.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data;
}

const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
const json = (v, fallback) => {
  try { return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; }
};

/**
 * Maps a Catalog Service ProductView to the normalized product shape.
 * @param {object} view ProductView
 */
export function mapProductView(view) {
  const attrs = Object.fromEntries((view.attributes || []).map((a) => [a.name, a.value]));
  const price = view.price?.final?.amount?.value
    ?? view.priceRange?.minimum?.final?.amount?.value ?? 0;
  const basePrice = price;
  const plain = (html) => (html || '').replace(/<[^>]+>/g, '').trim();
  return {
    sku: view.sku,
    name: view.name,
    urlKey: view.urlKey,
    url: `/vce/product/${view.urlKey}`,
    category: attrs.vce_category || '',
    series: attrs[ATTR.series] || '',
    configuration: attrs[ATTR.configuration] || '',
    price,
    priceLabel: 'Agency Contract Price',
    priceNote: attrs[ATTR.priceNote] || '',
    footprint: attrs[ATTR.footprint] || '',
    description: plain(view.description),
    summary: plain(view.shortDescription || view.description),
    badges: list(attrs[ATTR.badges]),
    quickship: attrs[ATTR.quickship] === '1' || attrs[ATTR.quickship] === 'true',
    leadTime: attrs[ATTR.leadTime] || '',
    leadTimeDays: Number(attrs[ATTR.leadTimeDays]) || 0,
    panelHeight: attrs[ATTR.panelHeight] || undefined,
    finishes: list(attrs[ATTR.finishes]),
    popularity: Number(attrs[ATTR.popularity]) || 0,
    inventory: attrs[ATTR.inventory] || '',
    images: (view.images || []).map((img) => ({ url: img.url, alt: img.label || view.name, label: img.label || '' })),
    certifications: json(attrs[ATTR.certifications], []),
    // Commerce configurable options → swatch/tile/radio groups; option price = delta vs. base
    options: (view.options || []).map((opt) => ({
      id: opt.id,
      label: opt.title,
      type: opt.values?.some((v) => v.type === 'COLOR_HEX') ? 'swatch' : 'tile',
      values: (opt.values || []).map((v) => ({
        id: v.id,
        label: v.title,
        swatch: v.type === 'COLOR_HEX' ? v.value : undefined,
        priceDelta: v.product ? (v.product.price?.final?.amount?.value || 0) - basePrice : 0,
      })),
    })),
    addons: [], // map bundle/related "add-on" products here if used
    specs: json(attrs[ATTR.specs], { highlights: [], table: [], care: '' }),
    warranty: json(attrs[ATTR.warranty], []),
    downloads: json(attrs[ATTR.downloads], []),
  };
}

async function listProducts({ category, skus } = {}) {
  if (skus?.length) {
    const data = await gql(PRODUCTS_QUERY, { skus });
    return (data.products || []).map(mapProductView);
  }
  const filter = category ? [{ attribute: 'categoryPath', eq: category }] : [];
  const data = await gql(SEARCH_QUERY, { filter, size: 100 });
  return data.productSearch.items.map((i) => mapProductView(i.productView));
}

async function getProduct(sku) {
  const data = await gql(PRODUCTS_QUERY, { skus: [sku] });
  return data.products?.[0] ? mapProductView(data.products[0]) : null;
}

/**
 * Facet metadata. Finishes / panel heights / price ranges are merchandising config, so they are
 * kept in a small JSON next to the code (or a spreadsheet) rather than derived from facets.
 */
async function getCatalogMeta() {
  const base = window.hlx?.codeBasePath || '';
  const resp = await fetch(`${base}/scripts/commerce/mock-catalog.json`);
  const {
    currency, categories, finishes, panelHeights, priceRanges,
  } = await resp.json();
  return {
    currency, categories, finishes, panelHeights, priceRanges,
  };
}

export default { listProducts, getProduct, getCatalogMeta };
