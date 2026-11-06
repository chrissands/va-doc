import { createIcon } from '../../scripts/scripts.js';

/**
 * Text of the closest heading before the block (used to label the scroll region).
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

/**
 * Moves a cell's content into a table cell, unwrapping a lone paragraph.
 * @param {Element} from authored cell
 * @param {HTMLTableCellElement} to
 */
function moveContent(from, to) {
  const only = from.children.length === 1 && from.firstElementChild.tagName === 'P'
    && from.textContent.trim() === from.firstElementChild.textContent.trim();
  to.append(...(only ? from.firstElementChild.childNodes : from.childNodes));
}

/**
 * Table: first row = column headers, following rows = data.
 * Variant `documents`: title + scope column, classification tags, download buttons, and
 * stacked row cards on small screens.
 * @param {Element} block
 */
export default function decorate(block) {
  const documents = block.classList.contains('documents');
  const rows = [...block.children];
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  const headers = [];

  rows.forEach((row, r) => {
    const tr = document.createElement('tr');
    [...row.children].forEach((cell, c) => {
      const td = document.createElement(r === 0 ? 'th' : 'td');
      moveContent(cell, td);
      if (r === 0) {
        td.scope = 'col';
        headers.push(td.textContent.trim());
      } else if (headers[c]) {
        td.dataset.label = headers[c];
      }
      tr.append(td);
    });
    (r === 0 ? thead : tbody).append(tr);
  });
  table.append(thead, tbody);

  if (documents) {
    const tagCol = headers.findIndex((h) => /classification|category|type/i.test(h));
    tbody.querySelectorAll('tr').forEach((tr) => {
      [...tr.children].forEach((td, c) => {
        if (c === 0) td.classList.add('table-key');
        if (td.querySelector('strong')) td.classList.add('table-title');
        if (c === tagCol && td.textContent.trim()) {
          const tag = document.createElement('span');
          tag.className = `tag${/critical|urgent/i.test(td.textContent) ? ' tag-critical' : ''}`;
          tag.append(...td.childNodes);
          td.append(tag);
        }
        const link = td.querySelector('a');
        if (link && td.textContent.trim() === link.textContent.trim()) {
          td.classList.add('table-action');
          link.className = 'button primary table-download';
          if (/pdf|download/i.test(link.textContent + (link.getAttribute('href') || ''))) {
            link.prepend(createIcon('picture-as-pdf'));
          }
          const title = tr.querySelector('.table-title strong, .table-key');
          if (title) link.setAttribute('aria-label', `${link.textContent.trim()}: ${title.textContent.trim()}`);
        }
      });
    });
    const lastHeader = thead.querySelector('th:last-child');
    if (tbody.querySelector('tr > td.table-action:last-child')) lastHeader?.classList.add('table-action');
  }

  const scroller = document.createElement('div');
  scroller.className = 'table-scroll';
  scroller.append(table);
  const label = precedingHeading(block);
  if (label) {
    table.setAttribute('aria-label', label);
  }

  // make the scroll container focusable (keyboard scrolling) only when it overflows
  const update = () => {
    const overflows = scroller.scrollWidth > scroller.clientWidth + 1;
    if (overflows) {
      scroller.setAttribute('role', 'region');
      scroller.setAttribute('aria-label', label || 'Scrollable table');
      scroller.tabIndex = 0;
    } else {
      scroller.removeAttribute('role');
      scroller.removeAttribute('aria-label');
      scroller.removeAttribute('tabindex');
    }
  };
  if (window.ResizeObserver) new ResizeObserver(update).observe(scroller);

  block.replaceChildren(scroller);
}
