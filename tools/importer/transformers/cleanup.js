/* eslint-disable */
/* global WebImporter */
/**
 * Transformer: cleanup — removes design chrome that is not page content.
 * Site header/footer are authored as per-site nav/footer fragments, so they are dropped
 * here (except for the fragment template). Console sidebars, scripts, dismiss buttons and
 * decorative overlays are removed; template.remove lists page-specific selectors.
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const { template } = payload;
  const doc = element.ownerDocument;
  if (!template.fragment) {
    doc.querySelectorAll('body > header, body > aside, body > div > aside, body > footer, main footer, body > div > header, main > header')
      .forEach((n) => n.remove());
  }
  (template.remove || []).forEach((sel) => doc.querySelectorAll(sel).forEach((n) => n.remove()));
  doc.querySelectorAll('script, style, noscript, link, [aria-label="Dismiss alert"], .animate-ping').forEach((n) => n.remove());
  doc.querySelectorAll('[class*="bg-gradient-to"]').forEach((n) => {
    if (!n.textContent.trim() && !n.querySelector('img')) n.remove();
  });
}
