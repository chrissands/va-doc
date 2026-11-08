/**
 * Field builders for the form block. Each builder turns one normalized definition row into
 * DOM and returns a field record that form.js uses for validation and data collection:
 * { fd, el, wrapper, focusEl, errorEl, validate() } (validate returns '' or a message).
 */
import { createIcon } from '../../scripts/scripts.js';

const truthy = (v) => /^(true|x|yes)$/i.test(String(v || '').trim());

/** Autocomplete tokens by field name (WCAG 1.3.5), best effort. */
const AUTOCOMPLETE = [
  [/first-name|given/, 'given-name'], [/last-name|family/, 'family-name'], [/full-name|^name$/, 'name'],
  [/email/, 'email'], [/phone|tel/, 'tel'], [/street|address/, 'street-address'],
  [/city/, 'address-level2'], [/zip|postal/, 'postal-code'], [/org|firm|company/, 'organization'],
  [/title|role/, 'organization-title'],
];

/** Friendly messages for well-known patterns, checked in order. */
const PATTERN_MESSAGES = [
  [(fd) => /virginia\\?\.gov/.test(fd.pattern), 'Enter an official Commonwealth email address ending in virginia.gov, for example name@agency.virginia.gov.'],
  [(fd) => /^\^?\[0-9\]\{3\}/.test(fd.pattern), 'Start with your 3-digit Commonwealth agency number, for example 147 - Department of General Services.'],
  [(fd) => /\[0-9\]\{5\}\$?$/.test(fd.pattern), 'Enter a 5-digit ZIP code, for example 23219.'],
  [(fd) => /\[0-9\]\{7\}/.test(fd.pattern), 'Enter the 7-digit State ID using numbers only, for example 1498201.'],
  [(fd) => fd.type === 'tel', 'Enter a phone number including area code, for example (804) 555-0100.'],
];

const PHONETIC = {
  A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot', G: 'Golf', H: 'Hotel', J: 'Juliett', K: 'Kilo', L: 'Lima', M: 'Mike', N: 'November', P: 'Papa', Q: 'Quebec', R: 'Romeo', S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray', Y: 'Yankee', Z: 'Zulu',
};

/**
 * Normalizes a sheet row (Name, Type, Label…) into a field definition.
 * @param {Object} row sheet row
 * @param {string} formId id of the form (prefix for element ids)
 */
export function normalizeRow(row, formId) {
  const get = (k) => String(row[k] ?? row[k.toLowerCase()] ?? '').trim();
  const name = get('Name') || `field-${Math.random().toString(36).slice(2, 7)}`;
  return {
    name,
    id: `${formId}-${name}`.toLowerCase().replace(/[^a-z0-9-_]+/g, '-'),
    type: (get('Type') || 'text').toLowerCase(),
    label: get('Label') || name,
    placeholder: get('Placeholder'),
    value: get('Value'),
    options: get('Options').split(',').map((o) => o.trim()).filter(Boolean),
    required: truthy(get('Mandatory')),
    style: get('Style').toLowerCase(),
    fieldset: get('Fieldset'),
    description: get('Description'),
    pattern: get('Pattern'),
    accept: get('Accept'),
    multiple: truthy(get('Multiple')),
    max: parseFloat(get('Max')) || 0,
    readOnly: truthy(get('ReadOnly')),
  };
}

