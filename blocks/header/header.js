/*
 * Header block: multi-site chrome (utility bar, brand row with search + tools, main nav with
 * mega-menus, mobile drawer). Content comes from the site's nav fragment (see sites.js):
 *   1. utility: statement p + ul of links
 *   2. brand: p > a (short name, href = site home) + p tagline
 *   3. tools: ul — first item = search page link (text = placeholder), <strong> links = CTA
 *      buttons, plain links = secondary text/icon links
 *   4. primary nav: ul — li with a nested ul = mega-menu; nested li with their own ul = groups
 * Colours come only from the --theme-* tokens set by the body theme class.
 */

import { getMetadata } from '../../scripts/aem.js';
import { createIcon } from '../../scripts/scripts.js';
import { CONTENT_ROOT, contentPath, siteFragmentPath } from '../../scripts/sites.js';
import { loadFragment } from '../fragment/fragment.js';

const DESKTOP = window.matchMedia('(width >= 900px)');
const FINE_POINTER = window.matchMedia('(hover: hover) and (pointer: fine)');
const HOVER_OPEN_DELAY = 150;
const HOVER_CLOSE_DELAY = 250;
const CART_KEY = 'vce-cart';

/** icons for utility links / CTAs, matched on link text or href */
const UTILITY_ICONS = [
  [/language|español|translat/i, 'translate'],
  [/accessib|contrast|size/i, 'accessibility-new'],
  [/^tel:|hotline|helpline/i, 'call'],
  [/sign.?in|log.?in|buyer/i, 'person'],
  [/punchout|gateway/i, 'sync-alt'],
];
const CTA_ICONS = [
  [/cart/i, 'shopping-cart'],
  [/emergency/i, 'emergency'],
  [/contact/i, 'contact-phone'],
  [/directory/i, 'location-city'],
];

/**
 * @param {Array} map [regexp, icon] pairs
 * @param {...string} values strings to test
 * @returns {string|undefined} icon name
 */
const pickIcon = (map, ...values) => map.find(([re]) => values.some((v) => re.test(v)))?.[1];

/**
 * Site-relative path without the local /content mount, trailing slash or index.
 * @param {string} pathname
 */
