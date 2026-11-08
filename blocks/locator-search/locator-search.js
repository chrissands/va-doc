/**
 * Locator search: a self-contained search card (intro, form from a sheet definition, footnote).
 * Rows: 1 intro (eyebrow p, h2, p) · 2 link to the form definition · 3 footnote (optional).
 * Demo only: submitting shows a "not connected" results panel echoing the criteria.
 */
import { loadCSS } from '../../scripts/aem.js';
import { createIcon } from '../../scripts/scripts.js';
import { createForm } from '../form/form.js';

/** Either a first + last name, or a 7-digit ID (format checked by the field pattern). */
function validateCriteria(form) {
  const value = (n) => (form.elements[n]?.value || '').trim();
  const first = value('first-name');
  const last = value('last-name');
  if (value('state-id') || (first && last)) return [];
  if (!first && !last) {
    return [{ name: 'first-name', message: 'Enter a first and last name, or a 7-digit State ID.' }];
  }
  return first
    ? [{ name: 'last-name', message: 'Enter a last name too, or search by 7-digit State ID instead.' }]
    : [{ name: 'first-name', message: 'Enter a first name too, or search by 7-digit State ID instead.' }];
}

/**
 * @param {Element} block locator-search block
 */
export default async function decorate(block) {
  const [introRow, formRow, footRow] = [...block.children].map((r) => r.firstElementChild);
  const cssLoaded = loadCSS(`${window.hlx.codeBasePath}/blocks/form/form.css`);

  const head = document.createElement('div');
  head.className = 'locator-search-intro';
  if (introRow) head.append(...introRow.childNodes);
  const heading = head.querySelector('h1, h2, h3');
  const eyebrow = heading?.previousElementSibling?.tagName === 'P' ? heading.previousElementSibling : null;
  if (heading) {
    const top = document.createElement('div');
    top.className = 'locator-search-top';
    heading.prepend(createIcon('person-search'));
    if (eyebrow) eyebrow.className = 'eyebrow';
    top.append(heading, ...(eyebrow ? [eyebrow] : []));
    head.prepend(top);
  }

  const results = document.createElement('div');
  results.className = 'locator-search-results';
  results.setAttribute('aria-live', 'polite');

  const link = formRow?.querySelector('a');
  const src = link?.href || formRow?.textContent.trim();
  // the form id is the definition name (offender-locator), which can equal the heading's id
  const formId = (src || '').split('/').pop().replace(/\.json.*$/, '');
  if (heading && heading.id === formId) heading.id = `${formId}-title`;

  const foot = document.createElement('div');
  foot.className = 'locator-search-footnote';
  if (footRow) foot.append(...footRow.childNodes);
  // text before the link (e.g. ":lock: Encrypted Search") sits left, links right
  [...foot.childNodes].forEach((n) => {
    if (n.nodeType === Node.TEXT_NODE && n.textContent.trim()) {
      const span = document.createElement('span');
      n.replaceWith(span);
      span.append(n);
    }
  });

  block.replaceChildren(head);
  try {
    const form = await createForm(src, {
      validate: validateCriteria,
      onSubmit: (data) => {
        const name = [data['first-name'], data['last-name']].filter(Boolean).join(' ');
        const criteria = data['state-id'] ? `State ID ${data['state-id']}` : `Name “${name}”`;
        const h = document.createElement('h3');
        h.append(createIcon('info'), 'Search not connected');
        const p = document.createElement('p');
        p.textContent = 'Live lookup is not connected in this demo. In production this searches the VADOC Inmate & Supervisee Locator.';
        const echo = document.createElement('p');
        echo.className = 'locator-search-criteria';
        echo.append('You searched for: ');
        echo.append(Object.assign(document.createElement('strong'), { textContent: criteria }));
        results.replaceChildren(h, p, echo);
        results.classList.add('is-visible');
      },
    });
    form.querySelectorAll('button[type="submit"]').forEach((b) => {
      b.querySelector('.icon')?.replaceWith(createIcon('search'));
      b.classList.add('form-full');
    });
    block.append(form, results);
  } catch (e) {
    const p = document.createElement('p');
    p.textContent = 'The locator is temporarily unavailable. Please try again later.';
    block.append(p);
  }
  if (foot.childNodes.length) block.append(foot);
  await cssLoaded;
}
