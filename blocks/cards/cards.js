import { createIcon } from '../../scripts/scripts.js';

const VARIANTS = ['audience', 'icon-links', 'news', 'icon', 'member', 'document', 'stats'];
const DATE_RE = /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.? \d{1,2},? \d{4})\s*$/;

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

/** @param {Element} p paragraph @returns {boolean} true when it only holds one link */
function isLinkPara(p) {
  if (!p || p.tagName !== 'P') return false;
  const a = p.querySelector('a');
  return !!a && p.textContent.trim() === a.textContent.trim();
}

/** @param {Element} cell @returns {boolean} true when the cell only holds an icon */
function isIconCell(cell) {
  return !!cell.querySelector('span.icon') && !cell.textContent.trim() && !cell.querySelector('picture');
}

/**
 * Moves the paragraphs that precede the first heading out of the body.
 * @param {Element} body
 * @returns {HTMLElement[]}
 */
function takeLeadParas(body) {
  const lead = [];
  let n = body.firstElementChild;
  while (n && n.tagName === 'P' && !/^H[1-6]$/.test(n.tagName)) {
    lead.push(n);
    n = n.nextElementSibling;
  }
  if (!body.querySelector('h1, h2, h3, h4, h5, h6')) return [];
  lead.forEach((p) => p.remove());
  return lead;
}

/**
 * Turns the trailing link paragraph into a footer link with an icon.
 * @param {Element} body
 * @param {string} iconName
 * @returns {HTMLElement|null} the footer
 */
function footerLink(body, iconName) {
  const p = [...body.querySelectorAll(':scope > p')].reverse().find(isLinkPara);
  if (!p || p.classList.contains('button-container')) return null;
  const footer = el('cards-card-footer');
  const a = p.querySelector('a');
  a.classList.add('cards-card-link');
  a.append(createIcon(iconName));
  footer.append(a);
  p.replaceWith(footer);
  return footer;
}

/**
 * Splits "Label Feb 21, 2025" into a tag and a date.
 * @param {HTMLParagraphElement} p
 * @returns {HTMLElement}
 */
function tagAndDate(p) {
  const row = el('cards-card-header');
  const text = p.textContent.trim();
  const m = text.match(DATE_RE);
  const tag = el('tag', 'span');
  tag.textContent = m ? text.slice(0, m.index).trim() : text;
  row.append(tag);
  if (m) {
    const date = el('cards-card-date', 'span');
    [, date.textContent] = m;
    row.append(date);
  }
  return row;
}

/**
 * Variant-specific decoration of one card.
 * @param {string} variant
 * @param {HTMLLIElement} li card
 * @param {HTMLElement} body content element
 * @param {HTMLElement|null} media image or icon element
 */