export function normalizePath(pathname) {
  let p = pathname;
  if (CONTENT_ROOT && (p === CONTENT_ROOT || p.startsWith(`${CONTENT_ROOT}/`))) p = p.slice(CONTENT_ROOT.length);
  p = p.replace(/(\/index)?\.html$/, '').replace(/\/index$/, '/');
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

/**
 * Whether a link points at the current page (hash links to sections of a page are ignored).
 * @param {HTMLAnchorElement} a
 */
function isCurrentPage(a) {
  const href = a.getAttribute('href') || '';
  if (!href || href.startsWith('#') || href.includes('#')) return false;
  const url = new URL(a.href, window.location.href);
  return url.origin === window.location.origin
    && normalizePath(url.pathname) === normalizePath(window.location.pathname);
}

/**
 * Creates a link with an optional leading icon.
 * @param {HTMLAnchorElement} source authored link
 * @param {string} className
 * @param {string} [icon]
 */
function makeLink(source, className, icon) {
  const a = document.createElement('a');
  a.href = source.getAttribute('href');
  a.className = className;
  if (icon) a.append(createIcon(icon));
  const label = document.createElement('span');
  label.textContent = source.textContent.trim();
  a.append(label);
  return a;
}

/**
 * Sum of item quantities in the VCE procurement cart.
 * @returns {number}
 */
function cartCount() {
  try {
    const items = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    if (!Array.isArray(items)) return 0;
    return items.reduce((n, i) => n + (Math.max(0, Number(i?.qty)) || 0), 0);
  } catch (e) {
    return 0;
  }
}

/**
 * Updates every cart count badge in the header.
 * @param {Element} block header block
 */
function refreshCart(block) {
  const count = cartCount();
  block.querySelectorAll('.header-cart-count').forEach((badge) => {
    badge.querySelector('[aria-hidden]').textContent = count > 99 ? '99+' : count;
    badge.querySelector('.visually-hidden').textContent = `, ${count} ${count === 1 ? 'item' : 'items'}`;
  });
}

/**
 * Search form posting `q` (GET) to the authored search page.
 * @param {HTMLAnchorElement} source authored link (href = search page, text = placeholder)
 * @param {string} siteName short site name for the label
 * @param {string} id unique input id
 */
function buildSearch(source, siteName, id) {
  const form = document.createElement('form');
  form.className = 'header-search';
  form.setAttribute('role', 'search');
  form.method = 'get';
  form.action = source.getAttribute('href');
  const label = document.createElement('label');
  label.className = 'visually-hidden';
  label.htmlFor = id;
  label.textContent = `Search ${siteName}`;
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.id = id;
  input.placeholder = source.textContent.trim();
  input.autocomplete = 'off';
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'header-search-submit';
  button.append(createIcon('search'));
  const text = document.createElement('span');
  text.className = 'visually-hidden';
  text.textContent = 'Submit search';
  button.append(text);
  form.append(label, input, button);
  return form;
}

/**
 * Utility bar: official statement left, links right.
 * @param {Element} section
 * @returns {{bar: Element, links: Element[]}}
 */
function buildUtility(section) {
  const bar = document.createElement('div');
  bar.className = 'header-utility';
  const inner = document.createElement('div');
  inner.className = 'header-inner';
  const statement = document.createElement('p');
  statement.className = 'header-utility-statement';
  const text = section?.querySelector('p')?.textContent.trim() || '';
  statement.append(createIcon('verified'));
  const span = document.createElement('span');
  span.textContent = text;
  statement.append(span);
  statement.title = text;
  inner.append(statement);
  const links = [...(section?.querySelectorAll('li > a') || [])].map((a) => makeLink(
    a,
    'header-utility-link',
    pickIcon(UTILITY_ICONS, a.textContent, a.getAttribute('href')),
  ));
  if (links.length) {
    const ul = document.createElement('ul');
    ul.className = 'header-utility-links';
    links.forEach((a) => {
      const li = document.createElement('li');
      li.append(a);
      ul.append(li);
    });
    inner.append(ul);
  }
  bar.append(inner);
  return { bar, links };
}

/**
 * Brand link: theme logo, short name and tagline.
 * @param {Element} section
 */
function buildBrand(section) {
  const source = section?.querySelector('a');
  const brand = document.createElement('a');
  brand.className = 'header-brand';
  brand.href = source?.getAttribute('href') || contentPath('/');
  const logo = document.createElement('span');
  logo.className = 'header-logo';
  logo.setAttribute('aria-hidden', 'true');
  const textWrap = document.createElement('span');
  textWrap.className = 'header-brand-text';
  const name = document.createElement('span');
  name.className = 'header-brand-name';
  name.textContent = source?.textContent.trim() || '';
  const tagline = document.createElement('span');
  tagline.className = 'header-brand-tagline';
  const taglineText = [...(section?.querySelectorAll('p') || [])].find((p) => !p.querySelector('a'))?.textContent.trim() || '';
  tagline.textContent = taglineText;
  const home = document.createElement('span');
  home.className = 'visually-hidden';
  home.textContent = ', home';
  textWrap.append(name, tagline, home);
  brand.append(logo, textWrap);
  return { brand, siteName: name.textContent };
}

/**
 * Tools: search form, CTA buttons and secondary links.
 * @param {Element} section
 * @param {string} siteName
 */
function buildTools(section, siteName) {
  const items = [...(section?.querySelectorAll(':scope ul > li') || [])];
  const [searchItem, ...rest] = items;
  const searchLink = searchItem?.querySelector('a');
  const ctas = [];
  const secondary = [];
  rest.forEach((li) => {
    const a = li.querySelector('a');
    if (!a) return;
    const text = a.textContent.trim();
    const href = a.getAttribute('href') || '';
    if (li.querySelector('strong, b')) {
      const cta = makeLink(a, 'button accent header-cta', pickIcon(CTA_ICONS, text, href));
      cta.querySelector('span:not(.icon)').className = 'header-cta-label';
      if (/\/cart(\/|$|\?)/.test(href) || /cart/i.test(text)) {
        cta.classList.add('header-cta-cart');
        const badge = document.createElement('span');
        badge.className = 'header-cart-count';
        const num = document.createElement('span');
        num.setAttribute('aria-hidden', 'true');
        const desc = document.createElement('span');
        desc.className = 'visually-hidden';
        badge.append(num, desc);
        cta.append(badge);
      }
      if (isCurrentPage(a)) cta.setAttribute('aria-current', 'page');
      ctas.push(cta);
    } else if (/account|profile|sign.?in/i.test(text)) {
      const link = makeLink(a, 'header-tool-link header-account', 'person');
      link.querySelector('span:not(.icon)').className = 'visually-hidden';
      secondary.push(link);
    } else {
      secondary.push(makeLink(a, 'header-tool-link'));
    }
  });
  return {
    search: searchLink ? (id) => buildSearch(searchLink, siteName, id) : null,
    ctas,
    secondary,
  };
}

/**
 * Text label of a nav item (first p, or the li's own text).
 * @param {Element} li
 */
function itemLabel(li) {
  const p = li.querySelector(':scope > p');
  if (p) return p.textContent.trim();
  return [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE).map((n) => n.textContent).join('').trim();
}

/**
 * List of links for a mega-menu column.
 * @param {Element[]} anchors
 */
function linkList(anchors) {
  const ul = document.createElement('ul');
  ul.className = 'header-mega-links';
  anchors.forEach((src) => {
    const li = document.createElement('li');
    const a = makeLink(src, 'header-mega-link');
    if (isCurrentPage(src)) a.setAttribute('aria-current', 'page');
    li.append(a);
    ul.append(li);
  });
  return ul;
}

/**
 * Builds the main nav list with mega-menu triggers and panels.
 * @param {Element} section
 */
function buildNav(section) {
  const nav = document.createElement('nav');
  nav.className = 'header-nav';
  nav.setAttribute('aria-label', 'Main');
  const list = document.createElement('ul');
  list.className = 'header-nav-list';
  const source = section?.querySelector('ul');
  [...(source?.children || [])].forEach((srcLi, i) => {
    const li = document.createElement('li');
    li.className = 'header-nav-item';
    const sub = srcLi.querySelector(':scope > ul');
    if (!sub) {
      const a = srcLi.querySelector('a');
      if (!a) return;
      const link = makeLink(a, 'header-nav-link');
      if (isCurrentPage(a)) link.setAttribute('aria-current', 'page');
      li.append(link);
      list.append(li);
      return;
    }
    const label = itemLabel(srcLi);
    const panelId = `header-mega-${i}`;
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'header-nav-trigger';
    trigger.id = `${panelId}-trigger`;
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', panelId);
    const text = document.createElement('span');
    text.textContent = label;
    trigger.append(text, createIcon('expand-more'));

    const panel = document.createElement('div');
    panel.className = 'header-mega';
    panel.id = panelId;
    const inner = document.createElement('div');
    inner.className = 'header-mega-inner';
    const title = document.createElement('p');
    title.className = 'header-mega-title';
    title.textContent = label;
    const columns = document.createElement('div');
    columns.className = 'header-mega-columns';
    let loose = [];
    const flushLoose = () => {
      if (!loose.length) return;
      const group = document.createElement('div');
      group.className = 'header-mega-group header-mega-group-loose';
      group.append(linkList(loose));
      columns.append(group);
      loose = [];
    };
    [...sub.children].forEach((child, j) => {
      const groupList = child.querySelector(':scope > ul');
      if (!groupList) {
        const a = child.querySelector('a');
        if (a) loose.push(a);
        return;
      }
      flushLoose();
      const group = document.createElement('div');
      group.className = 'header-mega-group';
      const heading = document.createElement('p');
      heading.className = 'header-mega-heading';
      heading.id = `${panelId}-group-${j}`;
      heading.textContent = itemLabel(child);
      const ul = linkList([...groupList.querySelectorAll(':scope > li > a, :scope > li > p > a')]);
      ul.setAttribute('aria-labelledby', heading.id);
      group.append(heading, ul);
      columns.append(group);
    });
    flushLoose();
    if (columns.querySelector('.header-mega-group-loose') && columns.children.length === 1) {
      columns.classList.add('header-mega-columns-flat');
    }
    inner.append(title, columns);
    panel.append(inner);
    if (panel.querySelector('[aria-current="page"]')) li.classList.add('is-current');
    li.classList.add('has-mega');
    li.append(trigger, panel);
    list.append(li);
  });
  nav.append(list);
  return nav;
}

/**
 * Wires mega-menu and drawer behaviour.
 * @param {Element} block header block
 */
function addBehaviour(block) {
  const items = [...block.querySelectorAll('.header-nav-item.has-mega')];
  const toggle = block.querySelector('.header-menu-toggle');
  const drawer = block.querySelector('.header-drawer');
  const timers = new WeakMap();

  const clearTimer = (item) => { clearTimeout(timers.get(item)); timers.delete(item); };
  const triggerOf = (item) => item.querySelector('.header-nav-trigger');
  const isOpen = (item) => triggerOf(item).getAttribute('aria-expanded') === 'true';

  const close = (item) => {
    clearTimer(item);
    triggerOf(item).setAttribute('aria-expanded', 'false');
    item.classList.remove('is-open');
    delete item.dataset.hoverOpen;
  };
  const open = (item, byHover = false) => {
    items.filter((other) => other !== item).forEach(close);
    clearTimer(item);
    triggerOf(item).setAttribute('aria-expanded', 'true');
    item.classList.add('is-open');
    if (byHover) item.dataset.hoverOpen = 'true';
    else delete item.dataset.hoverOpen;
  };
  const closeAll = () => items.forEach(close);

  const setDrawer = (expanded, { focusToggle = false } = {}) => {
    if (!toggle) return;
    toggle.setAttribute('aria-expanded', String(expanded));
    toggle.querySelector('.icon').replaceWith(createIcon(expanded ? 'close' : 'menu'));
    block.classList.toggle('drawer-open', expanded);
    document.body.classList.toggle('header-drawer-open', expanded);
    if (!expanded) closeAll();
    if (focusToggle) toggle.focus();
  };

  items.forEach((item) => {
    const trigger = triggerOf(item);
    trigger.addEventListener('click', () => {
      if (!isOpen(item)) open(item);
      else if (item.dataset.hoverOpen) delete item.dataset.hoverOpen; // pin a hover-opened menu
      else close(item);
    });
    trigger.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown') return;
      e.preventDefault();
      open(item);
      item.querySelector('.header-mega a')?.focus();
    });
    // hover-open only for precise pointers on desktop; click always works
    item.addEventListener('mouseenter', () => {
      if (!DESKTOP.matches || !FINE_POINTER.matches) return;
      clearTimer(item);
      if (isOpen(item)) return;
      timers.set(item, setTimeout(() => open(item, true), HOVER_OPEN_DELAY));
    });
    item.addEventListener('mouseleave', () => {
      if (!DESKTOP.matches || !FINE_POINTER.matches) return;
      clearTimer(item);
      if (!item.dataset.hoverOpen) return;
      timers.set(item, setTimeout(() => close(item), HOVER_CLOSE_DELAY));
    });
    item.addEventListener('focusout', (e) => {
      const leaving = e.relatedTarget && !item.contains(e.relatedTarget);
      if (DESKTOP.matches && isOpen(item) && leaving) close(item);
    });
  });

  block.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!DESKTOP.matches && block.classList.contains('drawer-open')) {
      e.preventDefault();
      setDrawer(false, { focusToggle: true });
      return;
    }
    const item = items.find(isOpen);
    if (item) {
      e.preventDefault();
      close(item);
      triggerOf(item).focus();
    }
  });

  document.addEventListener('click', (e) => {
    if (!DESKTOP.matches) return;
    items.filter((item) => isOpen(item) && !item.contains(e.target)).forEach(close);
  });

  // tabbing out of the open drawer (past its last link) closes it
  block.addEventListener('focusout', (e) => {
    const leaving = e.relatedTarget && !block.contains(e.relatedTarget);
    if (!DESKTOP.matches && leaving && block.classList.contains('drawer-open')) setDrawer(false);
  });

  toggle?.addEventListener('click', () => {
    setDrawer(toggle.getAttribute('aria-expanded') !== 'true');
  });
  // navigating within the page (hash links) closes the drawer / menus
  drawer?.addEventListener('click', (e) => {
    const a = e.target.closest('a[href*="#"]');
    if (!a) return;
    if (block.classList.contains('drawer-open')) setDrawer(false);
    else closeAll();
  });

  DESKTOP.addEventListener('change', () => {
    closeAll();
    if (block.classList.contains('drawer-open')) setDrawer(false);
  });

  // narrow desktops: the nav bar scrolls horizontally; fade the edge while more items follow
  const list = block.querySelector('.header-nav-list');
  if (list && drawer) {
    const updateOverflow = () => {
      const more = list.scrollWidth - list.clientWidth - list.scrollLeft > 1;
      drawer.classList.toggle('is-overflowing', DESKTOP.matches && more);
    };
    new ResizeObserver(updateOverflow).observe(list);
    list.addEventListener('scroll', updateOverflow, { passive: true });
    document.fonts?.ready.then(updateOverflow);
    list.addEventListener('wheel', (e) => {
      const overflowing = list.scrollWidth > list.clientWidth;
      if (!DESKTOP.matches || !overflowing || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      const max = list.scrollWidth - list.clientWidth;
      const next = Math.min(max, Math.max(0, list.scrollLeft + e.deltaY));
      if (next === list.scrollLeft) return;
      e.preventDefault();
      list.scrollLeft = next;
    }, { passive: false });
  }

  refreshCart(block);
  window.addEventListener('cart:updated', () => refreshCart(block));
  window.addEventListener('storage', (e) => { if (e.key === CART_KEY) refreshCart(block); });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? contentPath(new URL(navMeta, window.location).pathname) : siteFragmentPath('nav');
  const fragment = await loadFragment(navPath);
  block.textContent = '';
  if (!fragment) return;

  const sections = [...fragment.querySelectorAll(':scope > .section')]
    .map((s) => s.querySelector('.default-content-wrapper') || s);
  const [utilitySection, brandSection, toolsSection, navSection] = sections;

  const { bar, links: utilityLinks } = buildUtility(utilitySection);
  const { brand, siteName } = buildBrand(brandSection);
  const tools = buildTools(toolsSection, siteName);

  // brand row
  const brandRow = document.createElement('div');
  brandRow.className = 'header-brand-row';
  const brandInner = document.createElement('div');
  brandInner.className = 'header-inner';
  brandInner.append(brand);
  if (tools.search) brandInner.append(tools.search('header-search-input'));
  const toolsWrap = document.createElement('div');
  toolsWrap.className = 'header-tools';
  toolsWrap.append(...tools.ctas, ...tools.secondary);
  brandInner.append(toolsWrap);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'header-menu-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'header-drawer');
  toggle.setAttribute('aria-label', 'Menu');
  toggle.append(createIcon('menu'));
  brandInner.append(toggle);
  brandRow.append(brandInner);

  // nav bar (desktop) / drawer (mobile)
  const drawer = document.createElement('div');
  drawer.className = 'header-drawer';
  drawer.id = 'header-drawer';
  const drawerInner = document.createElement('div');
  drawerInner.className = 'header-inner';
  if (tools.search) {
    const drawerSearch = document.createElement('div');
    drawerSearch.className = 'header-drawer-search';
    drawerSearch.append(tools.search('header-drawer-search-input'));
    drawerInner.append(drawerSearch);
  }
  drawerInner.append(buildNav(navSection));
  const extras = document.createElement('div');
  extras.className = 'header-drawer-extras';
  const drawerCtas = tools.ctas.filter((c) => !c.classList.contains('header-cta-cart')).map((c) => c.cloneNode(true));
  const drawerLinks = [...tools.secondary, ...utilityLinks].map((a) => {
    const copy = a.cloneNode(true);
    copy.className = 'header-drawer-link';
    copy.querySelector('.visually-hidden')?.classList.remove('visually-hidden');
    return copy;
  });
  if (drawerCtas.length) {
    const ctaWrap = document.createElement('div');
    ctaWrap.className = 'header-drawer-ctas';
    ctaWrap.append(...drawerCtas);
    extras.append(ctaWrap);
  }
  if (drawerLinks.length) {
    const ul = document.createElement('ul');
    ul.className = 'header-drawer-links';
    drawerLinks.forEach((a) => {
      const li = document.createElement('li');
      li.append(a);
      ul.append(li);
    });
    extras.append(ul);
  }
  drawerInner.append(extras);
  drawer.append(drawerInner);

  block.append(bar, brandRow, drawer);
  addBehaviour(block);
}
