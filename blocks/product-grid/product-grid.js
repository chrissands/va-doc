import { getMetadata, toClassName } from '../../scripts/aem.js';
import { createIcon } from '../../scripts/scripts.js';
import { contentPath } from '../../scripts/sites.js';
import { listProducts, getCatalogMeta, formatPrice } from '../../scripts/commerce/catalog.js';
import { addToCart } from '../../scripts/commerce/cart.js';

/**
 * Tiny element factory: h('a', { href, class: 'x' }, 'text', child).
 * Attributes with null/undefined/false are skipped; `on<event>` attaches listeners.
 */
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

const cellText = (cell) => cell?.textContent.trim() || '';
const csv = (cell) => cellText(cell).split(',').map((s) => s.trim()).filter(Boolean);

/** Reads key | value rows into { 'class-name-key': valueCell }. */
function readConfig(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (k && v) cfg[toClassName(k.textContent)] = v;
  });
  return cfg;
}

/** Sort options; authored labels are matched to these by keyword. */
const SORTS = [
  {
    id: 'popularity', match: /procur|popular/i, label: 'Most Procured (Statewide)', cmp: (a, b) => b.popularity - a.popularity,
  },
  {
    id: 'price-asc', match: /low to high/i, label: 'Starting Price: Low to High', cmp: (a, b) => a.price - b.price,
  },
  {
    id: 'price-desc', match: /high to low/i, label: 'Starting Price: High to Low', cmp: (a, b) => b.price - a.price,
  },
  {
    id: 'lead-time', match: /lead/i, label: 'Lead Time: Fastest First', cmp: (a, b) => (a.leadTimeDays - b.leadTimeDays) || (b.popularity - a.popularity),
  },
  {
    id: 'sku', match: /sku/i, label: 'Catalog SKU Number', cmp: (a, b) => a.sku.localeCompare(b.sku),
  },
];

/** Filter groups; authored group labels are matched to these by keyword. */
const GROUP_DEFS = [
  { key: 'config', match: /config/i, legend: 'Configuration Category' },
  { key: 'quickship', match: /lead|quickship/i, legend: 'Lead Time Speed' },
  { key: 'finish', match: /finish/i, legend: 'Standard Virginia Finishes' },
  { key: 'price', match: /price/i, legend: 'Unit Starting Price Range' },
  { key: 'height', match: /height|panel/i, legend: 'Panel Height' },
];

/**
 * Builds filter groups (options + test function) from the products and catalog metadata.
 * Groups with no applicable options are dropped (e.g. panel height for accessories).
 */
function buildGroups(labels, products, meta) {
  const used = (prop) => (o) => products.some((p) => [].concat(p[prop] ?? []).includes(o.id));
  const builders = {
    config: () => ({
      options: [...new Set(products.map((p) => p.configuration).filter(Boolean))]
        .map((label) => ({ id: toClassName(label), label })),
      test: (p, id) => toClassName(p.configuration || '') === id,
    }),
    quickship: () => ({
      options: products.some((p) => p.quickship)
        ? [{ id: 'quickship', label: 'Quickship Fast-Track', desc: 'Dispatches in 10 business days or less' }] : [],
      test: (p) => !!p.quickship,
    }),
    finish: () => ({
      type: 'swatch',
      options: (meta.finishes || []).filter(used('finishes')),
      test: (p, id) => (p.finishes || []).includes(id),
    }),
    price: () => ({
      options: meta.priceRanges || [],
      test: (p, id) => {
        const r = meta.priceRanges.find((x) => x.id === id);
        return p.price >= r.min && (r.max == null || p.price < r.max);
      },
    }),
    height: () => ({
      options: (meta.panelHeights || []).filter(used('panelHeight')),
      test: (p, id) => p.panelHeight === id,
    }),
  };
  const defs = labels.length
    ? labels.map((l) => {
      const def = GROUP_DEFS.find((d) => d.match.test(l));
      return def && { ...def, legend: l };
    }).filter(Boolean)
    : GROUP_DEFS;
  return defs
    .map((def) => ({ type: 'checkbox', ...def, ...builders[def.key]() }))
    .filter((g) => g.options.length);
}

