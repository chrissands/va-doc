/**
 * Line items: an editable, repeatable table of items submitted with a form (via the `form`
 * attribute). Rows (key | value): Title, Form, Columns, Item Types, Reasons, Item (sample rows,
 * "description; vendor; sku; type; qty; price; reason").
 * Dispatches `line-items:change` on document with { form, units, lines, total }.
 */
import { createIcon } from '../../scripts/scripts.js';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const KEYS = ['description', 'vendor', 'sku', 'type', 'qty', 'price', 'total', 'reason'];
const DEFAULT_COLUMNS = ['Description', 'Vendor / PO #', 'Item # / SKU', 'Item Type', 'Qty', 'Price (ea)', 'Total', 'Reason'];
/** Required cells and their friendly messages (line number appended). */
const REQUIRED = {
  description: 'Enter a description for line',
  type: 'Select an item type for line',
  qty: 'Enter a quantity for line',
  price: 'Enter a unit price for line',
  reason: 'Select a reason for release for line',
};

let uid = 0;

const list = (s) => s.split(',').map((v) => v.trim()).filter(Boolean);

/** Reads the key | value rows. */
function readConfig(block) {
  const cfg = {
    items: [], columns: DEFAULT_COLUMNS, types: [], reasons: [], form: '',
  };
  [...block.children].forEach((row) => {
    const [k, v] = row.children;
    if (!k || !v) return;
    const key = k.textContent.trim().toLowerCase();
    const text = v.textContent.trim();
    if (key === 'title') cfg.title = v;
    else if (key === 'form') cfg.form = text;
    else if (key === 'columns') cfg.columns = list(text);
    else if (key === 'item types') cfg.types = list(text);
    else if (key === 'reasons') cfg.reasons = list(text);
    else if (key === 'item') cfg.items.push(text.split(';').map((s) => s.trim()));
  });
  return cfg;
}

function selectOf(options, placeholder, value) {
  const select = document.createElement('select');
  select.append(new Option(placeholder, ''));
  options.forEach((o) => {
    const opt = new Option(o, o);
    if (o === value) opt.defaultSelected = true;
    select.append(opt);
  });
  return select;
}

/**
 * @param {Element} block line-items block
 */