function decorateCard(variant, li, body, media) {
  const lead = takeLeadParas(body);
  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');

  if (variant === 'audience') {
    const header = el('cards-card-header');
    if (media) header.append(media);
    if (lead[0]) {
      lead[0].className = 'cards-card-eyebrow';
      header.append(lead[0]);
    }
    body.prepend(header);
    const footer = footerLink(body, 'arrow-forward');
    if (footer) li.classList.add('cards-card-linked');
  } else if (variant === 'icon-links') {
    if (media) body.prepend(media);
    body.querySelectorAll('a.button').forEach((a) => a.append(createIcon('chevron-right')));
  } else if (variant === 'news') {
    const [category, dateLine] = media ? lead : [];
    if (media && category) {
      category.className = 'tag cards-card-category';
      media.append(category);
    }
    if (dateLine) {
      dateLine.className = 'cards-card-meta';
      dateLine.prepend(createIcon('event'));
      body.prepend(dateLine);
    }
    if (!media && lead[0]) body.prepend(tagAndDate(lead[0]));
    // trailing plain paragraph = meta beside the link
    const last = body.lastElementChild;
    const metaP = last?.tagName === 'P' && !last.querySelector('a') && last !== body.querySelector('p') ? last : null;
    const linkText = [...body.querySelectorAll(':scope > p')].reverse().find(isLinkPara)?.textContent || '';
    const footer = footerLink(body, !media && /download/i.test(linkText) ? 'file-download' : 'chevron-right');
    if (footer && metaP) {
      metaP.className = 'cards-card-footnote';
      footer.append(metaP);
    }
  } else if (variant === 'icon') {
    const header = el('cards-card-header');
    if (media) header.append(media);
    if (lead.length > 1) {
      li.classList.add('cards-card-featured');
      lead[0].className = 'tag cards-card-badge';
      header.append(lead[0]);
      lead[1].className = 'cards-card-eyebrow';
      heading?.before(lead[1]);
    } else if (lead[0]) {
      lead[0].className = 'cards-card-eyebrow';
      heading?.before(lead[0]);
    }
    body.prepend(header);
    // plain paragraph right before the action = meta line in the footer
    const action = [...body.querySelectorAll(':scope > p')].reverse().find(isLinkPara);
    const metaP = action?.previousElementSibling;
    if (action?.classList.contains('button-container')) {
      const footer = el('cards-card-footer');
      if (metaP?.tagName === 'P' && metaP.textContent.length < 60) {
        metaP.className = 'cards-card-footnote';
        metaP.prepend(createIcon('assignment-turned-in'));
        footer.append(metaP);
      }
      action.replaceWith(footer);
      action.querySelector('a').append(createIcon('launch'));
      footer.append(action);
    } else {
      footerLink(body, 'arrow-forward');
    }
  } else if (variant === 'member') {
    if (media && lead[0]) {
      lead[0].className = 'tag cards-card-role';
      media.append(lead[0]);
    }
    const after = heading ? [...body.children].slice([...body.children].indexOf(heading) + 1) : [];
    const paras = after.filter((n) => n.tagName === 'P');
    if (paras[0]) paras[0].className = 'cards-card-title';
    if (paras.length > 2) {
      const meta = el('cards-card-footer');
      paras.slice(2).forEach((p) => meta.append(p));
      body.append(meta);
    }
  } else if (variant === 'document') {
    if (lead[0]) {
      const text = lead[0].textContent.trim();
      const i = text.search(/\s+Rev\.?\s/i);
      const header = el('cards-card-header');
      const tag = el('tag', 'span');
      tag.textContent = i > 0 ? text.slice(0, i) : text;
      header.append(tag);
      if (i > 0) {
        const rev = el('cards-card-date', 'span');
        rev.textContent = text.slice(i).trim();
        header.append(rev);
      }
      body.prepend(header);
    }
    body.querySelectorAll(':scope > ul').forEach((ul) => {
      const box = el('cards-card-criteria');
      const label = ul.previousElementSibling;
      ul.before(box);
      if (label?.tagName === 'P' && /:\s*$/.test(label.textContent)) {
        label.className = 'cards-card-criteria-label';
        box.append(label);
      }
      box.append(ul);
    });
    body.querySelectorAll('a.button').forEach((a) => a.prepend(createIcon('download')));
  } else if (variant === 'stats') {
    const [value, label] = body.querySelectorAll(':scope > p');
    if (value) value.className = 'cards-card-value';
    if (label) label.className = 'cards-card-label';
  } else if (media && lead[0]) {
    lead[0].classList.add('eyebrow');
    heading?.before(lead[0]);
  }
}

/**
 * Cards: rows of [image | :icon:, content] or [content] ("no images").
 * Variants: audience, icon-links, news, icon, member, document, stats.
 * @param {Element} block
 */
export default function decorate(block) {
  const variant = VARIANTS.find((v) => block.classList.contains(v)) || 'default';
  const ul = el('cards-list', 'ul');
  [...block.children].forEach((row) => {
    const li = el('cards-card', 'li');
    let media = null;
    let body = null;
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture') && !cell.querySelector('h1, h2, h3, h4, h5, h6')) {
        media = cell;
        media.className = 'cards-card-image';
      } else if (isIconCell(cell)) {
        media = cell;
        media.className = 'cards-card-icon';
      } else if (!body) {
        body = cell;
        body.className = 'cards-card-body';
      } else {
        body.append(...cell.childNodes);
      }
    });
    if (!body) body = el('cards-card-body');
    if (media?.classList.contains('cards-card-image')) li.append(media);
    li.append(body);
    decorateCard(variant, li, body, media);
    if (media?.classList.contains('cards-card-icon') && !li.contains(media)) body.prepend(media);
    ul.append(li);
  });
  block.replaceChildren(ul);
}
