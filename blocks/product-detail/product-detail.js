import { toClassName } from '../../scripts/aem.js';
import { createIcon } from '../../scripts/scripts.js';
import { contentPath } from '../../scripts/sites.js';
import { getProduct, getCatalogMeta, formatPrice } from '../../scripts/commerce/catalog.js';
import { addToCart } from '../../scripts/commerce/cart.js';

/** Tiny element factory (see product-grid): skips null attrs, `on<event>` adds listeners. */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === undefined || v === null || v === false) return;
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  });
  el.append(...children.flat().filter((c) => c !== null && c !== undefined && c !== false));
  return el;
}

let uid = 0;
const nextId = (prefix) => { uid += 1; return `${prefix}-${uid}`; };

const SPECS_ID = 'product-specs';

/** Reads key | value rows into { key: text }. */
function readConfig(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (k && v) cfg[toClassName(k.textContent)] = v.textContent.trim();
  });
  return cfg;
}

/** Sets a live-region message so that repeated identical messages are announced again. */
function announce(region, message) {
  region.textContent = '';
  requestAnimationFrame(() => { region.textContent = message; });
}

/* ------------------------------------------------------------------ */
/* Buy box (default variant)                                          */
/* ------------------------------------------------------------------ */

/** Gallery: main image with badges, thumbnail buttons, certification strip. */
function buildGallery(product) {
  const images = product.images?.length ? product.images : [];
  const first = images[0];
  const main = h('img', {
    src: first?.url || '',
    alt: first?.alt || product.name,
    width: 800,
    height: 436,
    loading: 'eager',
    fetchpriority: 'high',
  });
  const badgeList = [];
  if (product.quickship) badgeList.push(h('li', { class: 'pd-badge quickship' }, createIcon('bolt'), 'Quickship Eligible'));
  (product.badges || []).filter((b) => !/quickship/i.test(b))
    .forEach((b) => badgeList.push(h('li', { class: 'pd-badge' }, b)));
  const figure = h(
    'figure',
    { class: 'pd-main' },
    first ? main : h('div', { class: 'pd-noimage', 'aria-hidden': 'true' }, createIcon('image')),
    badgeList.length ? h('ul', { class: 'pd-badges', 'aria-label': 'Product highlights' }, badgeList) : null,
  );
  const gallery = h('div', { class: 'pd-gallery' }, figure);

  if (images.length > 1) {
    const thumbs = h('div', { class: 'pd-thumbs', role: 'group', 'aria-label': 'Product images' });
    const select = (btn, i) => {
      thumbs.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      main.src = images[i].url;
      main.alt = images[i].alt || product.name;
    };
    images.forEach((img, i) => {
      const btn = h(
        'button',
        { type: 'button', class: 'pd-thumb', 'aria-pressed': String(i === 0) },
        h('img', {
          src: img.url, alt: '', width: 800, height: 436, loading: 'lazy',
        }),
        h('span', { class: 'pd-thumb-label' }, img.label || `Image ${i + 1}`),
      );
      btn.addEventListener('click', () => select(btn, i));
      thumbs.append(btn);
    });
    // arrow keys move between thumbnails and show the focused image
    thumbs.addEventListener('keydown', (e) => {
      const btns = [...thumbs.querySelectorAll('button')];
      const i = btns.indexOf(document.activeElement);
      if (i < 0) return;
      const keys = {
        ArrowRight: i + 1,
        ArrowDown: i + 1,
        ArrowLeft: i - 1,
        ArrowUp: i - 1,
        Home: 0,
        End: btns.length - 1,
      };
      if (!(e.key in keys)) return;
      e.preventDefault();
      const n = (keys[e.key] + btns.length) % btns.length;
      btns[n].focus();
      select(btns[n], n);
    });
    gallery.append(thumbs);
  }

  if (product.certifications?.length) {
    gallery.append(h('ul', { class: 'pd-certs', 'aria-label': 'Certifications' }, product.certifications.map((c) => h(
      'li',
      {},
      createIcon(c.icon || 'verified'),
      h('strong', {}, c.label),
      c.detail ? h('span', {}, c.detail) : null,
    ))));
  }
  return gallery;
}

