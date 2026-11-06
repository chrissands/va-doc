import { createIcon } from '../../scripts/scripts.js';

/**
 * Breadcrumb: row 1 = list of links (last item = current page, plain text);
 * optional row 2 = a short note shown on the right.
 * @param {Element} block
 */
export default function decorate(block) {
  const [trailRow, noteRow] = block.children;
  const source = trailRow?.querySelector('ol, ul');
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const ol = document.createElement('ol');
  ol.className = 'breadcrumb-list';

  const items = source ? [...source.children] : [...(trailRow?.querySelectorAll('a') || [])];
  items.forEach((item, i) => {
    const li = document.createElement('li');
    li.append(...(item.tagName === 'LI' ? item.childNodes : [item]));
    const last = i === items.length - 1;
    const link = li.querySelector('a');
    if (last) {
      if (link) link.setAttribute('aria-current', 'page');
      else {
        const span = document.createElement('span');
        span.setAttribute('aria-current', 'page');
        span.append(...li.childNodes);
        li.append(span);
      }
    }
    if (i === 0 && link) {
      link.prepend(createIcon('home'));
      link.classList.add('breadcrumb-home');
    }
    ol.append(li);
  });
  nav.append(ol);

  const children = [nav];
  const noteText = noteRow?.textContent.trim();
  if (noteText) {
    const note = document.createElement('p');
    note.className = 'breadcrumb-note';
    note.append(...(noteRow.querySelector('p') || noteRow.firstElementChild || noteRow).childNodes);
    children.push(note);
  }
  block.replaceChildren(...children);
}
