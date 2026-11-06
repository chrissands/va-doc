/**
 * Form block: renders a form from a sheet definition (JSON {data:[rows]}), with accessible
 * inline validation, an error summary, a live submission summary and demo / JSON submission.
 * createForm() is exported for reuse (locator-search).
 */
import { createIcon } from '../../scripts/scripts.js';
import {
  normalizeRow, createField, buildButton,
} from './form-fields.js';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** Fetches (or accepts) a definition and returns its rows. */
async function loadRows(src) {
  let json = src;
  if (typeof src === 'string') {
    const resp = await fetch(src);
    if (!resp.ok) throw new Error(`form definition ${src}: ${resp.status}`);
    json = await resp.json();
  }
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  const sheet = Object.values(json || {}).find((v) => Array.isArray(v?.data));
  return sheet ? sheet.data : [];
}

/** Message for controls built elsewhere (e.g. line-items cells) from the constraint API. */
function nativeMessage(el) {
  const label = el.dataset.label || el.labels?.[0]?.textContent.replace(/\*|\(required\)/g, '').trim() || el.name;
  const v = el.validity;
  if (v.valueMissing) return el.dataset.requiredMessage || `${label} is required.`;
  if (v.badInput) return `${label} must be a number.`;
  if (v.rangeUnderflow) return `${label} must be ${el.min} or more.`;
  if (v.rangeOverflow) return `${label} must be ${el.max} or less.`;
  if (v.stepMismatch) return `${label} can have at most two decimal places.`;
  if (v.typeMismatch || v.patternMismatch) return `Check the format of ${label}.`;
  return '';
}

const isValidatable = (el) => el.id && el.willValidate
  && !['BUTTON', 'FIELDSET', 'OUTPUT', 'OBJECT'].includes(el.tagName)
  && !['submit', 'button', 'reset', 'image', 'hidden'].includes(el.type);

/** Reference number such as REL-2026-0042. */
function referenceNumber(id) {
  const prefix = (id.replace(/[^a-z]/gi, '').slice(0, 3) || 'REQ').toUpperCase();
  const n = crypto.getRandomValues(new Uint16Array(1))[0] % 9999;
  return `${prefix}-${new Date().getFullYear()}-${String(n + 1).padStart(4, '0')}`;
}

/** Builds the live submission summary panel (summary row). */
function buildSummary(fd, formId) {
  const panel = document.createElement('section');
  panel.className = 'form-summary';
  panel.setAttribute('aria-labelledby', `${formId}-summary-title`);
  const head = document.createElement('div');
  head.className = 'form-summary-head';
  const h = document.createElement('h2');
  h.id = `${formId}-summary-title`;
  h.textContent = fd.label;
  const status = document.createElement('span');
  status.className = 'tag form-summary-status';
  status.setAttribute('role', 'status');
  head.append(h, status);

  const [reviewLabel, reviewValue] = fd.description.includes(':')
    ? fd.description.split(/:\s*/, 2) : ['Statutory Review Time', fd.description];
  const dl = document.createElement('dl');
  const dd = {};
  [['units', 'Total Item Units'], ['lines', 'Distinct Line Items'], ['files', 'Attached File Evidence'],
    ['review', reviewLabel], ['total', 'Exemption Valuation (USD)']].forEach(([key, label]) => {
    if (key === 'review' && !reviewValue) return;
    const row = document.createElement('div');
    row.className = `form-summary-row form-summary-${key}`;
    const dt = document.createElement('dt');
    dt.textContent = label;
    dd[key] = document.createElement('dd');
    if (key === 'review') dd[key].textContent = reviewValue;
    row.append(dt, dd[key]);
    dl.append(row);
  });
  const actions = document.createElement('div');
  actions.className = 'form-summary-actions';
  panel.append(head, dl, actions);

  const pending = fd.value || 'Draft Pending';
  return {
    panel,
    actions,
    update({
      units = 0, lines = 0, total = 0, files = 0, ready = false, submitted = false,
    }) {
      dd.units.textContent = plural(units, 'Unit');
      dd.lines.textContent = plural(lines, 'Item');
      dd.files.textContent = plural(files, 'Document');
      dd.total.textContent = usd.format(total);
      const label = (submitted && 'Submitted') || (ready ? 'Ready to Submit' : pending);
      if (status.dataset.label !== label) {
        status.dataset.label = label;
        status.replaceChildren(...(ready || submitted ? [createIcon('check-circle')] : []), label);
        status.classList.toggle('is-ready', ready || submitted);
      }
    },
  };
}