/**
 * One option group as a fieldset of real radio inputs (swatch | tile | radio styles).
 * @returns {{ fieldset: Element, value: () => object }}
 */
function buildOptionGroup(option, index, onChange) {
  const name = nextId(`pd-opt-${option.id}`);
  const hasDelta = option.values.some((v) => typeof v.priceDelta === 'number');
  const selectedName = h('span', { class: 'pd-legend-value' });
  const fieldset = h(
    'fieldset',
    { class: `pd-option pd-option-${option.type || 'tile'}` },
    h(
      'legend',
      {},
      h('span', { class: 'pd-legend-name' }, `${index + 1}. ${option.label}`, option.note ? h('span', { class: 'pd-legend-note' }, ` (${option.note})`) : null),
      h('span', { class: 'visually-hidden' }, ', selected: '),
      selectedName,
    ),
  );
  const choices = h('div', { class: 'pd-choices' });
  option.values.forEach((v, i) => {
    const input = h('input', {
      type: 'radio', name, value: v.id, checked: i === 0, class: option.type === 'radio' ? null : 'pd-choice-input',
    });
    let content;
    if (option.type === 'swatch') {
      content = [
        h('span', { class: 'pd-swatch', style: `--swatch: ${v.swatch || 'transparent'}` }, createIcon('check')),
        h('span', { class: 'visually-hidden' }, v.label),
      ];
    } else if (option.type === 'radio') {
      content = [
        v.swatch ? h('span', { class: 'pd-dot', style: `--swatch: ${v.swatch}` }) : null,
        h('span', {}, v.label, v.detail ? ` (${v.detail})` : ''),
      ];
    } else {
      content = [
        v.swatch ? h('span', { class: 'pd-dot', style: `--swatch: ${v.swatch}` }) : null,
        h(
          'span',
          { class: 'pd-tile-text' },
          h('span', { class: 'pd-tile-label' }, v.label),
          v.detail ? h('span', { class: 'pd-tile-detail' }, v.detail) : null,
          hasDelta ? h('span', { class: 'pd-tile-delta' }, v.priceDelta ? `+${formatPrice(v.priceDelta)}` : 'Included') : null,
        ),
        createIcon('check-circle'),
      ];
    }
    choices.append(h('label', { class: 'pd-choice', title: option.type === 'swatch' ? v.label : null }, input, ...content));
  });
  fieldset.append(choices);

  const value = () => {
    const id = fieldset.querySelector('input:checked')?.value;
    return option.values.find((v) => v.id === id) || option.values[0];
  };
  const sync = () => { selectedName.textContent = value().label; };
  fieldset.addEventListener('change', () => { sync(); onChange(); });
  sync();
  return { fieldset, value };
}

/** Quantity stepper (− number +), clamped to 1–99. */
function buildQuantity(onChange) {
  const id = nextId('pd-qty');
  const input = h('input', {
    type: 'number', id, name: 'qty', min: 1, max: 99, value: 1, inputmode: 'numeric',
  });
  const dec = h('button', { type: 'button', class: 'pd-step', 'aria-label': 'Decrease quantity' }, createIcon('remove'));
  const inc = h('button', { type: 'button', class: 'pd-step', 'aria-label': 'Increase quantity' }, createIcon('add'));
  const get = () => Math.min(99, Math.max(1, parseInt(input.value, 10) || 1));
  const set = (n) => {
    input.value = Math.min(99, Math.max(1, n));
    dec.disabled = Number(input.value) <= 1;
    inc.disabled = Number(input.value) >= 99;
    onChange();
  };
  dec.addEventListener('click', () => set(get() - 1));
  inc.addEventListener('click', () => set(get() + 1));
  input.addEventListener('change', () => set(get()));
  input.addEventListener('input', () => { if (input.value !== '') onChange(); });
  dec.disabled = true;
  const wrap = h('div', { class: 'pd-qty' }, h('label', { for: id, class: 'visually-hidden' }, 'Quantity'), dec, input, inc);
  return { wrap, get };
}

