/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-loop-func, max-len, import/no-extraneous-dependencies -- Node CLI script */
/**
 * Validates the Block Inspector `fields` metadata of the DA block library samples with the
 * extension's own parser (adobe-rnd/ew-extensions tools/block-editor, loaded from jsDelivr):
 * parseVariants → getBlockFieldTemplate → buildBlockFieldDefinitions → resolveBlockFields.
 *
 * Usage: node tools/library/validate-fields.mjs [dir]
 *   dir  folder of <block>.plain.html files (default content/library/blocks); point it at copies
 *        exported from DA to validate exactly what the editor reads.
 * Exit code 1 when any variant fails. Requires: npm i --no-save playwright && npx playwright install chromium
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
// eslint-disable-next-line import/no-unresolved
import { chromium } from 'playwright';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = process.argv[2] || join(ROOT, 'content/library/blocks');
const INDEX = JSON.parse(readFileSync(join(ROOT, 'content/library/blocks.json'), 'utf8'));
const sheet = (name) => (INDEX[':type'] === 'multi-sheet' ? INDEX[name]?.data : name === 'data' && INDEX.data) || [];
const BLOCKS = sheet('data').map((row) => row.path.split('/').pop());
const MULTI = sheet('editor').filter((row) => row.property === 'multi').map((row) => row.block);
const CDN = 'https://cdn.jsdelivr.net/gh/adobe-rnd/ew-extensions@main/tools/block-editor';

/** Runs in the page: validates every variant section of one sample. */
async function validate({
  name, html, multi, cdn,
}) {
  const lib = await import(`${cdn}/library.js`);
  const { describeBlock } = await import(`${cdn}/document.js`);
  const fields = await import(`${cdn}/fields.js`);
  const items = lib.parseVariants(`<main>${html}</main>`, `https://example.com/library/blocks/${name}`);
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const variants = [...doc.body.children].map((s) => [...s.children]
    .find((e) => e.tagName === 'DIV' && !e.classList.contains('library-metadata'))
    .className.split(/\s+/).slice(1).join(','));
  const out = [];
  for (const variant of variants) {
    try {
      const matched = await lib.getBlockFieldTemplate(
        [{ path: `/library/blocks/${name}`, loadVariants: Promise.resolve(items) }],
        name,
        variant,
        { describeBlock: async (args) => describeBlock(args) },
      );
      const resolved = fields.resolveBlockFields(matched.template, fields.buildBlockFieldDefinitions(matched, { multi }));
      const errors = resolved.filter((f) => f.error);
      out.push({
        variant, ok: !errors.length, count: resolved.length, readOnly: resolved.filter((f) => f.readOnly).length, error: errors[0]?.error,
      });
    } catch (e) {
      out.push({ variant, ok: false, error: e.message });
    }
  }
  return out;
}

const browser = await chromium.launch();
const page = await browser.newPage();
let failures = 0;
try {
  await page.goto(`${CDN}/README.md`); // any https origin, so the CDN modules load
  for (const name of BLOCKS) {
    const results = await page.evaluate(validate, {
      name, html: readFileSync(join(DIR, `${name}.plain.html`), 'utf8'), multi: MULTI.includes(name), cdn: CDN,
    });
    results.forEach((r) => {
      if (!r.ok) failures += 1;
      const label = r.variant ? `${name} (${r.variant})` : name;
      const detail = r.ok ? `${r.count} fields${r.readOnly ? `, ${r.readOnly} read-only` : ''}` : r.error;
      console.log(`${r.ok ? '✓' : '✗'} ${label}: ${detail}`);
    });
  }
} finally {
  await browser.close();
}
console.log(failures ? `${failures} variant(s) failed` : 'all variants valid');
process.exitCode = failures ? 1 : 0;