/** Relative luminance check so the "selected" tick is visible on light and dark swatches. */
function isLight(hex = '#000000') {
  const n = parseInt(hex.replace('#', '').padEnd(6, '0'), 16);
  // eslint-disable-next-line no-bitwise
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160;
}

/** Product image with intrinsic size (no layout shift). */
function productImage(product, eager) {
  const img = product.images?.[0];
  if (!img) return h('div', { class: 'pg-noimage', 'aria-hidden': 'true' }, createIcon('image'));
  return h('img', {
    src: img.url,
    alt: img.alt || '',
    width: 800,
    height: 436,
    loading: eager ? 'eager' : 'lazy',
    decoding: 'async',
  });
}

/** Badge list; the quickship badge gets the bolt icon. */
function badges(product, max = 2) {
  const list = (product.badges || []).slice(0, max);
  if (!list.length) return null;
  return h('ul', { class: 'pg-badges' }, list.map((b) => {
    const quick = /quickship/i.test(b);
    return h('li', { class: `pg-badge${quick ? ' quickship' : ''}` }, quick ? createIcon('bolt') : null, b);
  }));
}

/**
 * Adds a product to the demo cart and reports it in a live region.
 * @param {object} product
 * @param {Element} status live region
 */
function handleAdd(product, status) {
  addToCart({ sku: product.sku, qty: 1, options: {} });
  status.textContent = '';
  // re-set on the next frame so repeated adds are announced again
  requestAnimationFrame(() => {
    status.textContent = `Added 1 × ${product.name} to your procurement cart (demo).`;
  });
}

/** Full PLP card (grid and list views). */
function buildCard(product, { eager, status }) {
  const href = contentPath(product.url);
  return h(
    'li',
    { class: 'pg-card' },
    h(
      'article',
      {},
      h('div', { class: 'pg-card-media' }, productImage(product, eager), badges(product)),
      h(
        'div',
        { class: 'pg-card-body' },
        h('p', { class: 'pg-card-meta' }, `SKU: ${product.sku}`, product.footprint ? h('span', {}, ` · ${product.footprint}`) : null),
        h('h3', { class: 'pg-card-title' }, h('a', { href }, product.name)),
        h('p', { class: 'pg-card-summary' }, product.summary || product.description || ''),
        h(
          'p',
          { class: 'pg-card-price' },
          h('span', { class: 'pg-price-label' }, product.priceLabel || 'Price'),
          h('span', { class: 'pg-price-value' }, h('span', { class: 'pg-price-from' }, 'From '), formatPrice(product.price)),
        ),
        h(
          'div',
          { class: 'pg-card-actions' },
          h('a', { class: 'button primary', href }, 'View Details', h('span', { class: 'visually-hidden' }, `: ${product.name}`)),
          h(
            'button',
            { type: 'button', class: 'button accent', onclick: () => handleAdd(product, status) },
            createIcon('add-shopping-cart'),
            'Add to Cart',
            h('span', { class: 'visually-hidden' }, `: ${product.name}`),
          ),
        ),
      ),
    ),
  );
}

/** Compact card for the "related" variant. */
function buildCompactCard(product, { status }) {
  const quick = (product.badges || []).find((b) => /quickship/i.test(b)) || (product.quickship && 'Quickship');
  return h(
    'li',
    { class: 'pg-card pg-card-compact' },
    h(
      'article',
      {},
      h(
        'div',
        { class: 'pg-card-media' },
        productImage(product, false),
        quick ? h('ul', { class: 'pg-badges' }, h('li', { class: 'pg-badge quickship' }, createIcon('bolt'), quick)) : null,
      ),
      h(
        'div',
        { class: 'pg-card-body' },
        h('p', { class: 'pg-card-meta' }, `SKU: ${product.sku}`),
        h('h3', { class: 'pg-card-title' }, h('a', { href: contentPath(product.url) }, product.name)),
        h('p', { class: 'pg-card-summary' }, product.summary || ''),
        h(
          'div',
          { class: 'pg-card-foot' },
          h('p', { class: 'pg-price-value' }, formatPrice(product.price)),
          h(
            'button',
            {
              type: 'button',
              class: 'pg-icon-button',
              'aria-label': `Add ${product.name} to cart`,
              onclick: () => handleAdd(product, status),
            },
            createIcon('add-shopping-cart'),
          ),
        ),
      ),
    ),
  );
}