/** Renders the buy box for a product. */
function renderBuyBox(block, product, meta) {
  document.title = `${product.name} | Virginia Correctional Enterprises`;
  const status = h('p', { class: 'pd-status', role: 'status' });
  const totalValue = h('strong', {});
  const totalDetail = h('span', { class: 'pd-total-detail' });
  const total = h('p', { class: 'pd-total', 'aria-live': 'polite', 'aria-atomic': 'true' }, 'Estimated total ', totalValue, ' ', totalDetail);

  const groups = [];
  const addons = [];
  let qty;
  const unitPrice = () => product.price
    + groups.reduce((s, g) => s + (g.value().priceDelta || 0), 0)
    + addons.filter((a) => a.input.checked).reduce((s, a) => s + (a.addon.price || 0), 0);
  const recalc = () => {
    if (!qty) return;
    const unit = unitPrice();
    const n = qty.get();
    totalValue.textContent = formatPrice(unit * n);
    totalDetail.textContent = `(${n} × ${formatPrice(unit)})`;
  };

  const form = h('form', { class: 'pd-form', 'aria-label': `Configure ${product.name}` });
  (product.options || []).forEach((opt, i) => {
    const g = buildOptionGroup(opt, i, recalc);
    groups.push({ ...g, option: opt });
    form.append(g.fieldset);
  });
  if (product.addons?.length) {
    const fs = h('fieldset', { class: 'pd-addons' }, h('legend', { class: 'visually-hidden' }, 'Optional add-ons'));
    product.addons.forEach((addon) => {
      const id = nextId(`pd-addon-${addon.id}`);
      const input = h('input', { type: 'checkbox', id, value: addon.id });
      input.addEventListener('change', recalc);
      addons.push({ addon, input });
      fs.append(h(
        'div',
        { class: 'pd-addon' },
        input,
        h(
          'label',
          { for: id },
          h('span', { class: 'pd-addon-head' }, h('strong', {}, addon.label), h('span', { class: 'pd-addon-price' }, `+${formatPrice(addon.price)}`)),
          addon.description ? h('span', { class: 'pd-addon-desc' }, addon.description) : null,
        ),
      ));
    });
    form.append(fs);
  }

  qty = buildQuantity(recalc);
  const addBtn = h('button', { type: 'submit', class: 'button accent pd-add' }, createIcon('add-shopping-cart'), 'Add to Cart');
  const quoteBtn = h('button', { type: 'button', class: 'button secondary pd-quote' }, 'Request Quote');
  form.append(h('div', { class: 'pd-buy' }, qty.wrap, addBtn, quoteBtn), total, status);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = qty.get();
    const options = Object.fromEntries(groups.map((g) => [g.option.id, g.value().id]));
    const chosen = addons.filter((a) => a.input.checked).map((a) => a.addon.id);
    if (chosen.length) options.addons = chosen;
    addToCart({ sku: product.sku, qty: n, options });
    announce(status, `Added ${n} × ${product.name} to your procurement cart (demo).`);
  });
  quoteBtn.addEventListener('click', () => {
    announce(status, `Quote request noted for ${product.sku}. A VCE contract specialist will follow up (demo).`);
  });

  const lead = product.quickship
    ? `Quickship: ${product.leadTime}` : `Lead time: ${product.leadTime}`;
  const hasSpecs = !!document.querySelector('.product-detail.specs');
  const info = h(
    'div',
    { class: 'pd-info' },
    h(
      'p',
      { class: 'pd-eyebrow' },
      h('span', { class: 'eyebrow' }, product.series || ''),
      h('span', { class: 'pd-sku' }, `SKU: ${product.sku}`),
    ),
    h('h1', {}, product.name),
    product.description ? h('p', { class: 'pd-description' }, product.description) : null,
    h(
      'div',
      { class: 'pd-price-panel' },
      h('p', { class: 'pd-price' }, h('strong', {}, formatPrice(product.price)), h('span', {}, ' / each')),
      product.priceNote ? h('p', { class: 'pd-price-note' }, product.priceNote) : null,
      product.leadTime ? h('p', { class: `pd-lead${product.quickship ? ' quickship' : ''}` }, createIcon('schedule'), lead) : null,
    ),
    form,
    h(
      'div',
      { class: 'pd-foot' },
      product.inventory ? h('p', { class: 'pd-inventory' }, createIcon('inventory'), h('span', {}, 'Inventory Status: ', h('strong', {}, product.inventory))) : null,
      h('a', { class: 'pd-eva', href: hasSpecs ? `#${SPECS_ID}` : contentPath(meta.categories?.[0]?.url || '/vce/modular-office-systems') }, 'View eVA Catalog Specs', createIcon('arrow-forward')),
    ),
  );

  recalc();
  block.textContent = '';
  block.append(h('div', { class: 'pd-layout' }, buildGallery(product), info));
}

