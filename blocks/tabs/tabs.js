import { loadCSS, toClassName } from '../../scripts/aem.js';

let tabsCount = 0;

/**
 * Loads the tabs styles (for blocks that reuse buildTabs).
 * @returns {Promise<void>}
 */
export function loadTabsStyles() {
  return loadCSS(`${window.hlx.codeBasePath}/blocks/tabs/tabs.css`);
}

/**
 * Builds an accessible tab interface (WAI-ARIA tabs pattern, automatic activation):
 * roving tabindex, Arrow Left/Right, Home/End, aria-selected, aria-controls, hidden panels.
 * @param {{label: string|Node, content: Node|Node[]}[]} items
 * @param {{label?: string}} [options] accessible name of the tab list
 * @returns {HTMLDivElement}
 */
export function buildTabs(items, { label } = {}) {
  tabsCount += 1;
  const prefix = `tabs-${tabsCount}`;
  const root = document.createElement('div');
  root.className = 'tabs-component';
  const list = document.createElement('div');
  list.className = 'tabs-list';
  list.setAttribute('role', 'tablist');
  if (label) list.setAttribute('aria-label', label);
  root.append(list);

  const tabs = [];
  const panels = [];
  items.forEach((item, i) => {
    const text = typeof item.label === 'string' ? item.label : item.label.textContent;
    const id = `${prefix}-${toClassName(text) || i}`;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-tab';
    tab.id = `${id}-tab`;
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-panel`);
    if (typeof item.label === 'string') tab.textContent = item.label;
    else tab.append(item.label);

    const panel = document.createElement('div');
    panel.className = 'tabs-panel';
    panel.id = `${id}-panel`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    panel.tabIndex = 0;
    const content = Array.isArray(item.content) ? item.content : [item.content];
    panel.append(...content.filter(Boolean));

    list.append(tab);
    root.append(panel);
    tabs.push(tab);
    panels.push(panel);
  });

  const select = (index, focus) => {
    tabs.forEach((tab, i) => {
      const selected = i === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      panels[i].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  };

  tabs.forEach((tab, i) => tab.addEventListener('click', () => select(i, false)));
  list.addEventListener('keydown', (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    let next = null;
    if (e.key === 'ArrowRight') next = (current + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') next = (current - 1 + tabs.length) % tabs.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = tabs.length - 1;
    if (next === null) return;
    e.preventDefault();
    select(next, true);
  });

  select(0, false);
  return root;
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

/**
 * Tabs block: rows of [tab label, panel content].
 * @param {Element} block
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [labelCell, contentCell] = row.children;
    return {
      label: labelCell?.textContent.trim() || '',
      content: contentCell ? [...contentCell.childNodes] : [],
    };
  });
  block.replaceChildren(buildTabs(items, { label: precedingHeading(block) || undefined }));
}
