/* eslint-disable */
/* global WebImporter */
/**
 * Parser: hero — page heroes.
 * Block: Hero (variant). One column:
 *   row 1: image (optional — background image, or side image for the "split" variant)
 *   row 2: eyebrow, h1, text, stats list, call-to-action links
 * Design side panels holding statistics are folded into the stats list.
 * Already-parsed nested blocks (e.g. Locator Search) are placed after the hero.
 */
function statItem(d, value, label) {
  const li = d.createElement('li');
  const strong = d.createElement('strong');
  strong.textContent = value;
  li.append(strong, label ? ` ${label}` : '');
  return li;
}

export default function parse(element, { document }) {
  const d = document;
  const nested = [...element.querySelectorAll('table')];
  nested.forEach((t) => t.remove());
  const variant = element.dataset.variant || '';
  // designs whose page title lives in the site header: data-content picks the text column,
  // data-title supplies the h1 (placed after the eyebrow)
  const h1 = element.querySelector('h1') || element.querySelector(element.dataset.content);
  let col = h1;
  while (col.parentElement && col.parentElement !== element
    && !/(^|\s)(grid|lg:flex-row|md:flex-row)(\s|$)/.test(col.parentElement.getAttribute('class') || '')) col = col.parentElement;
  const grid = col.parentElement;
  const siblings = grid && grid !== element ? [...grid.children].filter((c) => c !== col) : [];
  const mediaCol = siblings.find((c) => c.querySelector('img'));
  const asideCol = siblings.find((c) => !c.querySelector('img') && text(c));

  const big = '.font-display, .font-headline-lg, .font-headline-md, .font-headline-sm';
  const statEls = [...col.querySelectorAll(big)].filter((v) => v !== h1 && !v.contains(h1)).map((v) => v.parentElement)
    .filter((s) => s && s !== col && !s.querySelector('h1'));
  // feature "chips" (short icon + label pills) become a list
  col.querySelectorAll('.flex-wrap').forEach((wrap) => {
    const chips = [...wrap.children];
    if (chips.length < 2 || !chips.every((c) => c.tagName !== 'A' && c.querySelector(ICON) && text(c).length < 40)) return;
    const ul = d.createElement('ul');
    chips.forEach((c) => { const li = d.createElement('li'); li.textContent = text(c); ul.append(li); });
    wrap.replaceWith(ul);
  });
  const content = rich(col, d, { skip: (n) => statEls.includes(n) || n.tagName === 'IMG' });
  if (element.dataset.title) content.splice(1, 0, heading(d, 1, element.dataset.title));
  const list = d.createElement('ul');
  statEls.forEach((s) => {
    const spans = [...s.querySelectorAll('span')].filter((x) => !x.matches(ICON) && !x.querySelector('span') && text(x));
    if (spans.length) list.append(statItem(d, text(spans[0]), spans.slice(1).map(text).join(' · ')));
  });
  if (asideCol) {
    // stat tiles: a flex column holding a value and its label
    asideCol.querySelectorAll('.flex-col').forEach((box) => {
      const spans = [...box.children].filter((s) => s.tagName === 'SPAN' && !s.matches(ICON) && text(s));
      if (spans.length === 2 && box !== asideCol) list.append(statItem(d, text(spans[0]), text(spans[1])));
    });
  }
  if (list.children.length) {
    const firstButton = content.findIndex((n) => n.querySelector?.('strong > a, em > a'));
    content.splice(firstButton >= 0 ? firstButton : content.length, 0, list);
  }
  const rows = [];
  const mediaImg = mediaCol ? mediaCol.querySelector('img') : element.querySelector('img');
  if (mediaImg) rows.push([cell(d, p(d, img(d, mediaImg)))]);
  rows.push([cell(d, content)]);
  element.replaceWith(block(d, variant ? `Hero (${variant})` : 'Hero', rows), ...nested);
}