/** Placeholder cards shown while the catalog loads. */
function skeleton(count, compact) {
  return h('ul', { class: `pg-list pg-skeleton${compact ? ' pg-related-list' : ''}`, 'aria-hidden': 'true' }, Array.from({ length: count }, () => h(
    'li',
    { class: 'pg-card' },
    h('div', { class: 'pg-card-media' }),
    h('div', { class: 'pg-card-body' }, h('span', { class: 'pg-bone' }), h('span', { class: 'pg-bone wide' }), h('span', { class: 'pg-bone' })),
  )));
}

/** Related products variant: "SKUs | a, b, c" → 4-up compact cards. */
async function decorateRelated(block, cfg) {
  const skus = csv(cfg.skus || cfg.sku);
  block.textContent = '';
  const status = h('p', { class: 'visually-hidden', role: 'status' });
  block.append(skeleton(Math.min(skus.length || 4, 4), true), status);
  try {
    // local preview keeps the authored key case (SKU); production lowercases it
    const current = (getMetadata('sku') || getMetadata('SKU') || '').toUpperCase();
    const products = (await listProducts({ skus })).filter((p) => p.sku.toUpperCase() !== current);
    const list = h('ul', { class: 'pg-list pg-related-list' }, products.map((p) => buildCompactCard(p, { status })));
    block.querySelector('.pg-skeleton').replaceWith(list);
  } catch (e) {
    block.querySelector('.pg-skeleton').replaceWith(h('p', { class: 'pg-empty' }, 'Related products are temporarily unavailable.'));
  }
}