/** Human file size, e.g. 1.4 MB / 680 KB. */
export const formatSize = (bytes) => (bytes >= 1048576
  ? `${(bytes / 1048576).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Label content: text + "*" marker with visually-hidden "(required)". */
function labelContent(el, fd) {
  el.append(document.createTextNode(fd.label));
  if (fd.required) {
    const star = document.createElement('span');
    star.className = 'form-required';
    star.setAttribute('aria-hidden', 'true');
    star.textContent = ' *';
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = ' (required)';
    el.append(star, sr);
  }
  const ok = createIcon('check-circle');
  ok.classList.add('form-valid-icon');
  el.append(ok);
  return el;
}

function createLabel(fd, forId = fd.id) {
  const label = document.createElement('label');
  label.htmlFor = forId;
  label.id = `${fd.id}-label`;
  label.className = 'form-label';
  return labelContent(label, fd);
}

function createHint(fd) {
  if (!fd.description) return null;
  const hint = document.createElement('p');
  hint.className = 'form-hint';
  hint.id = `${fd.id}-hint`;
  hint.textContent = fd.description;
  return hint;
}

function createError(fd) {
  const error = document.createElement('p');
  error.className = 'form-error';
  error.id = `${fd.id}-error`;
  error.hidden = true;
  return error;
}

function createWrapper(fd, tag = 'div') {
  const wrapper = document.createElement(tag);
  wrapper.className = `form-field ${fd.type}-wrapper`;
  if (fd.style) wrapper.classList.add(`form-${fd.style}`);
  wrapper.dataset.name = fd.name;
  return wrapper;
}

/** Sets aria-describedby (hint) and remembers it so form.js can add/remove the error id. */
function describe(el, ...ids) {
  const list = ids.filter(Boolean).join(' ');
  el.dataset.describedby = list;
  if (list) el.setAttribute('aria-describedby', list);
}

/** Today's date as yyyy-mm-dd in local time. */
function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Validation for single controls (required, type and pattern). */
function controlValidator(fd, el) {
  return () => {
    const value = (el.value || '').trim();
    if (el.type === 'checkbox') return fd.required && !el.checked ? 'Check this box to confirm before continuing.' : '';
    if (!value) return fd.required ? `${fd.label} is required.` : '';
    if (el.validity.typeMismatch && el.type === 'email') return 'Enter an email address in the format name@example.com.';
    if (fd.pattern) {
      let re;
      try { re = new RegExp(fd.pattern); } catch (e) { re = null; }
      if (re && !re.test(value)) {
        const known = PATTERN_MESSAGES.find(([test]) => test(fd));
        return known ? known[1] : `Check the format of ${fd.label}.`;
      }
    } else if (fd.type === 'tel' && value.replace(/\D/g, '').length < 10) {
      return PATTERN_MESSAGES.at(-1)[1];
    }
    return '';
  };
}

/** text, email, tel, date, number, textarea, select. */
function buildControl(fd) {
  const wrapper = createWrapper(fd);
  let el;
  if (fd.type === 'textarea') {
    el = document.createElement('textarea');
    el.rows = 5;
  } else if (fd.type === 'select') {
    el = document.createElement('select');
    if (fd.placeholder || !fd.value) el.append(new Option(fd.placeholder || 'Select an option', ''));
    fd.options.forEach((o) => el.append(new Option(o, o, false, o === fd.value)));
  } else {
    el = document.createElement('input');
    el.type = ['email', 'tel', 'date', 'number', 'password', 'url'].includes(fd.type) ? fd.type : 'text';
    if (/^\^?\[0-9\]\{\d+\}\$?$/.test(fd.pattern)) el.inputMode = 'numeric';
  }
  el.id = fd.id;
  el.name = fd.name;
  el.className = 'form-control';
  if (fd.required) el.required = true;
  if (fd.placeholder && fd.type !== 'select') el.placeholder = fd.placeholder;
  if (fd.type !== 'select') el.value = fd.type === 'date' && fd.value === 'today' ? today() : fd.value;
  if (fd.type !== 'select') el.defaultValue = el.value;
  if (fd.readOnly) el.readOnly = true;
  if (fd.pattern) el.dataset.pattern = fd.pattern;
  const ac = AUTOCOMPLETE.find(([re]) => re.test(fd.name));
  if (ac && fd.type !== 'select' && fd.type !== 'textarea') [, el.autocomplete] = ac;
  const hint = createHint(fd);
  const errorEl = createError(fd);
  describe(el, hint?.id);
  wrapper.append(createLabel(fd));
  if (hint) wrapper.append(hint);
  wrapper.append(errorEl, el);
  return {
    fd, el, wrapper, focusEl: el, errorEl, validate: controlValidator(fd, el),
  };
}

function buildCheckbox(fd) {
  const wrapper = createWrapper(fd);
  const el = document.createElement('input');
  el.type = 'checkbox';
  el.id = fd.id;
  el.name = fd.name;
  el.value = fd.value || 'yes';
  el.className = 'form-check-input';
  if (fd.required) el.required = true;
  const hint = createHint(fd);
  const errorEl = createError(fd);
  describe(el, hint?.id);
  const row = document.createElement('div');
  row.className = 'form-check';
  row.append(el, createLabel(fd));
  wrapper.append(errorEl, row);
  if (hint) wrapper.append(hint);
  return {
    fd, el, wrapper, focusEl: el, errorEl, validate: controlValidator(fd, el),
  };
}

function buildRadio(fd) {
  const wrapper = createWrapper(fd, 'fieldset');
  const legend = labelContent(document.createElement('legend'), fd);
  legend.className = 'form-label';
  const hint = createHint(fd);
  const errorEl = createError(fd);
  const group = document.createElement('div');
  group.className = 'form-radios';
  const radios = fd.options.map((o, i) => {
    const r = document.createElement('input');
    r.type = 'radio';
    r.name = fd.name;
    r.value = o;
    r.id = `${fd.id}-${i}`;
    r.className = 'form-check-input';
    r.checked = o === fd.value;
    if (fd.required) r.required = true;
    describe(r, hint?.id);
    const label = document.createElement('label');
    label.htmlFor = r.id;
    label.textContent = o;
    const item = document.createElement('div');
    item.className = 'form-check';
    item.append(r, label);
    group.append(item);
    return r;
  });
  wrapper.append(legend);
  if (hint) wrapper.append(hint);
  wrapper.append(errorEl, group);
  return {
    fd,
    el: radios[0],
    els: radios,
    wrapper,
    focusEl: radios[0],
    errorEl,
    validate: () => (fd.required && !radios.some((r) => r.checked) ? `Select an answer for “${fd.label}”` : ''),
  };
}

const fileIcon = (file) => {
  if (/pdf$/i.test(file.name)) return 'picture-as-pdf';
  if (/^image\//.test(file.type) || /\.(png|jpe?g|gif|webp)$/i.test(file.name)) return 'image';
  return 'description';
};

/** Drag-and-drop zone + Browse button driving a real input[type=file]. */
function buildFile(fd) {
  const wrapper = createWrapper(fd);
  const record = {
    fd, wrapper, files: [], errorEl: createError(fd),
  };
  const input = document.createElement('input');
  input.type = 'file';
  input.id = fd.id;
  input.name = fd.name;
  input.className = 'visually-hidden';
  input.tabIndex = -1;
  if (fd.accept) input.accept = fd.accept;
  if (fd.multiple) input.multiple = true;
  const hint = createHint(fd);

  const zone = document.createElement('div');
  zone.className = 'form-dropzone';
  const zoneIcon = document.createElement('span');
  zoneIcon.className = 'form-dropzone-icon';
  zoneIcon.append(createIcon('upload-file'));
  const prompt = document.createElement('p');
  prompt.className = 'form-dropzone-prompt';
  prompt.textContent = 'Drag and drop files here, or ';
  const browse = document.createElement('button');
  browse.type = 'button';
  browse.className = 'form-browse';
  browse.textContent = 'Browse Files';
  browse.id = `${fd.id}-browse`;
  describe(browse, `${fd.id}-label`, hint?.id);
  prompt.append(browse);
  zone.append(zoneIcon, prompt);
  if (hint) zone.append(hint);

  const status = document.createElement('p');
  status.className = 'form-file-status';
  status.setAttribute('aria-live', 'polite');
  const list = document.createElement('ul');
  list.className = 'form-file-list';
  list.setAttribute('aria-label', 'Attached files');

  const accepted = fd.accept.split(',').map((a) => a.trim().toLowerCase()).filter(Boolean);
  const isAccepted = (file) => !accepted.length || accepted.some((a) => (a.startsWith('.')
    ? file.name.toLowerCase().endsWith(a)
    : new RegExp(`^${a.replace('*', '.*')}$`).test(file.type)));
  const maxBytes = fd.max * 1048576;
  const total = () => record.files.reduce((s, f) => s + f.size, 0);

  /** Keeps the real input's FileList in sync so FormData carries the files. */
  const sync = () => {
    try {
      const dt = new DataTransfer();
      record.files.forEach((f) => dt.items.add(f));
      input.files = dt.files;
    } catch (e) { /* DataTransfer unsupported: list still tracked in record.files */ }
  };

  const render = () => {
    list.replaceChildren(...record.files.map((file, i) => {
      const li = document.createElement('li');
      const name = document.createElement('span');
      name.className = 'form-file-name';
      name.textContent = file.name;
      const size = document.createElement('span');
      size.className = 'form-file-size';
      size.textContent = `(${formatSize(file.size)}) – Attached`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'form-file-remove';
      remove.setAttribute('aria-label', `Remove ${file.name}`);
      remove.append(createIcon('close'));
      remove.addEventListener('click', () => {
        record.files.splice(i, 1);
        sync();
        render();
        status.textContent = `${file.name} removed. ${record.files.length} file(s) attached.`;
        const next = list.querySelectorAll('.form-file-remove')[Math.min(i, record.files.length - 1)];
        (next || browse).focus();
        wrapper.dispatchEvent(new Event('change', { bubbles: true }));
      });
      li.append(createIcon(fileIcon(file)), name, size, remove);
      return li;
    }));
    list.hidden = !record.files.length;
  };

  const add = (fileList) => {
    const messages = [];
    [...fileList].forEach((file) => {
      if (!isAccepted(file)) {
        messages.push(`${file.name} was not added: accepted formats are ${fd.accept.replace(/,/g, ', ')}.`);
      } else if (maxBytes && total() + file.size > maxBytes) {
        messages.push(`${file.name} was not added: the combined size of attachments must be ${fd.max} MB or less.`);
      } else if (!record.files.some((f) => f.name === file.name && f.size === file.size)) {
        if (!fd.multiple) record.files = [];
        record.files.push(file);
        messages.push(`${file.name} attached.`);
      }
    });
    sync();
    render();
    status.textContent = messages.join(' ');
    status.classList.toggle('has-error', messages.some((m) => m.includes('not added')));
    wrapper.dispatchEvent(new Event('change', { bubbles: true }));
  };

  browse.addEventListener('click', () => input.click());
  zone.addEventListener('click', (e) => { if (e.target === zone || e.target.closest('.form-dropzone-icon')) input.click(); });
  input.addEventListener('change', (e) => {
    e.stopPropagation();
    if (input.files.length) add(input.files);
    else sync();
  });
  ['dragenter', 'dragover'].forEach((t) => zone.addEventListener(t, (e) => {
    e.preventDefault();
    zone.classList.add('is-dragover');
  }));
  ['dragleave', 'drop'].forEach((t) => zone.addEventListener(t, () => zone.classList.remove('is-dragover')));
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    if (e.dataTransfer?.files?.length) add(e.dataTransfer.files);
  });

  const label = createLabel(fd);
  label.classList.add('visually-hidden');
  wrapper.append(label, record.errorEl, input, zone, status, list);
  render();
  return Object.assign(record, {
    el: input,
    focusEl: browse,
    describedEl: browse,
    reset: () => { record.files = []; sync(); render(); status.textContent = ''; },
    validate: () => (fd.required && !record.files.length ? 'Attach at least one supporting document.' : ''),
  });
}

/** Demo CAPTCHA placeholder: random code + spelled-out text + refresh + input. */
function buildCaptcha(fd) {
  const wrapper = createWrapper(fd);
  const box = document.createElement('div');
  box.className = 'form-captcha';
  const codeBox = document.createElement('div');
  codeBox.className = 'form-captcha-box';
  const visual = document.createElement('span');
  visual.className = 'form-captcha-code';
  visual.setAttribute('aria-hidden', 'true');
  const spoken = document.createElement('span');
  spoken.className = 'visually-hidden';
  spoken.setAttribute('aria-live', 'polite');
  codeBox.append(visual, spoken);
  const refresh = document.createElement('button');
  refresh.type = 'button';
  refresh.className = 'form-captcha-refresh';
  refresh.setAttribute('aria-label', 'Get a new code');
  refresh.append(createIcon('refresh'));

  const entry = document.createElement('div');
  entry.className = 'form-captcha-entry';
  const el = document.createElement('input');
  el.type = 'text';
  el.id = fd.id;
  el.name = fd.name;
  el.className = 'form-control';
  el.maxLength = 5;
  el.autocomplete = 'off';
  el.spellcheck = false;
  el.setAttribute('autocapitalize', 'characters');
  if (fd.required) el.required = true;
  const hint = createHint(fd);
  const errorEl = createError(fd);
  describe(el, hint?.id);
  entry.append(createLabel(fd), el);

  const record = {
    fd, el, wrapper, focusEl: el, errorEl, code: '',
  };
  const generate = (announce) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const values = crypto.getRandomValues(new Uint32Array(5));
    record.code = [...values].map((v) => chars[v % chars.length]).join('');
    visual.textContent = record.code.split('').join(' ');
    const words = record.code.split('').map((c) => (PHONETIC[c] ? `${c} as in ${PHONETIC[c]}` : c));
    spoken.textContent = `${announce ? 'New verification code' : 'Verification code'}: ${words.join(', ')}.`;
  };
  generate(false);
  refresh.addEventListener('click', () => { generate(true); el.value = ''; });

  box.append(codeBox, refresh, entry);
  wrapper.append(box, errorEl);
  if (hint) wrapper.append(hint);
  return Object.assign(record, {
    reset: () => generate(false),
    validate: () => {
      const v = el.value.trim();
      if (!v) return fd.required ? 'Enter the verification code shown.' : '';
      return v.toUpperCase() === record.code ? '' : 'The verification code does not match. Enter the 5 characters shown, or get a new code.';
    },
  });
}

function buildPlaintext(fd) {
  const wrapper = createWrapper(fd);
  if (fd.style === 'divider') {
    wrapper.classList.add('form-divider');
    const span = document.createElement('span');
    span.textContent = fd.label;
    wrapper.append(span);
    return { fd, wrapper };
  }
  const p = document.createElement('p');
  if (fd.style === 'alert') {
    wrapper.classList.add('form-alert');
    wrapper.append(createIcon('warning'));
    // "Mandatory Rule: …" → bold lead-in
    const m = fd.label.match(/^([^:]{2,40}):\s*(.*)$/s);
    if (m) {
      const strong = document.createElement('strong');
      strong.textContent = `${m[1]}: `;
      p.append(strong, m[2]);
    } else p.textContent = fd.label;
  } else p.textContent = fd.label;
  wrapper.append(p);
  return { fd, wrapper };
}

function buildHeading(fd) {
  const wrapper = createWrapper(fd);
  const h = document.createElement('h3');
  h.id = fd.id;
  h.textContent = fd.label;
  wrapper.append(h);
  const hint = createHint(fd);
  if (hint) wrapper.append(hint);
  return { fd, wrapper };
}

/** submit / button rows. */
export function buildButton(fd, formId) {
  const button = document.createElement('button');
  button.type = fd.type === 'submit' ? 'submit' : 'button';
  button.name = fd.name;
  button.setAttribute('form', formId);
  if (fd.style === 'link') {
    button.className = 'form-link-button';
    button.append(createIcon('save'));
  } else {
    button.className = fd.type === 'submit' ? 'button accent' : 'button secondary';
    if (fd.type === 'submit') button.append(createIcon('send'));
  }
  if (fd.style === 'full') button.classList.add('form-full');
  const text = document.createElement('span');
  text.textContent = fd.label;
  button.append(text);
  return button;
}

const BUILDERS = {
  checkbox: buildCheckbox,
  radio: buildRadio,
  file: buildFile,
  captcha: buildCaptcha,
  plaintext: buildPlaintext,
  heading: buildHeading,
};

/**
 * Builds the field record for a definition row (unknown types render as text inputs).
 * @param {Object} fd normalized definition
 */
export function createField(fd) {
  const builder = BUILDERS[fd.type] || buildControl;
  return builder(fd);
}
