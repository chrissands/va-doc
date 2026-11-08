import { createIcon } from '../../scripts/scripts.js';

/**
 * Turns a "stats" list (each item starts with a <strong> value) into stat chips:
 * value, label and optional sub-label ("Label · Sub-label").
 * @param {HTMLUListElement} ul
 */
function decorateStats(ul) {
  ul.className = 'hero-stats';
  [...ul.children].forEach((li) => {
    const strong = li.querySelector('strong');
    const value = document.createElement('span');
    value.className = 'hero-stat-value';
    value.textContent = strong.textContent.trim();
    strong.remove();
    const [label, sub] = li.textContent.trim().split(/\s+·\s+/);
    li.replaceChildren(value);
    const labelEl = document.createElement('span');
    labelEl.className = 'hero-stat-label';
    labelEl.textContent = label || '';
    li.append(labelEl);
    if (sub) {
      const subEl = document.createElement('span');
      subEl.className = 'hero-stat-sub';
      subEl.textContent = sub;
      li.append(subEl);
    }
    // long values (e.g. "100% Civilian Board") get a wide row in the dark stat panel
    if (value.textContent.length > 6) li.classList.add('hero-stat-wide');
  });
}

/**
 * Plain list of features: chips with an icon (authored :icon: or a check mark).
 * @param {HTMLUListElement} ul
 */
function decorateFeatures(ul) {
  ul.className = 'hero-features';
  [...ul.children].forEach((li) => {
    if (!li.querySelector('.icon')) li.prepend(createIcon('check-circle'));
  });
}

/**
 * Hero: optional image row + content row (eyebrow, h1, text, stats list, quote, CTAs).
 * Variants: default (full-bleed image, navy overlay), dark (no image, stat panel), split.
 * A locator-search block in the same section becomes the hero's right column.
 * @param {Element} block
 */
export default function decorate(block) {
  const variant = ['dark', 'split'].find((v) => block.classList.contains(v)) || 'default';
  const picture = block.querySelector('picture');
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const contentCell = cells.find((c) => c.querySelector('h1, h2'))
    || cells.find((c) => !c.querySelector('picture')) || cells[0];

  const content = document.createElement('div');
  content.className = 'hero-content';
  const actions = document.createElement('div');
  actions.className = 'hero-actions';

  const heading = contentCell.querySelector('h1, h2');
  let seenHeading = false;
  let prev = null;
  [...contentCell.children].forEach((el) => {
    const previous = prev;
    prev = el;
    if (el.querySelector('picture')) return;
    if (el === heading) seenHeading = true;
    const link = el.querySelector(':scope > a, :scope > strong > a, :scope > em > a');
    const linkOnly = el.tagName === 'P' && link && el.textContent.trim() === link.textContent.trim();
    if (el.classList.contains('button-container') || el.classList.contains('button-group') || linkOnly) {
      if (linkOnly && !el.classList.contains('button-container')) {
        link.className = 'button ghost';
        el.classList.add('button-container');
      }
      actions.append(el);
      return;
    }
    if (!seenHeading && el.tagName === 'P') {
      el.classList.add('hero-eyebrow');
    } else if (el.tagName === 'UL') {
      const isStats = [...el.children].every((li) => li.firstElementChild?.tagName === 'STRONG');
      if (isStats) decorateStats(el);
      else decorateFeatures(el);
    } else if (el.tagName === 'BLOCKQUOTE') {
      el.classList.add('hero-quote');
    } else if (el.tagName === 'P' && previous === heading) {
      // a short line straight after the title, followed by more text, is a subtitle
      const next = el.nextElementSibling;
      if (next?.tagName === 'P' && !next.querySelector('a') && el.textContent.length < 140) {
        el.classList.add('hero-subtitle');
      }
    }
    content.append(el);
  });
  if (actions.children.length) content.append(actions);

  const inner = document.createElement('div');
  inner.className = 'hero-inner';
  inner.append(content);

  // dark: the stats become a panel on the right
  const stats = content.querySelector('.hero-stats');
  if (variant === 'dark' && stats) {
    const panel = document.createElement('div');
    panel.className = 'hero-panel';
    stats.querySelectorAll('.hero-stat-wide').forEach((li) => li.prepend(createIcon('verified')));
    panel.append(stats);
    inner.append(panel);
  }

  const children = [];
  if (picture) {
    const img = picture.querySelector('img');
    img.loading = 'eager';
    img.fetchPriority = 'high';
    img.setAttribute('fetchpriority', 'high');
    const media = document.createElement('div');
    media.className = 'hero-media';
    media.append(picture);
    if (variant === 'split') inner.append(media);
    else children.push(media);
  } else {
    block.classList.add('no-image');
  }
  children.push(inner);

  // adjacency: a locator search in the same section becomes the right column
  const locator = block.closest('.section')?.querySelector(':scope > .locator-search-wrapper');
  if (locator) {
    locator.classList.add('hero-aside');
    inner.append(locator);
    block.classList.add('has-aside');
  }

  block.replaceChildren(...children);
}
