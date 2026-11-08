import { createIcon } from '../../scripts/scripts.js';

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

/** @param {Element} n @returns {boolean} paragraph that only holds a link */
function isLinkPara(n) {
  const a = n?.tagName === 'P' && n.querySelector('a');
  return !!a && n.textContent.trim() === a.textContent.trim();
}

/**
 * Committee list item: **Name** time — description — file/link label.
 * @param {HTMLLIElement} li
 * @returns {HTMLLIElement}
 */
function buildCommittee(li) {
  const card = el('meeting-committee', 'li');
  const strong = li.querySelector('strong');
  const link = li.querySelector('a');
  const name = el('meeting-committee-name', 'strong');
  name.textContent = strong ? strong.textContent.trim() : '';
  strong?.remove();
  const linkText = link?.textContent.trim();
  link?.remove();
  const parts = li.textContent.split(/\s+[—–]\s+/).map((t) => t.trim()).filter(Boolean);
  const header = el('meeting-committee-header');
  header.append(name);
  if (parts.length > 1 || /\d/.test(parts[0] || '')) {
    const time = el('meeting-committee-time', 'span');
    time.textContent = parts.shift();
    header.append(time);
  }
  card.append(header);
  const fileLabel = link ? null : parts.length > 1 && parts.pop();
  if (parts.length) {
    const desc = el('meeting-committee-desc', 'p');
    desc.textContent = parts.join(' — ');
    card.append(desc);
  }
  if (link || fileLabel) {
    const file = el('meeting-committee-file', 'p');
    file.append(createIcon('download'));
    if (link) {
      link.textContent = linkText;
      file.append(link);
    } else {
      file.append(fileLabel);
    }
    card.append(file);
  }
  return card;
}

/**
 * Groups a meetings panel into meeting entries: h3 + date line + location + buttons + committees.
 * @param {HTMLElement} body
 */
function decorateMeetings(body) {
  const nodes = [...body.children];
  const meetings = [];
  nodes.forEach((n) => {
    if (/^H[2-6]$/.test(n.tagName) || !meetings.length) meetings.push([]);
    meetings[meetings.length - 1].push(n);
  });
  body.replaceChildren();
  meetings.forEach((group) => {
    const article = el('meeting', 'article');
    const head = el('meeting-head');
    const info = el('meeting-info');
    const actions = el('meeting-actions');
    head.append(info);
    article.append(head);
    group.forEach((n, i) => {
      const strong = n.firstElementChild;
      const dateMatch = n.tagName === 'P' && strong?.tagName === 'STRONG' && strong.textContent.trim().match(/^([A-Z]{3})\s+(\d{1,2})$/i);
      if (dateMatch) {
        const badge = el('meeting-date');
        badge.innerHTML = `<span class="meeting-date-month">${dateMatch[1]}</span><span class="meeting-date-day">${dateMatch[2]}</span>`;
        head.prepend(badge);
        strong.remove();
        const [type, ...meta] = n.textContent.trim().split(/\s+·\s+/);
        const line = el('meeting-meta', 'p');
        const tag = el('tag meeting-type', 'span');
        tag.textContent = type;
        line.append(tag);
        meta.forEach((m) => {
          const span = el('meeting-meta-item', 'span');
          span.textContent = m;
          line.append(span);
        });
        info.prepend(line);
        if (/conclud|archiv|adopted/i.test(n.textContent)) article.classList.add('meeting-past');
      } else if (/^H[2-6]$/.test(n.tagName)) {
        n.classList.add('meeting-title');
        info.append(n);
      } else if (n.classList.contains('button-group') || n.classList.contains('button-container') || isLinkPara(n)) {
        n.querySelectorAll('a').forEach((a) => {
          if (!a.classList.contains('button')) a.className = 'button secondary';
          if (!a.querySelector('.icon')) a.prepend(createIcon(/stream|regist/i.test(a.textContent) ? 'videocam' : 'description'));
          actions.append(a);
        });
      } else if (n.tagName === 'UL' && group[i - 1]?.tagName === 'P' && /:\s*$/.test(group[i - 1].textContent)) {
        // handled with its label below
      } else if (n.tagName === 'P' && /:\s*$/.test(n.textContent) && group[i + 1]?.tagName === 'UL') {
        const committees = el('meeting-committees');
        n.className = 'meeting-committees-label';
        const ul = el('meeting-committee-list', 'ul');
        [...group[i + 1].children].forEach((li) => ul.append(buildCommittee(li)));
        committees.append(n, ul);
        article.append(committees);
      } else if (n.tagName === 'P' && !n.querySelector('a') && info.querySelector('.meeting-title')) {
        n.classList.add('meeting-location');
        n.prepend(createIcon('location-on'));
        info.append(n);
      } else {
        info.append(n);
      }
    });
    if (actions.children.length) head.append(actions);
    body.append(article);
  });
}

/**
 * Accordion: rows of [label, content] rendered as native <details>/<summary> (first open).
 * Variant `meetings`: meeting entries with date badges, actions and committee cards.
 * @param {Element} block
 */
export default function decorate(block) {
  const meetings = block.classList.contains('meetings');
  [...block.children].forEach((row, i) => {
    const [labelCell, bodyCell] = row.children;
    const details = el('accordion-item', 'details');
    if (i === 0) details.open = true;
    const summary = el('accordion-item-label', 'summary');
    const label = el('accordion-item-text', 'span');
    label.append(...(labelCell?.firstElementChild?.tagName === 'P' && labelCell.children.length === 1
      ? labelCell.firstElementChild.childNodes : labelCell?.childNodes || []));
    summary.append(label, createIcon('expand-more'));
    const body = el('accordion-item-body');
    if (bodyCell) body.append(...bodyCell.childNodes);
    if (meetings) decorateMeetings(body);
    details.append(summary, body);
    row.replaceWith(details);
  });
}
