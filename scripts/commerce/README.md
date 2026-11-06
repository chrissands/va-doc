# VCE commerce layer

Storefront code for the Virginia Correctional Enterprises (VCE) demo: the `product-grid` (PLP) and
`product-detail` (PDP) blocks. The data source can be swapped (mock today, Adobe Commerce later)
without changing any block code.

```
scripts/commerce/
  catalog.js                 facade: the only data module blocks import
  cart.js                    UI-only demo cart (localStorage)
  format.js                  USD formatter (re-exported by catalog.js as formatPrice)
  mock-catalog.json          16 demo products + facet metadata
  providers/mock.js          default provider (reads mock-catalog.json once, cached)
  providers/adobe-commerce.js  inactive, documented Catalog Service stub
```

## Provider model

`catalog.js` exposes:

| function | returns |
| --- | --- |
| `listProducts({ category, skus })` | normalized products; with `skus`, the requested order is kept |
| `getProduct(sku)` | one normalized product, or `null` |
| `getCatalogMeta()` | `{ currency, categories[], finishes[], panelHeights[], priceRanges[] }` |
| `formatPrice(n)` | `"$1,249.00"` |

The provider is chosen once per page from the metadata `commerce-provider`
(`mock` is the default, `adobe-commerce` is the alternative). Every provider module default-exports
`{ listProducts, getProduct, getCatalogMeta }` and must return the shape below.
Filtering, sorting and pagination happen client-side in `product-grid`, on the list for the category.

## Normalized product shape

```js
{
  sku, name, urlKey, url,              // url = site-absolute PDP path, e.g. /vce/product/vce-hz-6060
  category, series, configuration,     // configuration drives the "Configuration Category" facet
  price, priceLabel, priceNote,        // price = starting unit price (number)
  footprint, description, summary,
  badges: [string],                    // a badge matching /quickship/i gets the bolt icon
  quickship: boolean, leadTime, leadTimeDays,
  panelHeight,                         // id from meta.panelHeights
  finishes: [finishId],                // ids from meta.finishes
  popularity, inventory,
  images: [{ url, alt, label }],
  certifications: [{ icon, label, detail }],
  options: [{ id, label, note, type: 'swatch'|'tile'|'radio',
              values: [{ id, label, detail, swatch, priceDelta }] }],
  addons: [{ id, label, price, description }],
  specs: { highlights: [{ label, value, note }], table: [[key, value]], care, footprint },
  warranty: [{ icon, title, text }],
  downloads: [{ icon, label, meta, action, url? }],
}
```

`icon` values are names of files in `/icons`. Categories in the metadata carry a `label`
(plural noun such as "Modular Systems") used in the PLP headings.

## Blocks

- **product-grid** rows: `Category`, `Page Size`, `Filters` (group labels, matched by keyword:
  configuration / lead time / finish / price / panel height), `Sort` (labels, matched by keyword:
  procured / low to high / high to low / lead / sku), `Note` (rich text). Page state is kept in the
  query string (`page`, `sort`, `view`, `config`, `quickship`, `finish`, `price`, `height`).
  Variant **related**: row `SKUs | a, b, c`; the SKU in the page metadata `sku` is left out.
- **product-detail** row: `SKU`. The default variant is the buy box (it sets `document.title`).
  Variant **specs** shows the specification, warranty and downloads tabs, and gets
  `id="product-specs"` (the buy box's "View eVA Catalog Specs" link points there).

## Switching to Adobe Commerce

1. Add the metadata for the VCE pages (bulk metadata is the easiest place):
   `commerce-provider: adobe-commerce`, `commerce-endpoint`, `commerce-environment-id`,
   `commerce-store-view`, and optionally `commerce-store`, `commerce-website`, `commerce-api-key`.
2. In Commerce, create the custom attributes that `providers/adobe-commerce.js` lists in `ATTR`
   (lead time, panel height, finishes…) and expose them to Catalog Service. Or change the
   mapping in `mapProductView()`.
3. The stub uses `products(skus:)` for the PDP and related rows, and `productSearch(filter:
   categoryPath)` for the PLP. It maps `ProductView` (simple/complex) onto the shape above, and
   turns configurable option values into option groups with a `priceDelta`.
4. For production, use the Adobe Commerce storefront drop-ins instead of the demo UI for
   anything transactional: `@dropins/storefront-cart` behind `cart.js`, and checkout and account
   drop-ins. You can also use `@dropins/storefront-pdp` and `storefront-product-discovery`
   inside these blocks. Keep `catalog.js` as the single seam so the blocks don't change.

## Demo-only parts

- `mock-catalog.json` data, prices and images.
- `cart.js`: localStorage key `vce-cart` (`[{ sku, qty, options }]`). It dispatches the
  `window` event `cart:updated` with `{ detail: { count } }` (the header can listen to this for its
  badge). It has no pricing, checkout or server sync.
- "Request Quote" and download links only show a polite status message.
- The adobe-commerce provider is never selected in the demo and has not been run against a
  live endpoint.
