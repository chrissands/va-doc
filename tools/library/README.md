# Block library tooling

Scripts for the DA block library (`content/library/`). The `Blocks` panel and the Block Inspector
extension read it. Run them from the repo root.

## Block Inspector field definitions

The [Block Inspector](https://github.com/adobe-rnd/ew-extensions/blob/main/tools/block-editor/README.md)
labels a block's editable fields from a `fields` table in each variant's Library Metadata.

```bash
npm i --no-save playwright && npx playwright install chromium   # one-time

node tools/library/generate-fields.mjs                # add/refresh fields tables in content/library/blocks/*.plain.html
node tools/library/validate-fields.mjs                # check them with the extension's own parser
node tools/library/validate-fields.mjs <dir>          # …or check copies exported from DA
```

- **Field counting:** it follows the extension's own rule. A cell's fields are its child elements, with blockquotes expanded to their inner paragraphs. A cell without child elements counts as one field.
- **Repeating blocks:** blocks listed with `property: multi` in the `editor` tab of `content/library/blocks.json` describe only their first item. These are cards, carousel, accordion, tabs and document-list.
- **Key/value rows:** the settings blocks (product-grid, product-detail, line-items) hide the key cell with `IGNORE` and label the value with the key.
- **Dropdowns:** the `options` tab of `content/library/blocks.json` provides the dropdowns, for example the 16 catalog SKUs for product-detail.

After regenerating, upload the changed `library/blocks/*` pages and `library/blocks.json` to DA. Then validate the copies stored in DA, which is what the editor actually reads.
