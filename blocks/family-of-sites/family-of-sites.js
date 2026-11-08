/*
 * Family of sites: links to the sibling public-safety sites, current site highlighted.
 * Rows: first row (single cell) = title; then [link (short name), description].
 * Dark style inside the footer, light style elsewhere.
 */

import { createIcon } from '../../scripts/scripts.js';
import { CONTENT_ROOT, getSite } from '../../scripts/sites.js';

/**
 * Site-relative path without the local /content mount, trailing slash or index.
 * @param {string} pathname
 */
function normalizePath(pathname) {
  let p = pathname;
  if (CONTENT_ROOT && (p === CONTENT_ROOT || p.startsWith(`${CONTENT_ROOT}/`))) p = p.slice(CONTENT_ROOT.length);
  p = p.replace(/(\/index)?\.html$/, '').replace(/\/index$/, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

/**
 * Marks the tile for the current page (aria-current="page"), else the current site's home
 * tile (aria-current="true").
 * @param {HTMLAnchorElement[]} tiles
 */
function highlightCurrent(tiles) {
  const local = tiles.filter((a) => a.origin === window.location.origin);
  const here = normalizePath(window.location.pathname);
  let current = local.find((a) => normalizePath(a.pathname) === here);
  let value = 'page';
  if (!current) {
    const home = normalizePath(getSite().home);
    current = local.find((a) => normalizePath(a.pathname) === home);
    value = 'true';
  }
  if (!current) return;
  current.setAttribute('aria-current', value);
  current.classList.add('is-current');
  const marker = createIcon('check-circle');
  marker.classList.add('family-of-sites-marker');
  current.prepend(marker);
  const sr = document.createElement('span');
  sr.className = 'visually-hidden';
  sr.textContent = value === 'page' ? ' (current page)' : ' (current site)';
  current.append(sr);
}

/**
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const frag = document.createDocumentFragment();

  if (rows[0] && rows[0].children.length === 1 && !rows[0].querySelector('a')) {
    const title = document.createElement('h2');
    title.className = 'family-of-sites-title';
    title.append(createIcon('account-tree'));
    const text = document.createElement('span');
    text.textContent = rows.shift().textContent.trim();
    title.append(text);
    frag.append(title);
  }

  const list = document.createElement('ul');
  list.className = 'family-of-sites-list';
  const tiles = [];
  rows.forEach((row) => {
    const [linkCell, descCell] = row.children;
    const source = linkCell?.querySelector('a');
    if (!source) return;
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'family-of-sites-tile';
    a.href = source.getAttribute('href');
    const name = document.createElement('span');
    name.className = 'family-of-sites-name';
    name.textContent = source.textContent.trim();
    a.append(name);
    const desc = descCell?.textContent.trim();
    if (desc) {
      const d = document.createElement('span');
      d.className = 'family-of-sites-desc';
      d.textContent = desc;
      a.append(d);
    }
    li.append(a);
    list.append(li);
    tiles.push(a);
  });
  frag.append(list);
  highlightCurrent(tiles);

  block.replaceChildren(frag);
}
