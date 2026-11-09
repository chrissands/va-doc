/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-loop-func, max-len, import/no-extraneous-dependencies -- Node CLI script */
/**
 * Adds Block Inspector `fields` metadata to every variant section of the DA block library
 * samples (content/library/blocks/<block>.plain.html), replacing any existing `fields` row.
 *
 * Field counting mirrors ew-extensions block-editor/document.js contentFields(): a cell's element
 * children (blockquote children expanded), or the cell itself when it has no element children.
 * Repeating blocks (the `editor` tab of content/library/blocks.json, property `multi`) describe
 * only their first item. Key/value rows hide the key cell with IGNORE.
 *
 * Usage: node tools/library/generate-fields.mjs [--da-dir <dir>]
 *   --da-dir  folder of <block>.plain.html copies exported from DA; cell shapes are compared
 *             with the local samples and any mismatch is reported.
 * Requires: npm i --no-save playwright && npx playwright install chromium
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
// eslint-disable-next-line import/no-unresolved
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const LIB = join(ROOT, 'content/library/blocks');
const INDEX = JSON.parse(readFileSync(join(ROOT, 'content/library/blocks.json'), 'utf8'));
const sheet = (name) => (INDEX[':type'] === 'multi-sheet' ? INDEX[name]?.data : name === 'data' && INDEX.data) || [];
const BLOCKS = sheet('data').map((row) => row.path.split('/').pop());
const MULTI = sheet('editor').filter((row) => row.property === 'multi').map((row) => row.block);
const KEY_VALUE = ['product-grid', 'product-detail', 'line-items'];
const daArg = process.argv.indexOf('--da-dir');
const DA_DIR = daArg > -1 ? process.argv[daArg + 1] : null;

/** Runs in the page: returns the updated sample HTML and a per-variant report. */
function addFields({
  name, local, da, multiBlocks, keyValue,
}) {
  const parse = (h) => new DOMParser().parseFromString(`<body>${h}</body>`, 'text/html').body;
  const contentFields = (c) => (c.children.length
    ? [...c.children].flatMap((e) => (e.tagName === 'BLOCKQUOTE' ? [...e.children] : [e])) : [c]);
  const sections = (body) => [...(body.querySelector('main') || body).children].filter((s) => s.tagName === 'DIV');
  const blockOf = (s) => [...s.children].find((e) => e.tagName === 'DIV' && !e.classList.contains('library-metadata'));
  const shape = (blk) => [...blk.children].map((r) => [...r.children].map((c) => contentFields(c).length));
  const uniq = (labels) => {
    const n = {};
    labels.forEach((l) => { if (l !== 'IGNORE') n[l] = (n[l] || 0) + 1; });
    const k = {};
    return labels.map((l) => {
      if (l === 'IGNORE' || n[l] === 1) return l;
      k[l] = (k[l] || 0) + 1;
      return `${l} ${k[l]}`;
    });
  };
  const label = (el, ctx) => {
    const t = el.textContent.trim();
    const only = (sel) => el.children.length === 1 && el.firstElementChild.matches(sel)
      && t === el.firstElementChild.textContent.trim();
    if (el.matches('picture, img') || el.querySelector('picture, img')) return 'Image';
    if (/^h1$/i.test(el.tagName)) { ctx.seenHeading += 1; return 'Title'; }
    if (el.tagName === 'A') return 'Link';
    if (/^h[2-6]$/i.test(el.tagName)) { ctx.seenHeading += 1; return ctx.seenHeading > 1 ? 'Subheading' : 'Heading'; }
    if (el.matches('ul, ol')) return 'List';
    if (el.parentElement?.tagName === 'BLOCKQUOTE') return 'Quote';
    if (/^:[a-z0-9-]+:$/.test(t)) return 'Icon';
    if (el.querySelector('table')) return 'IGNORE';
    if (only('strong, em') && el.querySelector('a')) return 'Button';
    if (only('a')) return 'Link';
    if (!ctx.seenHeading && ctx.hasHeading) { ctx.eyebrows += 1; return ctx.eyebrows > 1 ? 'Tag' : 'Eyebrow'; }
    ctx.texts += 1;
    return ctx.texts > 1 ? 'Text' : 'Description';
  };
  const cellLabels = (cell, rowIdx, cellIdx, row, header) => {
    const fields = contentFields(cell);
    const cells = [...row.children];
    if (keyValue.includes(name) && cells.length === 2) {
      if (cellIdx === 0) return fields.map(() => 'IGNORE');
      if (fields.length === 1) return [cells[0].textContent.trim()];
    }
    if (name === 'cards' && row.closest('.stats')) return ['Value', 'Label', 'Caption'].slice(0, fields.length);
    if (name === 'carousel' && cellIdx === 1) return fields.map((f, i) => ['Quote', 'Name', 'Role', 'Stats'][i] || `Text ${i}`);
    if (name === 'alert') {
      return uniq(fields.map((f, i) => {
        if (i === 0) return 'Message';
        const a = f.querySelector('a');
        return a && a.textContent.trim() === f.textContent.trim() ? 'Link' : 'Detail';
      }));
    }
    if ((name === 'form' || (name === 'locator-search' && rowIdx === 1)) && fields.length === 1) return ['Form definition'];
    if (name === 'table' && header) {
      const h = header[cellIdx] || `Column ${cellIdx + 1}`;
      if (rowIdx === 0) return fields.map(() => `Heading: ${h}`);
      return fields.length === 1 ? [h] : fields.map((f, i) => (i === 0 ? `${h} (title)` : `${h} (detail)`));
    }
    if (name === 'document-list') {
      return fields.map(() => ['Group (tab)', 'Title', 'Description', 'Details', 'Download link', 'Badge'][cellIdx] || `Column ${cellIdx + 1}`);
    }
    if (name === 'family-of-sites') {
      if (rowIdx === 0) return fields.map(() => 'Title');
      return fields.map(() => (cellIdx === 0 ? 'Site link' : 'Site description'));
    }
    if (['accordion', 'tabs'].includes(name) && cellIdx === 0) return fields.map(() => (name === 'tabs' ? 'Tab label' : 'Panel label'));
    const ctx = {
      seenHeading: 0, hasHeading: fields.some((f) => /^H[1-6]$/.test(f.tagName)), eyebrows: 0, texts: 0,
    };
    return uniq(fields.map((f) => label(f, ctx)));
  };

  const body = parse(local);
  const daSections = da ? sections(parse(da)) : [];
  const report = sections(body).map((section, si) => {
    const blk = blockOf(section);
    const meta = section.querySelector(':scope > .library-metadata');
    const daBlk = daSections[si] && blockOf(daSections[si]);
    const rows = multiBlocks.includes(name) ? [...blk.children].slice(0, 1) : [...blk.children];
    const header = name === 'table' ? [...blk.children[0].children].map((c) => c.textContent.trim()) : null;
    const cols = Math.max(...rows.map((r) => r.children.length));
    const table = document.createElement('table');
    const headCell = table.insertRow().insertCell();
    headCell.textContent = 'Fields';
    if (cols > 1) headCell.colSpan = cols;
    rows.forEach((row, ri) => {
      const tr = table.insertRow();
      [...row.children].forEach((cell, ci) => {
        const td = tr.insertCell();
        cellLabels(cell, ri, ci, row, header).forEach((l) => {
          const p = document.createElement('p');
          p.textContent = l;
          td.append(p);
        });
      });
    });
    [...meta.children].forEach((r) => { if (r.firstElementChild?.textContent.trim().toLowerCase() === 'fields') r.remove(); });
    const metaRow = document.createElement('div');
    const key = document.createElement('div');
    key.textContent = 'fields';
    const value = document.createElement('div');
    value.append(table);
    metaRow.append(key, value);
    meta.append(metaRow);
    return {
      variant: blk.className,
      daMatch: daBlk ? JSON.stringify(shape(blk)) === JSON.stringify(shape(daBlk)) : null,
    };
  });
  return { html: body.innerHTML, report };
}

const browser = await chromium.launch();
const page = await browser.newPage();
try {
  for (const name of BLOCKS) {
    const file = join(LIB, `${name}.plain.html`);
    const daFile = DA_DIR && join(DA_DIR, `${name}.plain.html`);
    const { html, report } = await page.evaluate(addFields, {
      name,
      local: readFileSync(file, 'utf8'),
      da: daFile && existsSync(daFile) ? readFileSync(daFile, 'utf8') : null,
      multiBlocks: MULTI,
      keyValue: KEY_VALUE,
    });
    writeFileSync(file, `${html.trim()}\n`);
    const mismatches = report.filter((r) => r.daMatch === false).map((r) => r.variant);
    console.log(`${name.padEnd(16)} ${report.length} variant(s)${mismatches.length ? ` ⚠️ shape differs from DA: ${mismatches.join(', ')}` : ''}`);
  }
} finally {
  await browser.close();
}