/**
 * Creates a form from a definition.
 * @param {string|Object} definition URL of the sheet JSON, or the JSON itself
 * @param {Object} [options]
 * @param {string} [options.id] form id (defaults to the definition file name)
 * @param {Function} [options.onSubmit] async (data, form) => void, replaces the default submit
 * @param {Function} [options.validate] (form) => [{ name, message }] extra cross-field rules
 * @param {string} [options.submitTo] URL to POST {data} to; demo mode when absent
 * @returns {Promise<HTMLFormElement>}
 */
export async function createForm(definition, options = {}) {
  const id = options.id || (typeof definition === 'string'
    ? new URL(definition, window.location.href).pathname.split('/').pop().replace(/\.json$/, '')
    : 'form');
  const rows = await loadRows(definition);
  const fds = rows.map((r) => normalizeRow(r, id));

  const form = document.createElement('form');
  form.id = id;
  form.className = 'form-body';
  form.noValidate = true;

  const errorSummary = document.createElement('div');
  errorSummary.className = 'form-error-summary';
  errorSummary.setAttribute('role', 'alert');
  errorSummary.tabIndex = -1;
  errorSummary.hidden = true;
  form.append(errorSummary);

  if (fds.some((fd) => fd.required)) {
    const note = document.createElement('p');
    note.className = 'form-required-note';
    note.textContent = 'Fields marked with an asterisk (*) are required.';
    form.append(note);
  }

  const grid = document.createElement('div');
  grid.className = 'form-grid';
  form.append(grid);

  const records = [];
  const byEl = new Map();
  const byName = new Map();
  const buttons = [];
  let summary = null;
  let fieldset = null;

  fds.forEach((fd) => {
    if (fd.type === 'summary') { summary = buildSummary(fd, id); return; }
    if (fd.type === 'submit' || fd.type === 'button') { buttons.push(buildButton(fd, id)); return; }
    // consecutive rows sharing a Fieldset value form one <fieldset>
    if (!fd.fieldset) fieldset = null;
    else if (fieldset?.dataset.fieldset !== fd.fieldset) {
      fieldset = document.createElement('fieldset');
      fieldset.className = 'form-fieldset';
      fieldset.dataset.fieldset = fd.fieldset;
      const legend = document.createElement('legend');
      legend.className = 'form-legend visually-hidden';
      legend.textContent = fd.fieldset.replace(/[-_]/g, ' ');
      const inner = document.createElement('div');
      inner.className = 'form-grid';
      fieldset.append(legend, inner);
      grid.append(fieldset);
    }
    const target = fieldset ? fieldset.querySelector(':scope > .form-grid') : grid;
    if (fd.type === 'heading' && fieldset && !fieldset.dataset.titled) {
      fieldset.dataset.titled = 'true';
      const legend = fieldset.querySelector('legend');
      legend.className = 'form-legend';
      legend.id = fd.id;
      legend.textContent = fd.label;
      if (fd.description) {
        const hint = document.createElement('p');
        hint.className = 'form-legend-hint';
        hint.id = `${fd.id}-hint`;
        hint.textContent = fd.description;
        legend.after(hint);
        fieldset.setAttribute('aria-describedby', hint.id);
      }
      return;
    }
    const rec = createField(fd);
    target.append(rec.wrapper);
    if (!rec.validate) return;
    records.push(rec);
    byName.set(fd.name, rec);
    [rec.el, rec.focusEl, rec.wrapper, ...(rec.els || [])].forEach((el) => byEl.set(el, rec));
    if (fieldset && fd.type === 'file') fieldset.classList.add('has-files');
    if (fieldset && fd.type === 'captcha') fieldset.classList.add('has-captcha');
  });

  // icons for upload / security fieldsets (decorative)
  form.querySelectorAll('.form-fieldset.has-files > legend, .form-fieldset.has-captcha > legend').forEach((legend) => {
    legend.prepend(createIcon(legend.parentElement.classList.contains('has-files') ? 'cloud-upload' : 'security'));
  });

  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  if (summary) {
    summary.actions.append(...buttons, status);
    form.append(summary.panel);
  } else {
    const actions = document.createElement('div');
    actions.className = 'form-actions';
    actions.append(...buttons, status);
    form.append(actions);
  }

  /* ---------- validation ---------- */
  const foreign = new WeakMap();
  /** Record for a control associated via the form attribute (e.g. line-items cells). */
  const foreignRecord = (el) => {
    if (!foreign.has(el)) {
      let errorEl = document.getElementById(`${el.id}-error`);
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'form-error';
        errorEl.id = `${el.id}-error`;
        errorEl.hidden = true;
        el.after(errorEl);
      }
      el.dataset.describedby = el.dataset.describedby ?? (el.getAttribute('aria-describedby') || '');
      foreign.set(el, {
        el, focusEl: el, errorEl, foreign: true, validate: () => nativeMessage(el),
      });
    }
    return foreign.get(el);
  };
  const recordFor = (el) => {
    if (!el || !(el.form === form || form.contains(el))) return null;
    if (byEl.has(el)) return byEl.get(el);
    return el.form === form && isValidatable(el) ? foreignRecord(el) : null;
  };
  const allRecords = () => {
    const out = new Set();
    [...form.elements].forEach((el) => { const r = recordFor(el); if (r) out.add(r); });
    records.forEach((r) => out.add(r));
    return [...out];
  };

  /** Shows (or clears) a field's error message and state. */
  const showError = (rec, msg) => {
    const targets = rec.els || [rec.describedEl || rec.el];
    if (rec.describedEl) targets.push(rec.el);
    rec.errorEl.hidden = !msg;
    rec.errorShown = !!msg;
    if (msg) {
      const prefix = document.createElement('span');
      prefix.className = 'visually-hidden';
      prefix.textContent = 'Error: ';
      rec.errorEl.replaceChildren(createIcon('report'), prefix, msg);
    } else rec.errorEl.replaceChildren();
    targets.forEach((el) => {
      const base = el.dataset.describedby || '';
      const ids = msg ? `${rec.errorEl.id} ${base}`.trim() : base;
      if (ids) el.setAttribute('aria-describedby', ids); else el.removeAttribute('aria-describedby');
      if (msg) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    });
    rec.wrapper?.classList.toggle('has-error', !!msg);
    rec.wrapper?.classList.toggle('is-valid', !msg && !!rec.dirty && !rec.el.readOnly);
    if (rec.foreign) rec.el.closest('td, .line-items-cell')?.classList.toggle('has-error', !!msg);
  };

  /** Validates every field; when `show` is true updates the UI. Returns [{ rec, msg }]. */
  const validateAll = (show) => {
    const errors = [];
    allRecords().forEach((rec) => {
      const msg = rec.validate();
      if (show) showError(rec, msg);
      if (msg) errors.push({ rec, msg });
    });
    (options.validate?.(form) || []).forEach(({ name, message }) => {
      const rec = byName.get(name);
      if (!rec || errors.some((e) => e.rec === rec)) return;
      errors.push({ rec, msg: message });
      if (show) showError(rec, message);
    });
    const node = (r) => r.wrapper || r.el;
    // eslint-disable-next-line no-bitwise
    return errors.sort((a, b) => (node(a.rec).compareDocumentPosition(node(b.rec)) & 2 ? 1 : -1));
  };

  const renderErrorSummary = (errors) => {
    errorSummary.hidden = !errors.length;
    if (!errors.length) { errorSummary.replaceChildren(); return; }
    const h = document.createElement('h3');
    h.append(createIcon('report'), errors.length === 1
      ? 'There is a problem with your submission'
      : `There are ${errors.length} problems with your submission`);
    const ul = document.createElement('ul');
    errors.forEach(({ rec, msg }) => {
      const a = document.createElement('a');
      a.href = `#${rec.focusEl.id}`;
      a.textContent = msg;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        rec.focusEl.scrollIntoView({ block: 'center' });
        rec.focusEl.focus({ preventScroll: true });
      });
      const li = document.createElement('li');
      li.append(a);
      ul.append(li);
    });
    errorSummary.replaceChildren(h, ul);
  };

  /* ---------- live summary ---------- */
  const lineItems = document.querySelector(`.line-items[data-form="${id}"]`);
  const totals = {
    units: Number(lineItems?.dataset.units || 0),
    lines: Number(lineItems?.dataset.lines || 0),
    total: Number(lineItems?.dataset.total || 0),
  };
  let submitted = false;
  let done = false;
  let frame = 0;
  const refresh = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const files = records.reduce((n, r) => n + (r.files?.length || 0), 0);
      form.dataset.files = files;
      summary?.update({
        ...totals, files, ready: !done && !validateAll(false).length, submitted: done,
      });
    });
  };
  if (summary) {
    document.addEventListener('line-items:change', (e) => {
      if (e.detail?.form && e.detail.form !== id) return;
      Object.assign(totals, e.detail);
      refresh();
    });
  }

  /* ---------- interaction ---------- */
  document.addEventListener('focusout', (e) => {
    const rec = recordFor(e.target);
    if (rec && (rec.dirty || submitted)) {
      // radios: wait until focus has left the group
      if (rec.els && rec.els.includes(e.relatedTarget)) return;
      showError(rec, rec.validate());
    }
  });
  document.addEventListener('input', (e) => {
    const rec = recordFor(e.target);
    if (!rec) return;
    rec.dirty = true;
    if (rec.errorShown) showError(rec, rec.validate());
    refresh();
  });
  document.addEventListener('change', (e) => {
    const rec = recordFor(e.target);
    if (!rec) return;
    rec.dirty = true;
    if (rec.errorShown || submitted || rec.files || e.target.type === 'checkbox' || e.target.type === 'radio') {
      showError(rec, rec.validate());
    }
    refresh();
  });

  const setBusy = (busy) => buttons.forEach((b) => {
    if (b.type === 'submit') { b.disabled = busy; b.setAttribute('aria-busy', String(busy)); }
  });

  /** Collects values; items[0][description] style names become arrays of objects. */
  const collect = () => {
    const data = {};
    new FormData(form).forEach((v, k) => {
      if (v instanceof File && !v.name) return;
      const val = v instanceof File ? v.name : v;
      const m = k.match(/^([\w-]+)\[(\d+)\]\[([\w-]+)\]$/);
      if (m) {
        data[m[1]] = data[m[1]] || [];
        data[m[1]][m[2]] = data[m[1]][m[2]] || {};
        data[m[1]][m[2]][m[3]] = val;
      } else if (k in data) data[k] = [].concat(data[k], val);
      else data[k] = val;
    });
    return data;
  };

  const resetForm = () => {
    form.reset();
    records.forEach((r) => { r.reset?.(); r.dirty = false; showError(r, ''); });
    allRecords().forEach((r) => showError(r, ''));
    renderErrorSummary([]);
    submitted = false;
    done = false;
    form.hidden = false;
    form.closest('.section')?.classList.remove('is-submitted');
    setBusy(false);
    refresh();
  };

  const showSuccess = (ref, sent) => {
    const panel = document.createElement('div');
    panel.className = 'form-success';
    panel.tabIndex = -1;
    panel.setAttribute('role', 'status');
    const h = document.createElement('h3');
    h.append(createIcon('check-circle'), sent ? 'Submission received' : 'Demo submission received — no backend is connected');
    const p = document.createElement('p');
    p.append(sent ? 'Thank you. Your reference number is ' : 'Nothing was sent or stored. Your demo reference number is ');
    const strong = document.createElement('strong');
    strong.textContent = ref;
    p.append(strong, '.');
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'button secondary';
    again.textContent = 'Start a new submission';
    again.addEventListener('click', () => {
      panel.remove();
      resetForm();
      form.querySelector('.form-control, .form-check-input, .form-browse')?.focus();
    });
    panel.append(h, p, again);
    form.hidden = true;
    done = true;
    form.closest('.section')?.classList.add('is-submitted');
    form.before(panel);
    setBusy(true);
    refresh();
    panel.focus();
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    submitted = true;
    status.textContent = '';
    form.querySelector('.form-submit-error')?.remove();
    const errors = validateAll(true);
    renderErrorSummary(errors);
    refresh();
    if (errors.length) {
      errorSummary.scrollIntoView({ block: 'start' });
      errorSummary.focus({ preventScroll: true });
      return;
    }
    const data = collect();
    if (options.onSubmit) {
      await options.onSubmit(data, form);
      return;
    }
    if (!options.submitTo) {
      showSuccess(referenceNumber(id), false);
      return;
    }
    setBusy(true);
    try {
      const resp = await fetch(options.submitTo, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
      });
      if (!resp.ok) throw new Error(resp.status);
      showSuccess(referenceNumber(id), true);
    } catch (err) {
      setBusy(false);
      const alert = document.createElement('div');
      alert.className = 'form-submit-error';
      alert.setAttribute('role', 'alert');
      alert.append(createIcon('report'), 'We could not send your submission. Please check your connection and try again.');
      errorSummary.after(alert);
      alert.scrollIntoView({ block: 'center' });
    }
  });

  // plain buttons (e.g. "Save draft") have no backend in this demo
  buttons.filter((b) => b.type === 'button').forEach((b) => b.addEventListener('click', () => {
    status.textContent = 'Demo only: saving drafts is not connected, nothing was stored.';
  }));

  refresh();
  return form;
}

