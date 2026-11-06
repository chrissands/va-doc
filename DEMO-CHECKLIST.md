# Demo-only vs production-ready

## Production-ready (reusable as-is)

- [x] Multi-site model: folder per site, site registry, per-site nav/footer fragments, theme by metadata (`scripts/sites.js`, `scripts/scripts.js`)
- [x] Design tokens, typography (self-hosted Source Sans 3, CLS-safe fallback), buttons, focus rings, skip link, section styles (`styles/styles.css`)
- [x] Header: utility bar, search form, CTAs, keyboard-operable mega-menu, mobile drawer, reserved height (no layout shift)
- [x] Footer with authorable Family Of Sites block (current site highlighted)
- [x] Content blocks: alert, hero (+ dark, split), cards (7 variants), callout (6 variants), table (documents), accordion (meetings), tabs (WAI-ARIA), carousel (testimonials), document-list (+ tiles), breadcrumb
- [x] Form block: sheet/JSON-driven fields, fieldsets, inline validation + error summary, file upload rules, live summary sidebar; line-items block with client-side totals
- [x] PLP/PDP UI: filters, sort, pagination with URL state, options and price deltas, quantity stepper, specs tabs, related products
- [x] Commerce data seam (`scripts/commerce/catalog.js`): blocks never talk to a backend directly
- [x] Import tooling (`tools/importer/`) that regenerates the demo content
- [x] Checks run locally: axe-core WCAG 2.x A/AA scan clean on all six pages at 375px and 1280px; no horizontal overflow; Lighthouse mobile (local preview) performance 97–100 on five pages, 88–97 on the PDP; CLS ≤ 0.09; ESLint and Stylelint clean

## Demo-only (replace before launch)

| Item | Where | What production needs |
| --- | --- | --- |
| Mock product catalog (16 products, placeholder prices/images) | `scripts/commerce/mock-catalog.json`, `/images/vce/` | Adobe Commerce (Catalog Service + storefront drop-ins) via `commerce-provider: adobe-commerce`; product images on the media bus/DAM |
| Adobe Commerce provider | `scripts/commerce/providers/adobe-commerce.js` | Written but never run against a live endpoint; verify attribute mapping (`ATTR`) |
| Cart, cart count, "Authorized Buyer Sign-In", account icon | `scripts/commerce/cart.js`, header | Commerce cart/checkout/auth drop-ins, eVA punchout integration |
| "Request Quote", spec/CAD downloads | product-detail | Real quote workflow and asset links |
| Form submissions (no network unless `Submit To` is set) | `blocks/form` | Real endpoint (EDS forms submission, Workfront/CRM, or agency API), spam protection, file storage |
| CAPTCHA (random code shown on screen) | release request form | Commonwealth-approved CAPTCHA / bot protection service |
| "Save Application Draft" | release request form | Persistence + authentication |
| Offender locator (shows "not connected" panel) | `blocks/locator-search` | Live VADOC Inmate & Supervisee Locator API |
| Search boxes (submit to `/<site>/search` pages that do not exist) | header | Site search (e.g. query index + search page, or enterprise search) |
| Most links (`#`) and PDF downloads | all pages | Real destinations / DAM assets |
| People's names, portraits, testimonials (placeholders like "[Board Chair Name]") | BLRJ members, VADOC carousel | Approved bios and photography |
| Logos (simple placeholder SVGs) | `/icons/logo-*.svg` | Official agency marks |
| Design photography (Stitch/AI-generated) | page images | Licensed agency photography |
| Theme per page metadata | each page's metadata | Bulk metadata sheet per folder |
| Statistics, dates, report titles from the designs | all pages | Verified agency figures |

## Known gaps / follow-ups

- Between 900px and ~1150px the VADOC/VCE main nav scrolls horizontally (labels are long).
- PDP LCP depends on the catalog JSON request; with Commerce, server-render the main image or preload it per SKU.
- The local preview keeps metadata names in their authored case (`Theme`); production lower-cases them (blocks handle both).
- The BLRJ meetings use an accordion by year, as requested; the design showed a year toggle.
