import { createIcon } from '../../scripts/scripts.js';

const VARIANTS = ['danger', 'dark', 'light', 'tint', 'warning', 'notice'];

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

/** @param {Element} n @returns {boolean} paragraph that holds a single link */
function isLinkPara(n) {
  if (!n || !['P', 'DIV'].includes(n.tagName)) return false;
  const a = n.querySelector('a');
  return !!a && n.textContent.trim() === a.textContent.trim();
}

/**
 * Detects what a cell is for, from its content.
 * @param {Element} cell
 * @returns {'icon'|'actions'|'text'}
 */
function cellRole(cell) {
  if (cell.querySelector('span.icon') && !cell.textContent.trim()) return 'icon';
  const links = [...cell.querySelectorAll('a')];
  if (links.length && !cell.querySelector('h1, h2, h3, h4, h5, h6, picture, ul, ol')) {
    const squash = (t) => t.replace(/\s+/g, '');
    if (squash(cell.textContent) === squash(links.map((a) => a.textContent).join(''))) return 'actions';
  }
  return 'text';
}

/**
 * Normalises an actions cell into a column of buttons (plain links become secondary buttons;
 * phone / mail links get an icon).
 * @param {Element} cell
 * @returns {HTMLElement}
 */
function buildActions(cell) {
  const actions = el('callout-actions');
  cell.querySelectorAll('a').forEach((a) => {
    if (!a.classList.contains('button')) a.className = 'button secondary';
    const href = a.getAttribute('href') || '';
    if (href.startsWith('tel:') && !a.querySelector('.icon')) a.prepend(createIcon('call'));
    if (href.startsWith('mailto:') && !a.querySelector('.icon')) a.prepend(createIcon('mail'));
    actions.append(a);
  });
  return actions;
}

/**
 * Splits "Dedicated Victim Coordinator Direct assistance and…" into a title (the run of
 * Capitalised words before the sentence starts) and a description.
 * @param {string} text
 * @returns {[string, string]|null}
 */
function splitTitle(text) {
  const words = text.split(/\s+/);
  const firstLower = words.findIndex((w) => /^[a-z]/.test(w));
  if (firstLower < 3) return null;
  return [words.slice(0, firstLower - 1).join(' '), words.slice(firstLower - 1).join(' ')];
}

/**
 * Enhances a rich-content cell: eyebrow, title line, count list, contact cards, footnote.
 * @param {Element} cell
 * @param {boolean} allowNote whether a trailing short line becomes a footnote
 * @returns {{ body: HTMLElement, note: HTMLElement|null }}
 */
function buildText(cell, allowNote) {
  const body = el('callout-body');
  body.append(...cell.childNodes);
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  const paras = () => [...body.querySelectorAll(':scope > p')];

  // paragraph before the heading = eyebrow; no heading = short first line is the title
  const first = body.firstElementChild;
  if (heading && first?.tagName === 'P' && first !== heading) first.className = 'callout-eyebrow';
  else if (!heading && first?.tagName === 'P' && first.textContent.length < 80 && paras().length > 1) {
    first.className = 'callout-title';
  }

  // "Email:" + link paragraph → one line
  paras().forEach((p) => {
    const next = p.nextElementSibling;
    if (/:\s*$/.test(p.textContent) && p.textContent.length < 30 && isLinkPara(next)) {
      p.append(' ', ...next.childNodes);
      next.remove();
    }
  });

  // label paragraph + phone/mail link paragraph → contact card
  paras().forEach((p) => {
    const next = p.nextElementSibling;
    if (p.className || p.querySelector('a') || !isLinkPara(next)) return;
    if (!/^(tel|mailto):/.test(next.querySelector('a').getAttribute('href') || '')) return;
    const card = el('callout-contact');
    p.before(card);
    const split = splitTitle(p.textContent.trim());
    if (split) {
      const title = el('callout-contact-title', 'strong');
      [title.textContent] = split;
      [, p.textContent] = split;
      card.append(title);
    }
    const a = next.querySelector('a');
    a.prepend(createIcon(a.href.startsWith('tel:') ? 'call' : 'mail'));
    card.append(p, next);
  });
  const cards = body.querySelectorAll(':scope > .callout-contact');
  if (cards.length) {
    const group = el('callout-contacts');
    cards[0].before(group);
    group.append(...cards);
  }

  // trailing paragraphs that start with a number → verified count list
  const counts = [];
  for (let p = body.lastElementChild; p?.tagName === 'P' && /^\d/.test(p.textContent.trim()) && !p.className; p = p.previousElementSibling) {
    counts.unshift(p);
  }
  if (counts.length > 1) {
    const ul = el('callout-counts', 'ul');
    counts.forEach((p) => {
      const li = document.createElement('li');
      li.append(createIcon('verified'), ...p.childNodes);
      ul.append(li);
      p.remove();
    });
    body.append(ul);
  }

  // short trailing line = footnote
  let note = null;
  const last = body.lastElementChild;
  if (allowNote && last?.tagName === 'P' && !last.className && !last.querySelector('a')
    && paras().length > 1 && last.textContent.trim().length < 60 && !/\.$/.test(last.textContent.trim())) {
    note = el('callout-note', 'p');
    note.append(createIcon('verified'), ...last.childNodes);
    last.remove();
  }
  return { body, note };
}

/**
 * Callout: one row of cells — optional :icon:, content, optional aside, optional actions.
 * Cell roles are detected from their content. Variants: danger, dark, light, tint, warning, notice.
 * @param {Element} block
 */
export default function decorate(block) {
  if (!VARIANTS.some((v) => block.classList.contains(v))) block.classList.add('light');
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const inner = el('callout-inner');
  const main = el('callout-main');
  let icon = null;
  let actions = null;
  let aside = null;
  let note = null;
  let content = null;

  cells.forEach((cell) => {
    const role = cellRole(cell);
    if (role === 'icon' && !icon) {
      icon = el('callout-icon');
      icon.append(cell.querySelector('span.icon'));
    } else if (role === 'actions' && !actions) {
      actions = buildActions(cell);
    } else if (!content) {
      ({ body: content, note } = buildText(cell, true));
    } else {
      const built = buildText(cell, true);
      aside = el('callout-aside');
      aside.append(built.body);
      if (built.note) aside.append(built.note);
      // the aside card (e.g. confidentiality statement) gets a shield icon
      const shield = el('callout-aside-icon');
      shield.append(createIcon('security'));
      aside.prepend(shield);
    }
  });

  if (icon) inner.append(icon);
  if (content) main.append(content);
  if (note || aside) {
    // footnote and actions share a footer under the content
    if (note || actions) {
      const footer = el('callout-footer');
      if (note) footer.append(note);
      if (actions) footer.append(actions);
      main.append(footer);
    }
    inner.append(main);
  } else {
    inner.append(main);
    if (actions) inner.append(actions);
  }
  if (aside) inner.append(aside);
  if (actions) block.classList.add('has-actions');
  if (aside) block.classList.add('has-aside');
  block.replaceChildren(inner);
}