/* ------------------------------------------------------------------ */
/* Specs tabs (variant "specs")                                       */
/* ------------------------------------------------------------------ */

function specsPanel(product) {
  const s = product.specs || {};
  const highlights = s.highlights || [];
  const table = s.table || [];
  if (!highlights.length && !table.length && !s.care && !s.footprint) return null;
  const main = h('div', { class: 'pd-specs-main' }, h('h3', {}, 'Technical Performance Data'));
  if (highlights.length) {
    main.append(h('ul', { class: 'pd-highlights' }, highlights.map((x) => h(
      'li',
      {},
      h('span', { class: 'eyebrow' }, x.label),
      h('strong', {}, x.value),
      x.note ? h('span', {}, x.note) : null,
    ))));
  }
  if (table.length) {
    main.append(h('table', { class: 'pd-spec-table' }, h('caption', { class: 'visually-hidden' }, `${product.name} specifications`), h('tbody', {}, table.map(([k, v]) => h('tr', {}, h('th', { scope: 'row' }, k), h('td', {}, v))))));
  }
  if (s.care) {
    main.append(h('div', { class: 'pd-care' }, h('p', { class: 'pd-care-title' }, createIcon('health-and-safety'), 'Maintenance & Sanitization Protocol'), h('p', {}, s.care)));
  }
  const panel = h('div', { class: 'pd-specs-grid' }, main);
  if (s.footprint || product.footprint) {
    panel.append(h(
      'div',
      { class: 'pd-footprint' },
      h('h3', {}, 'Dimensional Footprint'),
      h(
        'div',
        { class: 'pd-footprint-box' },
        createIcon('architecture'),
        product.footprint ? h('p', { class: 'pd-footprint-name' }, product.footprint) : null,
        s.footprint ? h('p', {}, s.footprint) : null,
      ),
    ));
  }
  return panel;
}

function warrantyPanel(product) {
  if (!product.warranty?.length) return null;
  return h('ul', { class: 'pd-warranty' }, product.warranty.map((w) => h(
    'li',
    {},
    h('span', { class: 'pd-warranty-icon' }, createIcon(w.icon || 'verified')),
    h('div', {}, h('h3', {}, w.title), h('p', {}, w.text)),
  )));
}

function downloadsPanel(product, status) {
  if (!product.downloads?.length) return null;
  return h('ul', { class: 'pd-downloads' }, product.downloads.map((d) => h(
    'li',
    {},
    h('span', { class: 'pd-download-icon' }, createIcon(d.icon || 'description')),
    h('div', { class: 'pd-download-text' }, h('strong', {}, d.label), d.meta ? h('span', {}, d.meta) : null),
    h(
      'a',
      {
        class: 'button secondary',
        href: d.url || '#',
        onclick: (e) => {
          if (d.url) return;
          e.preventDefault();
          announce(status, `${d.label} is a placeholder in this demo.`);
        },
      },
      createIcon('download'),
      d.action || 'Download',
      h('span', { class: 'visually-hidden' }, `: ${d.label}`),
    ),
  )));
}