/** Builds the PLP from loaded data. */
function renderListing(block, cfg, products, meta) {
  const pageSize = Math.max(1, parseInt(cellText(cfg['page-size']), 10) || 6);
  const category = meta.categories?.find((c) => c.id === cellText(cfg.category));
  const noun = category?.label || 'Products';
  const nounOne = noun.replace(/s$/, '');
  const nounFor = (n) => (n === 1 ? nounOne : noun);

  const sortLabels = csv(cfg.sort);
  const sorts = sortLabels.length
    ? sortLabels.map((l) => {
      const s = SORTS.find((x) => x.match.test(l));
      return s && { ...s, label: l };
    }).filter(Boolean)
    : SORTS;
  const groups = buildGroups(csv(cfg.filters), products, meta);

  // ---------- state (restored from the URL) ----------
  const params = new URLSearchParams(window.location.search);
  const state = {
    page: Math.max(1, parseInt(params.get('page'), 10) || 1),
    sort: sorts.find((s) => s.id === params.get('sort'))?.id || sorts[0]?.id,
    view: params.get('view') === 'list' ? 'list' : 'grid',
    filters: Object.fromEntries(groups.map((g) => {
      const ids = (params.get(g.key) || '').split(',');
      return [g.key, new Set(g.options.map((o) => o.id).filter((id) => ids.includes(id)))];
    })),
  };

  const activeCount = () => groups.reduce((n, g) => n + state.filters[g.key].size, 0);

  /** AND across groups, OR within a group; `skip` ignores one group (for facet counts). */
  /** Re-renders everything from state (assigned below, once all parts exist). */
  let update;

  const matches = (p, skip) => groups.every((g) => {
    const sel = state.filters[g.key];
    return g.key === skip || !sel.size || [...sel].some((id) => g.test(p, id));
  });

  // ---------- shell ----------
  const railId = nextId('pg-rail');
  const railHeadingId = nextId('pg-rail-heading');
  const resultsHeadingId = nextId('pg-results-heading');
  const sortId = nextId('pg-sort');

  const announcer = h('p', { class: 'visually-hidden', role: 'status' });
  const cartStatus = h('p', { class: 'pg-cart-status', role: 'status' });
  const toggleCount = h('span', { class: 'pg-toggle-count' });
  const refineToggle = h(
    'button',
    {
      type: 'button', class: 'pg-refine-toggle', 'aria-expanded': 'false', 'aria-controls': railId,
    },
    createIcon('tune'),
    `Refine ${noun.split(' ').pop()}`,
    toggleCount,
    createIcon('expand-more'),
  );
  const chips = h('ul', { class: 'pg-chips', 'aria-label': 'Active filters' });
  const resetBtn = h('button', { type: 'button', class: 'pg-reset' }, 'Reset All');
  const rail = h(
    'aside',
    { class: 'pg-rail', id: railId, 'aria-labelledby': railHeadingId },
    h(
      'div',
      { class: 'pg-rail-head' },
      h('h2', { id: railHeadingId }, createIcon('tune'), `Refine ${noun.split(' ').pop()}`),
      resetBtn,
    ),
    chips,
  );

  // ---------- filter groups ----------
  const controls = []; // { group, option, el, count? }
  groups.forEach((g) => {
    const fs = h('fieldset', { class: `pg-group pg-group-${g.key}` }, h('legend', {}, g.legend));
    if (g.type === 'swatch') {
      fs.append(h('p', { class: 'pg-group-hint' }, 'Select one or more finishes.'));
      const wrap = h('div', { class: 'pg-swatches' });
      g.options.forEach((o) => {
        const btn = h(
          'button',
          {
            type: 'button',
            class: `pg-swatch${isLight(o.swatch) ? ' light' : ''}`,
            'aria-pressed': 'false',
            title: o.label,
            style: `--swatch: ${o.swatch}`,
          },
          createIcon('check'),
          h('span', { class: 'visually-hidden' }, o.label),
        );
        btn.addEventListener('click', () => {
          const sel = state.filters[g.key];
          if (sel.has(o.id)) sel.delete(o.id); else sel.add(o.id);
          state.page = 1;
          update({ announce: true });
        });
        controls.push({ group: g, option: o, el: btn });
        wrap.append(btn);
      });
      fs.append(wrap);
    } else {
      const ul = h('ul', { class: 'pg-options' });
      g.options.forEach((o) => {
        const id = nextId(`pg-${g.key}`);
        const count = g.key === 'quickship' ? null : h('span', { class: 'pg-count' });
        const input = h('input', { type: 'checkbox', id, value: o.id });
        input.addEventListener('change', () => {
          const sel = state.filters[g.key];
          if (input.checked) sel.add(o.id); else sel.delete(o.id);
          state.page = 1;
          update({ announce: true });
        });
        controls.push({
          group: g, option: o, el: input, count,
        });
        ul.append(h(
          'li',
          { class: o.desc ? 'pg-option-feature' : null },
          input,
          h(
            'label',
            { for: id },
            h('span', { class: 'pg-option-label' }, o.label, o.desc ? h('span', { class: 'pg-option-desc' }, o.desc) : null),
            count,
          ),
        ));
      });
      fs.append(ul);
    }
    rail.append(fs);
  });

  if (cfg.note) {
    const note = h('div', { class: 'pg-note' }, createIcon('info'));
    const body = h('div', { class: 'pg-note-body' });
    body.append(...cfg.note.childNodes);
    note.append(body);
    rail.append(note);
  }

  // ---------- toolbar ----------
  const heading = h('h2', { class: 'pg-results-heading', id: resultsHeadingId, tabindex: '-1' });
  const rangeTag = h('span', { class: 'pg-range-tag' });
  const select = h('select', { id: sortId }, sorts.map((s) => h('option', { value: s.id }, s.label)));
  select.value = state.sort;
  select.addEventListener('change', () => {
    state.sort = select.value;
    state.page = 1;
    update({ announce: true });
  });
  const viewBtn = (view, label, icon) => {
    const b = h('button', {
      type: 'button', class: 'pg-view-btn', 'data-view': view, 'aria-label': label, 'aria-pressed': 'false', title: label,
    }, createIcon(icon));
    b.addEventListener('click', () => {
      state.view = view;
      update();
    });
    return b;
  };
  const viewBtns = [viewBtn('grid', 'Grid view', 'grid-view'), viewBtn('list', 'List view', 'view-list')];
  const toolbar = h(
    'div',
    { class: 'pg-toolbar' },
    h('div', { class: 'pg-toolbar-title' }, heading, rangeTag),
    h(
      'div',
      { class: 'pg-toolbar-controls' },
      h('div', { class: 'pg-sort' }, h('label', { for: sortId }, 'Sort by'), select),
      h('div', { class: 'pg-view', role: 'group', 'aria-label': 'Results layout' }, viewBtns),
    ),
  );

  const list = h('ul', { class: 'pg-list', 'aria-labelledby': resultsHeadingId });
  const rangeText = h('p', { class: 'pg-range' });
  const pager = h('ul', { class: 'pg-pages' });
  const pagination = h('nav', { class: 'pg-pagination', 'aria-label': `${noun} pages` }, rangeText, pager);
  const results = h('div', { class: 'pg-results' }, toolbar, cartStatus, list, pagination, announcer);

  const layout = h('div', { class: 'pg-layout' }, h('div', { class: 'pg-refine-bar' }, refineToggle), rail, results);

  refineToggle.addEventListener('click', () => {
    const open = refineToggle.getAttribute('aria-expanded') !== 'true';
    refineToggle.setAttribute('aria-expanded', String(open));
    layout.classList.toggle('pg-refine-open', open);
  });

  resetBtn.addEventListener('click', () => {
    groups.forEach((g) => state.filters[g.key].clear());
    state.page = 1;
    update({ announce: true });
  });

  /** Writes non-default state to the query string (no history entries). */
  function syncUrl() {
    const url = new URL(window.location.href);
    ['page', 'sort', 'view', ...groups.map((g) => g.key)].forEach((k) => url.searchParams.delete(k));
    if (state.page > 1) url.searchParams.set('page', state.page);
    if (state.sort !== sorts[0]?.id) url.searchParams.set('sort', state.sort);
    if (state.view !== 'grid') url.searchParams.set('view', state.view);
    groups.forEach((g) => {
      if (state.filters[g.key].size) url.searchParams.set(g.key, [...state.filters[g.key]].join(','));
    });
    window.history.replaceState(window.history.state, '', url);
  }

  function goToPage(page) {
    state.page = page;
    update({ focus: true });
  }

  function renderPager(totalPages) {
    pager.textContent = '';
    if (totalPages <= 1) return;
    const btn = (label, page, opts = {}) => h('li', {}, h(
      'button',
      {
        type: 'button',
        class: `pg-page${opts.cls ? ` ${opts.cls}` : ''}`,
        'aria-label': opts.aria,
        'aria-current': page === state.page && !opts.cls ? 'page' : null,
        disabled: opts.disabled,
        onclick: () => goToPage(page),
      },
      ...label,
    ));
    pager.append(btn([createIcon('chevron-left'), 'Previous'], state.page - 1, { cls: 'prev', disabled: state.page === 1 }));
    for (let i = 1; i <= totalPages; i += 1) pager.append(btn([String(i)], i, { aria: `Page ${i}` }));
    pager.append(btn(['Next', createIcon('chevron-right')], state.page + 1, { cls: 'next', disabled: state.page === totalPages }));
  }

  function renderChips() {
    chips.textContent = '';
    groups.forEach((g) => state.filters[g.key].forEach((id) => {
      const o = g.options.find((x) => x.id === id);
      chips.append(h('li', {}, h(
        'button',
        {
          type: 'button',
          class: 'pg-chip',
          'aria-label': `Remove filter: ${o.label}`,
          'data-key': `${g.key}:${id}`,
          onclick: () => {
            state.filters[g.key].delete(id);
            state.page = 1;
            update({ announce: true });
            (chips.querySelector('.pg-chip') || resetBtn).focus();
          },
        },
        o.label,
        createIcon('close'),
      )));
    }));
    chips.hidden = !chips.children.length;
  }

  update = ({ announce = false, focus = false } = {}) => {
    const sort = sorts.find((s) => s.id === state.sort) || SORTS[0];
    const filtered = products.filter((p) => matches(p)).sort(sort.cmp);
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * pageSize;
    const pageItems = filtered.slice(start, start + pageSize);
    const from = total ? start + 1 : 0;
    const to = start + pageItems.length;

    // controls reflect state; facet counts consider all other groups
    controls.forEach(({
      group, option, el, count,
    }) => {
      const on = state.filters[group.key].has(option.id);
      if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', String(on));
      else el.checked = on;
      if (count) {
        const n = products.filter((p) => matches(p, group.key) && group.test(p, option.id)).length;
        count.textContent = n;
        count.setAttribute('aria-label', `${n} ${nounFor(n).toLowerCase()}`);
      }
    });
    renderChips();
    const active = activeCount();
    toggleCount.textContent = active ? ` (${active})` : '';

    heading.textContent = `${total} ${nounFor(total)}`;
    rangeTag.textContent = total ? `Showing ${from}–${to}` : 'No results';
    viewBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === state.view)));
    list.classList.toggle('pg-list-view', state.view === 'list');

    list.textContent = '';
    pageItems.forEach((p, i) => {
      list.append(buildCard(p, { eager: state.page === 1 && i < 3, status: cartStatus }));
    });
    if (!total) {
      list.append(h(
        'li',
        { class: 'pg-empty' },
        h('p', {}, `No ${noun.toLowerCase()} match the selected filters.`),
        h('button', { type: 'button', class: 'button secondary', onclick: () => resetBtn.click() }, 'Reset all filters'),
      ));
    }
    rangeText.textContent = total
      ? `Showing ${from} through ${to} of ${total} ${nounFor(total).toLowerCase()}`
      : '';
    renderPager(totalPages);

    if (announce) announcer.textContent = total ? `${total} ${nounFor(total).toLowerCase()} found. Showing ${from} through ${to}.` : `No ${noun.toLowerCase()} match the selected filters.`;
    if (focus) {
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    syncUrl();
  };

  block.textContent = '';
  block.append(layout);
  update();
}

/**
 * product-grid: product listing (PLP) with filters, sort, view toggle and pagination,
 * or (variant "related") a 4-up row of compact product cards.
 * @param {Element} block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  if (block.classList.contains('related')) {
    decorateRelated(block, cfg);
    return;
  }
  block.textContent = '';
  block.append(h(
    'div',
    { class: 'pg-layout pg-loading', 'aria-busy': 'true' },
    h('div', { class: 'pg-refine-bar' }, h('span', { class: 'pg-refine-toggle' })),
    h('div', { class: 'pg-rail' }),
    h(
      'div',
      { class: 'pg-results' },
      h('div', { class: 'pg-toolbar' }),
      skeleton(Math.max(1, parseInt(cellText(cfg['page-size']), 10) || 6)),
    ),
    h('p', { class: 'visually-hidden', role: 'status' }, 'Loading products…'),
  ));
  const category = cellText(cfg.category);
  Promise.all([listProducts({ category: category || undefined }), getCatalogMeta()])
    .then(([products, meta]) => renderListing(block, cfg, products, meta))
    .catch(() => {
      block.textContent = '';
      block.append(h('p', { class: 'pg-empty' }, 'The product catalog is temporarily unavailable. Please try again later.'));
    });
}
