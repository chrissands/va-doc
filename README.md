# Commonwealth of Virginia Public Safety Sites — multi-site EDS demo

One AEM Edge Delivery Services code base serving five related sites, authored in
Document Authoring (DA, `chrissands/va-doc`). All sites share one design system, block library
and scripts; each site has its own content folder, navigation, footer and theme.

| Site | Folder | Theme | Demo pages |
| --- | --- | --- | --- |
| Virginia Department of Corrections (VADOC, root/flagship) | `/` | `vadoc` | `/` |
| Board of Local & Regional Jails (BLRJ) | `/bolrj/` | `bolrj` | `/bolrj/` |
| Virginia Parole Board (VPB) | `/vpb/` | `vpb` | `/vpb/` |
| Virginia Correctional Enterprises (VCE, store) | `/vce/` | `vce` | `/vce/modular-office-systems` (PLP), `/vce/product/<sku>` (PDP, 16 SKUs) |
| VCE Release Request (sub-experience of VCE) | `/vce/release-request` | `vce` | `/vce/release-request` |

Preview: `https://<branch>--va-doc--chrissands.aem.page/<path>`.
Local: `aem up --html-folder content --prefer-plain-html`, then open `http://localhost:3000/content/<path>`.

## Multi-site model

**Folder per site.** A site is a top-level content folder. `scripts/sites.js` is the registry
(`SITES`: id, folder, home, short name, default theme). `getSite()` maps any path to its site
(deepest folder wins; everything else is VADOC).

**Per-site fragments.** The header and footer load `<site folder>/nav` and `<site folder>/footer`
(`/nav`, `/bolrj/nav`, `/vpb/nav`, `/vce/nav`, same for footer). A page can override this with
`nav` / `footer` metadata. Sub-experiences such as `/vce/release-request` inherit their folder's
fragments. Every footer contains the authorable **Family Of Sites** block linking all five sites,
with the current site highlighted.

**Theme metadata.** `scripts.js` adds `theme-<name>` to `<body>` from the page metadata `theme`, or
from the site's default theme when the metadata is missing. Themes (end of
`styles/styles.css`) override only the header colours, accent (CTA) colour and logo:

| Theme | Header | Accent | Logo |
| --- | --- | --- | --- |
| `vadoc` | navy `#003768` | orange `#ff5c00` (dark text for contrast) | `/icons/logo-vadoc.svg` |
| `bolrj` | deep navy `#00274a` | maroon `#98002e` | `/icons/logo-bolrj.svg` |
| `vpb` | `#075197` | light-blue tint `#cfe9f7` | `/icons/logo-vpb.svg` |
| `vce` | navy | orange commerce CTAs | `/icons/logo-vce.svg` |

The logos are placeholders. Set theme (and other shared metadata) per folder with DA bulk
metadata (`/metadata` sheet, e.g. `/bolrj/**` → `theme: bolrj`) instead of per page.

**Shared design system.** `styles/styles.css` holds the palette and semantic tokens (CSS custom
properties), Source Sans 3 typography (self-hosted, metric-matched fallback), buttons, focus
rings, a skip link and section styles (`gray`, `overlap`, `split`, `two-up`, `form-layout`).
Blocks only use tokens, so a new theme is a dozen custom properties.

## Block library

Each block has a README with its authoring table. Variants are in parentheses.

| Need | Block |
| --- | --- |
| alert banner / statute bar | `alert (warning \| info)` |
| utility bar, search, mega-menu | `header` (from the nav fragment) |
| hero | `hero`, `hero (dark)`, `hero (split)` |
| locator card | `locator-search` (placed next to the hero automatically) |
| audience tiles, icon links, news, document, member grid, stats | `cards (audience \| icon-links \| news \| icon \| member \| document \| stats)`, combinable with `no images` |
| callouts (PREA, CTAs, notices) | `callout (danger \| dark \| light \| tint \| warning \| notice)` |
| document list / tabbed library / decision tiles | `document-list`, `document-list (tiles)` |
| operating procedures register | `table (documents)` |
| meetings by year | `accordion (meetings)` |
| tabs | `tabs` (also used by document-list and product specs) |
| testimonials | `carousel (testimonials)` |
| breadcrumb | `breadcrumb` |
| family of sites | `family-of-sites` |
| footer | `footer` (from the footer fragment) |
| forms | `form` (definition from a sheet/JSON), `line-items` (repeatable rows + totals) |
| commerce | `product-grid` (PLP; `related` variant), `product-detail` (PDP; `specs` variant) |

Buttons: a standalone link in **bold** = primary, *italic* = secondary, ***bold italic*** = accent
(theme CTA colour). Icons: `:icon-name:` (Material Symbols in `/icons`).

## Forms

`form` renders fields from a sheet (`/forms/offender-locator.json`, `/bolrj/forms/contact.json`,
`/vce/forms/release-request.json`). Its columns are Name, Type, Label, Placeholder, Value, Options,
Mandatory, Style, Fieldset, Description, Pattern, Accept, Multiple, Max and ReadOnly. Validation is
inline, with an error summary. File upload checks type and size. The CAPTCHA is a placeholder.
The release request's `line-items` block joins the form through the HTML `form` attribute, and
the sticky summary updates live. Without a `Submit To` row, forms run in demo mode (no network).
See `blocks/form/README.md`.

## Commerce

The PLP and PDP read products through `scripts/commerce/catalog.js`. The default provider reads
`scripts/commerce/mock-catalog.json` (16 products). An inactive Adobe Commerce Catalog Service
provider is included, and switching is a metadata change (`commerce-provider: adobe-commerce`).
The cart is UI-only (localStorage). See `scripts/commerce/README.md`.

## Content import

Pages were generated from the Stitch design exports with import scripts
(`tools/importer/`: `page-templates.json`, parsers, transformers, `import-<template>.js`).
`site-fragments` builds the per-site nav and footer fragments (menus are sourced from the live
sites). People named in the designs are replaced with placeholders. Re-running an import
overwrites the local documents in `content/`.

## Adding a new site

1. Add an entry to `SITES` in `scripts/sites.js` (`id`, `folder`, `home`, `short`, `name`, `theme`).
2. Add a `body.theme-<id>` rule at the end of `styles/styles.css` (header, nav, accent, logo
   tokens) and a logo SVG in `/icons`.
3. In DA, create the folder with `nav`, `footer` (copy an existing site's fragments) and an
   `index` page, plus a bulk-metadata row `/<folder>/**` → `theme: <id>`.
4. Add the new site as a row in every footer's **Family Of Sites** block.
5. Preview the fragments and pages. No other code changes are needed.

## Development

```bash
npm install
npm run lint         # eslint + stylelint
aem up --html-folder content --prefer-plain-html
```

The repository started from the USWDS + EDS boilerplate. The USWDS component blocks and
`styles/uswds-core.css` are still available. The agency sites do not load `uswds-core.css` (to
keep LCP fast), and USWDS JavaScript loads only on pages that use `usa-*` components. The
blocks rewritten for this design system are protected from `npm run build:uswds` in
`.buildignore`. See `USWDS-EDS-PATTERN.md` and `QUICK-START.md` for the original USWDS
documentation, and `DEMO-CHECKLIST.md` for what is demo-only.
