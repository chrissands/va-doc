import { createIcon } from '../../scripts/scripts.js';

let carouselId = 0;

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
 * Text of the closest heading before the block (default content above it).
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
 * Builds one slide from an authored row [image, content].
 * Testimonial content: blockquote, **name**, role line, list of stats (**value** label).
 * @param {Element} row
 * @param {number} index
 * @param {number} total
 * @returns {HTMLElement}
 */
function buildSlide(row, index, total) {
  const slide = el('carousel-slide');
  slide.setAttribute('role', 'group');
  slide.setAttribute('aria-roledescription', 'slide');
  slide.setAttribute('aria-label', `${index + 1} of ${total}`);

  const picture = row.querySelector('picture');
  const contentCell = [...row.children].find((c) => !c.querySelector('picture') || c.querySelector('blockquote, h2, h3'))
    || row.lastElementChild;
  const body = el('carousel-body');
  // wrapTextNodes wraps a cell that starts with a blockquote in a <p>: unwrap it
  const wrapper = contentCell.children.length === 1 && contentCell.firstElementChild;
  const wrapped = wrapper?.tagName === 'P' && wrapper.querySelector('blockquote, p, ul, ol');
  body.append(...(wrapped ? wrapper.childNodes : contentCell.childNodes));

  const media = el('carousel-media', 'figure');
  if (picture) media.append(picture);

  // name (bold paragraph) + role line become the image caption
  const name = [...body.querySelectorAll(':scope > p')].find((p) => p.firstElementChild?.tagName === 'STRONG'
    && p.textContent.trim() === p.firstElementChild.textContent.trim());
  if (name) {
    const caption = el('carousel-caption', 'figcaption');
    const role = name.nextElementSibling?.tagName === 'P' ? name.nextElementSibling : null;
    name.className = 'carousel-name';
    caption.append(name);
    if (role) {
      role.className = 'carousel-role';
      caption.append(role);
    }
    media.append(caption);
  }

  const quote = body.querySelector('blockquote');
  if (quote) {
    quote.classList.add('carousel-quote');
    quote.before(createIcon('format-quote'));
  }

  body.querySelectorAll(':scope > ul').forEach((ul) => {
    if (![...ul.children].every((li) => li.firstElementChild?.tagName === 'STRONG')) return;
    ul.className = 'carousel-stats';
    [...ul.children].forEach((li) => {
      const strong = li.querySelector('strong');
      const value = el('carousel-stat-value', 'span');
      value.textContent = strong.textContent.trim();
      strong.remove();
      const label = el('carousel-stat-label', 'span');
      label.textContent = li.textContent.trim();
      li.replaceChildren(value, label);
    });
  });

  if (picture) slide.append(media);
  else slide.classList.add('no-image');
  slide.append(body);
  return slide;
}

/**
 * Carousel (variant testimonials): rows of [image, content]. Manual navigation only:
 * previous/next buttons, dot buttons, slide counter, arrow keys while focus is inside.
 * @param {Element} block
 */
export default function decorate(block) {
  carouselId += 1;
  const rows = [...block.children];
  const total = rows.length;
  const label = precedingHeading(block) || 'Highlights';
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', label);

  const track = el('carousel-track');
  track.id = `carousel-${carouselId}-slides`;
  track.setAttribute('aria-live', 'polite');
  const slides = rows.map((row, i) => buildSlide(row, i, total));
  track.append(...slides);

  const nav = el('carousel-nav');
  const prev = el('carousel-prev', 'button');
  const next = el('carousel-next', 'button');
  [prev, next].forEach((b, i) => {
    b.type = 'button';
    b.setAttribute('aria-controls', track.id);
    b.setAttribute('aria-label', i ? 'Next slide' : 'Previous slide');
    b.append(createIcon(i ? 'chevron-right' : 'chevron-left'));
  });

  const dots = el('carousel-dots');
  const dotButtons = slides.map((s, i) => {
    const dot = el('carousel-dot', 'button');
    dot.type = 'button';
    dot.setAttribute('aria-controls', track.id);
    dot.setAttribute('aria-label', `Show slide ${i + 1} of ${total}`);
    dots.append(dot);
    return dot;
  });

  const counter = el('carousel-counter', 'p');
  counter.setAttribute('aria-hidden', 'true');

  let current = 0;
  const show = (index) => {
    current = (index + total) % total;
    slides.forEach((s, i) => {
      const active = i === current;
      s.classList.toggle('active', active);
      s.setAttribute('aria-hidden', String(!active));
      s.inert = !active;
    });
    dotButtons.forEach((d, i) => {
      if (i === current) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
    counter.textContent = `${current + 1} / ${total}`;
  };

  prev.addEventListener('click', () => show(current - 1));
  next.addEventListener('click', () => show(current + 1));
  dotButtons.forEach((d, i) => d.addEventListener('click', () => show(i)));
  block.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (e.target.closest('input, textarea, select')) return;
    e.preventDefault();
    show(current + (e.key === 'ArrowRight' ? 1 : -1));
  });

  nav.append(prev, dots, counter, next);
  block.replaceChildren(track);
  if (total > 1) block.append(nav);
  else block.classList.add('single');
  block.showSlide = show;
  show(0);
}

/**
 * Shows a slide programmatically (used by the Universal Editor integration in ue/scripts).
 * @param {Element} block decorated carousel block
 * @param {number} index slide index
 */
export function showSlide(block, index) {
  if (typeof block.showSlide === 'function') block.showSlide(Number(index));
}