/* ---- shared design-to-content helpers (inlined: parsers must be self-contained) ---- */
const ICON = '.material-symbols-outlined';
const CTA_ICONS = ['arrow_forward', 'chevron_right', 'navigate_next', 'launch', 'open_in_new'];
const BLOCKISH = 'div,p,section,article,header,footer,aside,ul,ol,li,h1,h2,h3,h4,h5,h6,table,img,picture,a,button,form,label,dl,dt,dd,nav,figure,blockquote,select,input,textarea';
// people named in the designs are replaced so no personal data is copied
const PEOPLE = [[/Ryan C\. McCord/g, '[Executive Director Name]'], [/The Hon\. Vernie W\. Francis Jr\./g, '[Board Chair Name]'],
  [/Dr\. Anita S\. Maybach, MD/g, '[Vice Chair Name], MD'], [/Roland Sherrod, Esq\./g, '[Board Member Name], Esq.'],
  [/Evelyn Vance/g, '[Staff Member Name]'], [/Eleanor Vance/g, ''], [/(Marcus Thorne|Sarah Lin|Devon Campbell|Angela Ru\w*) - /g, '']];
const scrub = (t) => PEOPLE.reduce((s, [re, rep]) => s.replace(re, rep), t || '');
const iconName = (el) => {
  const i = el && (el.matches?.(ICON) ? el : el.querySelector?.(ICON));
  return i ? i.textContent.trim().replace(/_/g, '-') : '';
};
const text = (el) => {
  if (!el) return '';
  const c = el.cloneNode(true);
  c.querySelectorAll(`${ICON},script,style`).forEach((i) => i.remove());
  c.querySelectorAll('br').forEach((b) => b.replaceWith(', '));
  return scrub(c.textContent.replace(/\s+/g, ' ').trim());
};
const p = (d, content) => {
  const el = d.createElement('p');
  if (typeof content === 'string') el.textContent = content; else if (content) el.append(content);
  return el;
};
const heading = (d, level, t) => { const h = d.createElement(`h${level}`); h.textContent = t; return h; };
// design section anchors -> ids of the matching headings in the imported pages
const ANCHORS = {
  '#visitation-hub': '#in-person--video-visitation', '#meetings-section': '#board-meetings-agendas--minutes',
  '#document-library': '#document-library--formal-publications', '#directory-cta': '#official-virginia-local--regional-jails-directory',
  '#decisions-archive': '#monthly-parole-decision-releases', '#public-comment': '#open-administrative-board-meeting--public-comment',
  '#victim-services': '#victim-input--confidential-statements', '#forms': '#most-requested-forms--petitions',
};
const cls = (el) => (el?.getAttribute?.('class') || '').split(/\s+/).filter((c) => !c.includes(':')).join(' ');
// filled buttons -> <strong><a>, outlined/white buttons -> <em><a>, otherwise plain link
const link = (d, el, { href, label, style } = {}) => {
  const a = d.createElement('a');
  const h = href ?? el?.getAttribute?.('href');
  a.href = !h || /^#placeholder-\d+$/.test(h) ? '#' : (ANCHORS[h] || h);
  a.textContent = label ?? text(el);
  if (a.getAttribute('href') === '#' && /^[\w.+-]+@[\w.-]+\.\w+$/.test(a.textContent)) a.href = `mailto:${a.textContent}`;
  const c = cls(el);
  let kind = style;
  if (!kind) {
    if (/(^|\s)bg-(primary|primary-container|secondary|tertiary|tertiary-container|error|on-tertiary-container|secondary-container)(\s|$)/.test(c)) kind = 'primary';
    else if (/(^|\s)bg-surface-container-lowest(\s|$)/.test(c) || /(^|\s)border(\s|-2(\s|$)|-surface|-outline|-primary|-secondary)/.test(c)) kind = 'secondary';
  }
  if (kind !== 'primary' && kind !== 'secondary') return a;
  const w = d.createElement(kind === 'primary' ? 'strong' : 'em');
  w.append(a);
  return w;
};
const img = (d, el) => {
  const src = el?.getAttribute?.('src');
  if (!src) return null;
  const i = d.createElement('img');
  i.src = src;
  const da = (el.getAttribute('data-alt') || '').split(/\.\s/)[0].trim();
  i.alt = el.getAttribute('alt') || (da.length > 120 ? da.slice(0, da.lastIndexOf(',', 120) > 40 ? da.lastIndexOf(',', 120) : 120) : da);
  return i;
};
// flatten design markup into headings, paragraphs, lists, images and links
const rich = (root, d, opts = {}) => {
  const out = [];
  const visit = (el) => {
    if (opts.skip && opts.skip(el)) return;
    const tag = el.tagName.toLowerCase();
    if (el.matches(ICON)) { if (opts.icons) out.push(p(d, `:${iconName(el)}:`)); return; }
    if (['script', 'style', 'svg', 'input', 'select', 'textarea', 'option'].includes(tag)) return;
    if (/^h[1-6]$/.test(tag)) { const t = text(el); if (t) out.push(heading(d, opts.level || Number(tag[1]), t)); return; }
    if (tag === 'img') { const i = img(d, el); if (i) out.push(p(d, i)); return; }
    if (tag === 'table') { out.push(el); return; }
    if (tag === 'ul' || tag === 'ol') {
      const list = d.createElement(tag);
      el.querySelectorAll(':scope > li').forEach((li) => {
        const item = d.createElement('li');
        const a = li.querySelector('a');
        if (a && text(li) === text(a)) item.append(link(d, a, { style: 'plain' })); else item.textContent = text(li);
        if (item.textContent) list.append(item);
      });
      if (list.children.length) out.push(list);
      return;
    }
    if (tag === 'a' || tag === 'button') { if (text(el)) out.push(p(d, link(d, el))); return; }
    if (tag === 'blockquote') { const q = d.createElement('blockquote'); q.textContent = text(el); out.push(q); return; }
    if (!el.querySelector(BLOCKISH)) {
      const t = text(el);
      if (!t) return;
      // stacked spans (flex column of value / label / caption) -> one paragraph each
      const kids = [...el.children].filter((k) => !k.matches(ICON) && text(k));
      if (kids.length > 1 && /(^|\s)flex-col(\s|$)/.test(el.getAttribute('class') || '') && kids.every((k) => k.tagName === 'SPAN')) {
        kids.forEach((k) => out.push(p(d, text(k))));
        return;
      }
      const arrow =[...el.querySelectorAll(ICON)].some((i) => CTA_ICONS.includes(i.textContent.trim()));
      out.push(arrow && t.length < 60 ? p(d, link(d, null, { href: '#', label: t })) : p(d, t));
      return;
    }
    let buf = '';
    const flush = () => { const t = scrub(buf.replace(/\s+/g, ' ').trim()); if (t) out.push(p(d, t)); buf = ''; };
    el.childNodes.forEach((n) => {
      if (n.nodeType === 3) { buf += n.textContent; return; }
      if (n.nodeType !== 1) return;
      if (n.matches(BLOCKISH) || n.querySelector(BLOCKISH) || n.matches(ICON)) { flush(); visit(n); } else buf += ` ${text(n)} `;
    });
    flush();
  };
  if (root) visit(root);
  return out.filter(Boolean);
};
const cell = (d, nodes) => {
  const div = d.createElement('div');
  (Array.isArray(nodes) ? nodes : [nodes]).filter(Boolean).forEach((n) => div.append(n));
  return div;
};
// one root per card: climb from each heading while the ancestor holds only that heading
const cardRoots = (container, sel = 'h3') => [...container.querySelectorAll(sel)].map((h) => {
  let n = h;
  while (n.parentElement && n.parentElement !== container && n.parentElement.querySelectorAll(sel).length === 1) n = n.parentElement;
  return n;
});
const iconBox = (el) => [...el.querySelectorAll(ICON)].find((i) => {
  const box = i.parentElement;
  return box && box !== el && box.children.length === 1 && /(^|\s)w-(8|10|12|14|16)(\s|$)/.test(box.getAttribute('class') || '');
});
const isAction = (a) => /(^|\s)(bg-|border(\s|$)|border-2|h-1[0-2]|h-11)/.test(cls(a));
// split a card/callout into icon, image, content and (optionally) action buttons
const parts = (el, d, { actions = false } = {}) => {
  const box = iconBox(el);
  const imageEl = el.querySelector('img');
  const actionEls = actions ? [...el.querySelectorAll('a, button')].filter(isAction) : [];
  return {
    icon: box ? iconName(box) : '',
    image: imageEl ? img(d, imageEl) : null,
    content: rich(el, d, { skip: (n) => (box && n === box.parentElement) || n === imageEl || actionEls.includes(n) }),
    actions: actionEls.map((a) => p(d, link(d, a))),
  };
};
const block = (d, name, cells) => WebImporter.Blocks.createBlock(d, { name, cells });
/* ---- end helpers ---- */
