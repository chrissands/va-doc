/* eslint-disable */
/* global WebImporter */
/**
 * Transformer: metadata — appends the page Metadata block (title, description, theme…)
 * from the template definition. `{sku}` placeholders are filled from the source URL.
 * Theme drives the per-site styling (header colour, accent, logo).
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'afterTransform') return;
  const { template, params } = payload;
  if (!template.metadata) return;
  const doc = element.ownerDocument;
  let sku = '';
  try { sku = new URL(params?.originalURL).searchParams.get('sku') || ''; } catch (e) { /* no url */ }
  const meta = {};
  const name = (template.names && template.names[sku]) || sku;
  Object.entries(template.metadata).forEach(([k, v]) => {
    meta[k] = String(v).replace(/\{sku\}/g, sku).replace(/\{name\}/g, name);
  });
  // metadata lives in its own section
  doc.body.append(doc.createElement('hr'), WebImporter.Blocks.getMetadataBlock(doc, meta));
}
