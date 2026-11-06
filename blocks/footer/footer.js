/*
 * Footer block. Content comes from the site's footer fragment (see sites.js), sections in order:
 *   1. PREA hotline strip (optional): icon p, h2, p, button paragraphs
 *   2. family-of-sites block
 *   3. link columns: a new column starts at each h2 (or, without a heading, where the content
 *      switches between text lines and a list)
 *   4. bottom bar: copyright p + ul of legal links
 */

import { getMetadata } from '../../scripts/aem.js';
import { createIcon } from '../../scripts/scripts.js';
import { contentPath, siteFragmentPath } from '../../scripts/sites.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Content elements of a section: default content children, other wrappers (blocks) as-is.
 * @param {Element} section
 */
const sectionContent = (section) => [...section.children].flatMap((w) => (
  w.classList.contains('default-content-wrapper') ? [...w.children] : [w]));

/**
 * PREA hotline strip: icon square, text, actions.
 * @param {Element} section
 */
function buildStrip(section) {
  const strip = document.createElement('div');
  strip.className = 'footer-strip';
  const box = document.createElement('div');
  box.className = 'footer-strip-icon';
  const text = document.createElement('div');
  text.className = 'footer-strip-text';
  const actions = document.createElement('div');
  actions.className = 'footer-strip-actions';
  sectionContent(section).forEach((el) => {
    if (!box.children.length && el.tagName === 'P' && el.querySelector('.icon') && !el.textContent.trim()) {
      box.append(...el.childNodes);
    } else if (el.querySelector('.button-container') || el.matches('.button-container')) {
      // links decorated as buttons (possibly grouped into a button-group by decorateButtons)
      actions.append(...(el.matches('.button-container') ? [el] : el.querySelectorAll('.button-container')));
    } else {
      text.append(el);
    }
  });
  if (box.children.length) strip.append(box);
  strip.append(text);
  if (actions.children.length) strip.append(actions);
  return strip;
}

/**
 * Splits default content into columns.
 * @param {Element[]} elements content of the column sections
 */
function buildColumns(elements) {
  const grid = document.createElement('div');
  grid.className = 'footer-columns';
  let column = null;
  let lastType = null;
  const newColumn = () => {
    column = document.createElement('div');
    column.className = 'footer-column';
    grid.append(column);
    lastType = null;
  };
  elements.forEach((el) => {
    const type = el.tagName === 'UL' || el.tagName === 'OL' ? 'list' : 'text';
    if (/^H[2-6]$/.test(el.tagName)) {
      newColumn();
      lastType = 'heading';
    } else if (!column || (lastType && lastType !== 'heading' && (type !== lastType || type === 'list'))) {
      newColumn();
    }
    column.append(el);
    if (!/^H[2-6]$/.test(el.tagName)) lastType = type;
  });
  return grid;
}

/**
 * Bottom bar: copyright and legal links.
 * @param {Element} wrapper
 */
function buildBottom(wrapper) {
  const bottom = document.createElement('div');
  bottom.className = 'footer-bottom';
  const copy = wrapper.querySelector(':scope > p');
  if (copy) {
    copy.className = 'footer-copyright';
    copy.prepend(createIcon('verified-user'));
    bottom.append(copy);
  }
  const list = wrapper.querySelector(':scope > ul');
  if (list) {
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Legal');
    list.className = 'footer-legal';
    nav.append(list);
    bottom.append(nav);
  }
  return bottom;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? contentPath(new URL(footerMeta, window.location).pathname) : siteFragmentPath('footer');
  const fragment = await loadFragment(footerPath);
  block.textContent = '';
  if (!fragment) return;

  // footer headings must not collide with page heading ids
  fragment.querySelectorAll('h2[id], h3[id], h4[id]').forEach((h) => h.removeAttribute('id'));

  const sections = [...fragment.querySelectorAll(':scope > .section')];
  const familyIndex = sections.findIndex((s) => s.querySelector('.family-of-sites'));
  const bottomSection = sections.length > 1 ? sections.pop() : null;
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  const columnContent = [];

  sections.forEach((section, i) => {
    const isStrip = (familyIndex < 0 ? i === 0 && sections.length > 1 : i < familyIndex)
      && section.querySelector('.icon, .button-container');
    if (i === familyIndex) {
      const family = document.createElement('div');
      family.className = 'footer-family';
      family.append(...section.children);
      inner.append(family);
    } else if (isStrip) {
      inner.append(buildStrip(section));
    } else {
      columnContent.push(...sectionContent(section));
    }
  });

  if (columnContent.length) inner.append(buildColumns(columnContent));
  const bottomWrapper = bottomSection?.querySelector('.default-content-wrapper');
  if (bottomWrapper) inner.append(buildBottom(bottomWrapper));
  block.append(inner);
}