/** WAI-ARIA tabs with roving tabindex; empty tabs are omitted. */
function renderSpecs(block, product) {
  const status = h('p', { class: 'visually-hidden', role: 'status' });
  const tabsDef = [
    { label: 'Specifications & Materials', panel: specsPanel(product) },
    { label: 'Warranty & Delivery Logistics', panel: warrantyPanel(product) },
    { label: 'CAD, BIM & PDF Downloads', panel: downloadsPanel(product, status) },
  ].filter((t) => t.panel);
  if (!tabsDef.length) {
    block.remove();
    return;
  }
  const tablist = h('div', { class: 'pd-tablist', role: 'tablist', 'aria-label': `${product.name} details` });
  const tabs = [];
  const panels = [];
  tabsDef.forEach((t, i) => {
    const tabId = nextId('pd-tab');
    const panelId = nextId('pd-panel');
    const tab = h('button', {
      type: 'button',
      role: 'tab',
      id: tabId,
      class: 'pd-tab',
      'aria-controls': panelId,
      'aria-selected': String(i === 0),
      tabindex: i === 0 ? '0' : '-1',
    }, t.label);
    const panel = h('div', {
      role: 'tabpanel', id: panelId, class: 'pd-panel', 'aria-labelledby': tabId, tabindex: '0', hidden: i !== 0,
    }, t.panel);
    tabs.push(tab);
    panels.push(panel);
    tablist.append(tab);
  });
  const activate = (i, focus) => {
    tabs.forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
      panels[j].hidden = i !== j;
    });
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => activate(i)));
  tablist.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement);
    const keys = {
      ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1,
    };
    if (i < 0 || !(e.key in keys)) return;
    e.preventDefault();
    activate((keys[e.key] + tabs.length) % tabs.length, true);
  });

  block.id = SPECS_ID;
  block.textContent = '';
  block.append(h('h2', { class: 'visually-hidden' }, 'Product specifications and resources'), tablist, ...panels, status);
}

/* ------------------------------------------------------------------ */

function skeleton(specs) {
  if (specs) {
    return h('div', { class: 'pd-skeleton pd-skeleton-specs', 'aria-hidden': 'true' }, h('span', { class: 'pd-bone' }), h('span', { class: 'pd-bone wide' }), h('span', { class: 'pd-bone' }));
  }
  return h(
    'div',
    { class: 'pd-layout pd-skeleton', 'aria-hidden': 'true' },
    h('div', { class: 'pd-gallery' }, h('div', { class: 'pd-main' })),
    h('div', { class: 'pd-info' }, h('span', { class: 'pd-bone' }), h('span', { class: 'pd-bone wide' }), h('span', { class: 'pd-bone wide' }), h('span', { class: 'pd-bone block' })),
  );
}

function renderMissing(block, sku, meta) {
  const category = meta?.categories?.[0];
  block.textContent = '';
  block.append(h(
    'div',
    { class: 'pd-missing' },
    h('h1', {}, 'Product not found'),
    h('p', {}, `We couldn’t find catalog item “${sku || 'unknown'}”. It may have been renamed or retired from the state contract catalog.`),
    h('p', {}, h('a', { class: 'button primary', href: contentPath(category?.url || '/vce/modular-office-systems') }, `Browse ${category?.name || 'the catalog'}`)),
  ));
}

/**
 * product-detail: PDP buy box (default) or specifications tabs (variant "specs").
 * Content model: one row "SKU | <sku>".
 * @param {Element} block
 */
export default async function decorate(block) {
  const { sku } = readConfig(block);
  const specs = block.classList.contains('specs');
  block.textContent = '';
  block.append(skeleton(specs));
  Promise.all([getProduct(sku), getCatalogMeta()])
    .then(([product, meta]) => {
      if (!product) {
        if (specs) block.remove(); else renderMissing(block, sku, meta);
      } else if (specs) renderSpecs(block, product);
      else renderBuyBox(block, product, meta);
    })
    .catch(() => {
      if (specs) block.remove(); else renderMissing(block, sku);
    });
}