export default async function decorate(block) {
  const cfg = readConfig(block);
  const formId = cfg.form;
  block.dataset.form = formId;
  const col = (key) => cfg.columns[KEYS.indexOf(key)] || DEFAULT_COLUMNS[KEYS.indexOf(key)];

  // header: step badge, title + subtitle, line count tag
  const head = document.createElement('div');
  head.className = 'line-items-head';
  const step = document.createElement('span');
  step.className = 'line-items-step';
  step.setAttribute('aria-hidden', 'true');
  step.textContent = '1';
  const titles = document.createElement('div');
  titles.className = 'line-items-titles';
  if (cfg.title) titles.append(...cfg.title.childNodes);
  const heading = titles.querySelector('h1, h2, h3, h4') || document.createElement('h2');
  if (!titles.contains(heading)) { heading.textContent = 'Line items'; titles.prepend(heading); }
  heading.id = heading.id || `line-items-${formId}`;
  const count = document.createElement('span');
  count.className = 'tag line-items-count';
  head.append(step, titles, count);

  // table
  const scroller = document.createElement('div');
  scroller.className = 'line-items-scroll';
  const table = document.createElement('table');
  const caption = document.createElement('caption');
  caption.className = 'visually-hidden';
  caption.textContent = heading.textContent;
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  KEYS.forEach((key) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.className = `line-items-${key}`;
    th.textContent = col(key);
    if (REQUIRED[key]) {
      const star = document.createElement('span');
      star.className = 'line-items-required';
      star.setAttribute('aria-hidden', 'true');
      star.textContent = ' *';
      th.append(star);
    }
    tr.append(th);
  });
  const thAct = document.createElement('th');
  thAct.scope = 'col';
  thAct.className = 'line-items-actions';
  thAct.innerHTML = '<span class="visually-hidden">Actions</span>';
  tr.append(thAct);
  thead.append(tr);
  const tbody = document.createElement('tbody');
  table.append(caption, thead, tbody);
  scroller.append(table);

  // footer: add button + grand total
  const foot = document.createElement('div');
  foot.className = 'line-items-foot';
  const add = document.createElement('button');
  add.type = 'button';
  add.className = 'button line-items-add';
  add.append(createIcon('add-circle'), 'Add Line Item');
  const grand = document.createElement('p');
  grand.className = 'line-items-grand';
  const grandLabel = document.createElement('span');
  grandLabel.id = `${heading.id}-grand`;
  grandLabel.textContent = 'Running Grand Total:';
  const out = document.createElement('output');
  out.setAttribute('aria-live', 'polite');
  out.setAttribute('aria-labelledby', grandLabel.id);
  grand.append(grandLabel, ' ', out);
  foot.append(add, grand);

  const announcer = document.createElement('p');
  announcer.className = 'visually-hidden';
  announcer.setAttribute('aria-live', 'polite');

  const rows = () => [...tbody.rows];
  const num = (input) => {
    const v = parseFloat(input.value);
    return Number.isFinite(v) ? v : 0;
  };

  /** Recomputes totals, renumbers rows, and notifies listeners. */
  const update = () => {
    let units = 0;
    let total = 0;
    rows().forEach((row, i) => {
      const n = i + 1;
      const qty = row.querySelector('[data-key="qty"]');
      const price = row.querySelector('[data-key="price"]');
      const lineTotal = num(qty) * num(price);
      units += num(qty);
      total += lineTotal;
      row.querySelector('output').value = usd.format(lineTotal);
      row.querySelector('.line-items-rowlabel').textContent = `Line ${n}`;
      row.querySelectorAll('[data-key]').forEach((el) => {
        const { key } = el.dataset;
        el.name = `items[${i}][${key}]`;
        el.closest('td').querySelector('.line-items-n').textContent = `Line ${n} `;
        el.dataset.label = `${col(key)} for line ${n}`;
        if (REQUIRED[key]) el.dataset.requiredMessage = `${REQUIRED[key]} ${n}.`;
      });
      const del = row.querySelector('.line-items-delete');
      del.setAttribute('aria-label', `Remove line ${n}`);
      del.disabled = rows().length === 1;
    });
    const lines = rows().length;
    count.replaceChildren('Line Count: ', Object.assign(document.createElement('strong'), {
      textContent: `${lines} ${lines === 1 ? 'Item' : 'Items'}`,
    }));
    out.value = usd.format(total);
    total = Math.round(total * 100) / 100;
    Object.assign(block.dataset, { units, lines, total });
    document.dispatchEvent(new CustomEvent('line-items:change', {
      detail: {
        form: formId, units, lines, total,
      },
    }));
  };

  /** Creates one row (optionally prefilled from an "Item" row). */
  const createRow = (values = []) => {
    uid += 1;
    const row = document.createElement('tr');
    KEYS.forEach((key, k) => {
      const td = document.createElement('td');
      td.className = `line-items-${key}`;
      const id = `li-${uid}-${key}`;
      const label = document.createElement('label');
      label.htmlFor = id;
      label.className = 'line-items-label';
      const n = document.createElement('span');
      n.className = 'line-items-n visually-hidden';
      label.append(n, col(key));
      let el;
      const value = values[k > 6 ? k - 1 : k] || ''; // sample rows omit the computed Total
      if (key === 'total') {
        el = document.createElement('output');
        el.htmlFor = `li-${uid}-qty li-${uid}-price`;
      } else if (key === 'type' || key === 'reason') {
        el = selectOf(key === 'type' ? cfg.types : cfg.reasons, key === 'type' ? 'Select type' : 'Select reason', value);
      } else {
        el = document.createElement('input');
        if (key === 'qty' || key === 'price') {
          el.type = 'number';
          el.inputMode = key === 'qty' ? 'numeric' : 'decimal';
          el.min = key === 'qty' ? '1' : '0';
          el.step = key === 'qty' ? '1' : '0.01';
        } else el.type = 'text';
        if (value) el.setAttribute('value', el.type === 'number' ? value.replace(/[$,]/g, '') : value);
      }
      el.id = id;
      if (key !== 'total') {
        el.dataset.key = key;
        el.className = 'line-items-control';
        if (formId) el.setAttribute('form', formId);
        if (REQUIRED[key]) {
          el.required = true;
          const star = document.createElement('span');
          star.className = 'line-items-required';
          star.setAttribute('aria-hidden', 'true');
          star.textContent = ' *';
          label.append(star);
        }
        const err = document.createElement('span');
        err.className = 'form-error line-items-error';
        err.id = `${id}-error`;
        err.hidden = true;
        td.append(label, el, err);
      } else td.append(label, el);
      row.append(td);
    });
    const tdAct = document.createElement('td');
    tdAct.className = 'line-items-actions';
    const rowLabel = document.createElement('span');
    rowLabel.className = 'line-items-rowlabel';
    rowLabel.setAttribute('aria-hidden', 'true');
    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'line-items-delete';
    del.append(createIcon('delete'));
    tdAct.append(rowLabel, del);
    row.append(tdAct);
    return row;
  };

  tbody.addEventListener('click', (e) => {
    const del = e.target.closest('.line-items-delete');
    if (!del || rows().length < 2) return;
    const row = del.closest('tr');
    const index = rows().indexOf(row);
    row.remove();
    update();
    announcer.textContent = `Line ${index + 1} removed. ${rows().length} lines remain.`;
    // focus the row that moved into place, else the new last row
    const target = rows()[Math.min(index, rows().length - 1)];
    const btn = target.querySelector('.line-items-delete');
    (btn.disabled ? target.querySelector('.line-items-control') : btn).focus();
  });
  tbody.addEventListener('input', update);
  tbody.addEventListener('change', update);
  add.addEventListener('click', () => {
    const row = createRow();
    tbody.append(row);
    update();
    announcer.textContent = `Line ${rows().length} added.`;
    row.querySelector('.line-items-control').focus();
  });
  // form.reset() restores associated controls: recompute after it has run
  document.addEventListener('reset', (e) => {
    if (e.target.id === formId) setTimeout(update);
  });

  (cfg.items.length ? cfg.items : [[]]).forEach((values) => tbody.append(createRow(values)));
  block.replaceChildren(head, scroller, foot, announcer);
  update();
}
