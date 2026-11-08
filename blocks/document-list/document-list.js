import { createIcon } from '../../scripts/scripts.js';
import { buildTabs, loadTabsStyles } from '../tabs/tabs.js';

let listCount = 0;

/**
 * @param {string} cls
 * @param {string} [tag]
 * @returns {HTMLElement}
 */
function el(cls, tag = 'div') {
  const e = document.createElement(tag);
  e.className = cls;
  return e;
}

/**
 * Text of the closest heading before the block.
 * @param {Element} block
 * @returns {string}
 */
function precedingHeading(block) {
  let prev = block.parentElement?.previousElementSibling;
  while (prev) {
    const hs = prev.matches('h1, h2, h3, h4, h5, h6') ? [prev] : [...prev.querySelectorAll('h1, h2, h3, h4, h5, h6')];
    if (hs.length) return hs[hs.length - 1].textContent.trim();
    prev = prev.previousElementSibling;
  }
  return '';
}

/** @param {string} s @returns {boolean} short label without digits (e.g. "PDF", "Certified") */
const isLabel = (s) => !!s && s.length <= 20 && !/\d/.test(s);

/**
 * Icon for a meta segment.
 * @param {string} text
 * @returns {string}
 */
function metaIcon(text) {
  if (/download/i.test(text)) return 'download';
  if (/published|\b(19|20)\d\d\b/i.test(text)) return 'calendar-today';
  if (/size|kb|mb/i.test(text)) return 'description';
  return 'verified-user';
}

/**
 * Builds one document entry.
 * @param {object} doc title, desc (elements), meta (text), link (anchor), badge (text)
 * @param {boolean} tiles
 * @returns {HTMLLIElement}
 */
function buildItem(doc, tiles) {
  listCount += 1;
  const li = el(tiles ? 'document-list-tile' : 'document-list-item', 'li');
  const heading = el('document-list-title', 'h3');
  heading.id = `document-list-${listCount}`;
  heading.append(...doc.title.childNodes);
  if (heading.querySelector('strong') && heading.textContent.trim() === heading.querySelector('strong').textContent.trim()) {
    heading.replaceChildren(heading.textContent.trim());
  }

  const segments = doc.meta.split(/\s+[·•]\s+/).map((s) => s.trim()).filter(Boolean);
  const labels = [];
  if (isLabel(segments[0])) labels.push(segments.shift());
  if (doc.badge) labels.push(doc.badge);

  const desc = el('document-list-desc', 'p');
  desc.append(...doc.desc.childNodes);

  const { link } = doc;
  if (link) {
    link.className = 'button primary document-list-download';
    link.removeAttribute('title');
    link.prepend(createIcon(tiles ? 'picture-as-pdf' : 'file-download'));
    link.setAttribute('aria-describedby', heading.id);
  }

  if (tiles) {
    if (/annual/i.test(heading.textContent)) {
      li.classList.add('featured');
      link?.querySelector('.icon')?.replaceWith(createIcon('download-for-offline'));
    }
    const header = el('document-list-tile-header');
    header.append(heading);
    labels.forEach((label) => {
      const tag = el('tag', 'span');
      tag.textContent = label;
      if (/latest|executive/i.test(label)) tag.classList.add('tag-strong');
      header.append(tag);
    });
    const meta = el('document-list-meta', 'ul');
    segments.forEach((s) => {
      const item = document.createElement('li');
      item.append(createIcon(metaIcon(s)), s);
      meta.append(item);
    });
    li.append(header, desc);
    if (segments.length) li.append(meta);
    if (link) li.append(link);
    return li;
  }

  const icon = el('document-list-icon');
  icon.append(createIcon('article'));
  const info = el('document-list-info');
  const meta = el('document-list-meta', 'p');
  labels.forEach((l, i) => {
    const tag = el(i ? 'tag document-list-badge' : 'tag', 'span');
    tag.textContent = l;
    meta.append(tag);
  });
  segments.forEach((s) => {
    const span = el('document-list-meta-item', 'span');
    span.textContent = s;
    meta.append(span);
  });
  info.append(meta, heading, desc);
  li.append(icon, info);
  if (link) li.append(link);
  return li;
}

/**
 * Document list: rows of [group, **title**, description, meta, link, badge (optional)].
 * Multiple groups become tabs ("Group (count)"). Variant `tiles`: card grid.
 * @param {Element} block
 */
export default async function decorate(block) {
  const tiles = block.classList.contains('tiles');
  const groups = new Map();
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const [group, title, desc, meta, link, badge] = cells;
    const name = group?.textContent.trim() || '';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push({
      title: title?.querySelector('p') || title,
      desc: desc?.querySelector('p') || desc || el(''),
      meta: meta?.textContent.trim() || '',
      link: link?.querySelector('a'),
      badge: badge?.textContent.trim() || '',
    });
  });

  const lists = [...groups.entries()].map(([name, docs]) => {
    const ul = el(tiles ? 'document-list-tiles' : 'document-list-items', 'ul');
    docs.forEach((doc) => ul.append(buildItem(doc, tiles)));
    return { name, ul, count: docs.length };
  });

  if (lists.length > 1) {
    await loadTabsStyles();
    const tabs = buildTabs(
      lists.map(({ name, ul, count }) => ({ label: `${name} (${count})`, content: ul })),
      { label: precedingHeading(block) || 'Document categories' },
    );
    block.replaceChildren(tabs);
  } else {
    block.replaceChildren(...lists.map((l) => l.ul));
  }
}
