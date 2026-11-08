/* eslint-disable */
/* global WebImporter */
/**
 * Parser: footer-fragment — builds a site's /footer fragment from the design footer,
 * with per-site overrides (data-sites hint) for agencies whose designs reuse the VADOC footer.
 * Output (four sections, read by the footer block):
 *   1. PREA hotline strip (optional): icon, heading, text, links
 *   2. Family Of Sites block: title row + one row per sibling site (link | description)
 *   3. link columns: an h2 per column followed by paragraphs or a list
 *   4. bottom bar: copyright + legal links
 */
function columnFromDesign(d, col) {
  const out = [];
  const title = col.querySelector('h5, h4, .font-title-md, .font-label-lg, .font-label-md');
  if (title) out.push(heading(d, 2, text(title)));
  const links = [...col.querySelectorAll('a')].filter((a) => text(a));
  const paras = [...col.querySelectorAll('p')].filter((x) => text(x));
  paras.forEach((x) => {
    const html = x.innerHTML.split(/<br\s*\/?>/i).map((s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).filter(Boolean);
    html.forEach((line) => out.push(p(d, line)));
  });
  if (links.length > 1 || !paras.length) {
    const ul = d.createElement('ul');
    links.forEach((a) => { const li = d.createElement('li'); li.append(link(d, a, { style: 'plain' })); ul.append(li); });
    if (ul.children.length) out.push(ul);
  } else links.forEach((a) => out.push(p(d, link(d, a, { style: 'plain' }))));
  return out;
}

function columnFromConfig(d, c) {
  const out = [heading(d, 2, c.title)];
  (c.lines || []).forEach((l) => out.push(p(d, l)));
  if (c.links) {
    const ul = d.createElement('ul');
    c.links.forEach(([label, href]) => {
      const li = d.createElement('li');
      const a = d.createElement('a');
      a.href = href || '#';
      a.textContent = label;
      li.append(a);
      ul.append(li);
    });
    out.push(ul);
  }
  return out;
}

export default function parse(element, { document, url, params }) {
  const d = document;
  let site = 'vadoc';
  let frag = 'footer';
  try {
    const u = new URL(params?.originalURL || url);
    site = u.searchParams.get('site') || site;
    frag = u.searchParams.get('fragment') || frag;
  } catch (e) { /* defaults */ }
  if (frag !== 'footer') return;
  const all = JSON.parse(element.dataset.sites || '{}');
  const cfg = all[site] || {};
  const footer = d.querySelector(cfg.source || 'body > footer') || d.querySelector('footer');
  const out = [];

  // 1. PREA strip
  const strip = footer?.querySelector(':scope > div > div.bg-primary-container');
  if (cfg.prea !== false && strip) {
    const spans = [...strip.querySelectorAll('span')].filter((s) => !s.matches(ICON) && text(s));
    out.push(p(d, `:${iconName(strip) || 'phone-in-talk'}:`), heading(d, 2, text(spans[0])));
    if (spans[1]) out.push(p(d, text(spans[1])));
    strip.querySelectorAll('a').forEach((a) => out.push(p(d, link(d, a))));
    out.push(d.createElement('hr'));
  }

  // 2. family of sites (same list on every site; the current one is highlighted at runtime)
  const rows = [[cell(d, p(d, all.family?.title || 'Family of Public Safety Sites'))]];
  (all.family?.sites || []).forEach(([short, desc, href]) => {
    const a = d.createElement('a');
    a.href = href;
    a.textContent = short;
    rows.push([cell(d, p(d, a)), cell(d, p(d, desc))]);
  });
  out.push(block(d, 'Family Of Sites', rows), d.createElement('hr'));

  // 3. link columns
  const grid = footer?.querySelector('div.grid.grid-cols-1');
  const designCols = grid ? [...grid.children] : [];
  const n = Math.max(designCols.length, (cfg.columns || []).length);
  for (let i = 0; i < n; i += 1) {
    const override = (cfg.columns || [])[i];
    if (override === null) continue;
    if (override) out.push(...columnFromConfig(d, override));
    else if (designCols[i]) out.push(...columnFromDesign(d, designCols[i]));
  }
  out.push(d.createElement('hr'));

  // 4. bottom bar
  const copyrightEl = [...(footer?.querySelectorAll('p, span, div') || [])].find((s) => /^©/.test(text(s)) && !s.querySelector('div'));
  out.push(p(d, cfg.copyright || text(copyrightEl)));
  const ul = d.createElement('ul');
  const legal = cfg.legal || [...(copyrightEl?.parentElement?.querySelectorAll('a') || [])].map((a) => [text(a), a.getAttribute('href')]);
  legal.forEach(([label, href]) => {
    const li = d.createElement('li');
    const a = d.createElement('a');
    a.href = !href || /^#placeholder-\d+$/.test(href) ? '#' : href;
    a.textContent = label;
    li.append(a);
    ul.append(li);
  });
  out.push(ul);
  d.body.innerHTML = '';
  out.forEach((x) => d.body.append(x));
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