/**
 * Two-column release layout: main column (wrappers up to the form) + sticky summary aside
 * holding the summary panel and the section's later wrappers.
 */
function buildLayout(section, wrapper, form) {
  if (section.querySelector(':scope > .form-sidebar')) return;
  const children = [...section.children];
  const index = children.indexOf(wrapper);
  const main = document.createElement('div');
  main.className = 'form-layout-main';
  main.append(...children.slice(0, index + 1));
  const aside = document.createElement('aside');
  aside.className = 'form-sidebar';
  aside.setAttribute('aria-label', 'Submission summary');
  const summary = form.querySelector('.form-summary');
  if (summary) aside.append(summary);
  aside.append(...children.slice(index + 1));
  section.append(main, aside);
  // only stick when the aside fits in the viewport, so nothing becomes unreachable
  const fit = () => aside.classList.toggle('is-sticky', aside.offsetHeight + 48 < window.innerHeight);
  new ResizeObserver(fit).observe(aside);
  window.addEventListener('resize', fit);
}

/**
 * @param {Element} block form block: row 1 = link to definition, optional "Submit To | url" row
 */
export default async function decorate(block) {
  const link = block.querySelector('a[href*=".json"]') || block.querySelector('a');
  const src = link?.href || block.textContent.trim();
  let submitTo;
  [...block.children].forEach((row) => {
    const [key, value] = row.children;
    if (key && value && /^submit\s*to$/i.test(key.textContent.trim())) {
      submitTo = value.querySelector('a')?.href || value.textContent.trim();
    }
  });
  block.replaceChildren();
  try {
    const form = await createForm(src, { submitTo });
    block.append(form);
    const section = block.closest('.section');
    const wrapper = block.parentElement;
    if (section?.classList.contains('form-layout') && section.parentElement?.tagName === 'MAIN') {
      buildLayout(section, wrapper, form);
    }
    // split sections: the heading that introduces the form becomes the card title
    const prev = wrapper.previousElementSibling;
    if (section?.classList.contains('split') && prev?.classList.contains('default-content-wrapper')
      && /^H[2-4]$/.test(prev.lastElementChild?.tagName)) {
      const title = prev.lastElementChild;
      title.classList.add('form-title');
      block.prepend(title);
    }
  } catch (e) {
    const p = document.createElement('p');
    p.className = 'form-unavailable';
    p.textContent = 'This form is temporarily unavailable. Please try again later.';
    block.append(p);
  }
}
