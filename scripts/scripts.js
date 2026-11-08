import {
  buildBlock,
  loadHeader,
  loadFooter,
  decorateBlocks,
  decorateTemplateAndTheme,
  getMetadata,
  waitForFirstImage,
  loadSection,
  loadSections,
  loadCSS,
  sampleRUM,
  readBlockConfig,
  toClassName,
  toCamelCase,
} from './aem.js';
import { getSite, localizeLinks } from './sites.js';

/**
 * Buttons follow the standard EDS authoring convention:
 * a standalone link that is **bold** = primary button, *italic* = secondary (outline) button,
 * ***bold italic*** = accent (theme CTA colour) button. Plain standalone links stay links.
 * @param {Element} element container element
 */
export function decorateButtons(element) {
  element.querySelectorAll('a').forEach((a) => {
    a.title = a.title || a.textContent;
    if (a.href === a.textContent || a.querySelector('img') || a.closest('.button-container')) return;
    const up = a.parentElement;
    const twoup = up?.parentElement;
    const only = (el) => el && el.childNodes.length === 1;
    const block = (el) => only(el) && ['P', 'DIV', 'LI'].includes(el.tagName);
    const isStrong = (el) => el?.tagName === 'STRONG' || el?.tagName === 'B';
    const isEm = (el) => el?.tagName === 'EM' || el?.tagName === 'I';
    const nested = (isStrong(up) && isEm(twoup)) || (isEm(up) && isStrong(twoup));
    if (nested && only(up) && only(twoup) && block(twoup.parentElement)) {
      a.className = 'button accent';
      twoup.parentElement.classList.add('button-container');
    } else if (isStrong(up) && only(up) && block(twoup)) {
      a.className = 'button primary';
      twoup.classList.add('button-container');
    } else if (isEm(up) && only(up) && block(twoup)) {
      a.className = 'button secondary';
      twoup.classList.add('button-container');
    }
  });
}

/**
 * Consecutive buttons sit side by side in a .button-group. Runs after blocks are identified
 * (decorateBlocks treats section-level divs as blocks, so grouping must come later).
 * @param {Element} element container element
 */
export function groupButtons(element) {
  element.querySelectorAll('.button-container + .button-container').forEach((second) => {
    const first = second.previousElementSibling;
    if (first.parentElement.classList.contains('button-group')) return;
    const group = document.createElement('div');
    group.className = 'button-group';
    first.before(group);
    let n = first;
    while (n && n.classList?.contains('button-container')) {
      const next = n.nextElementSibling;
      group.append(n);
      n = next;
    }
  });
}

/**
 * Icons (:name: in documents) render as CSS masks so they inherit the text colour.
 * Icons are decorative; meaning is always carried by adjacent text.
 * @param {Element} element container element
 */
export function decorateIcons(element) {
  // :icon-name: notation the delivery pipeline has not converted yet (local preview)
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, {
    acceptNode: (n) => (/:[a-z][a-z0-9-]*:/.test(n.textContent) && !n.parentElement.closest('pre, code, script')
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
  });
  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const frag = document.createDocumentFragment();
    node.textContent.split(/(:[a-z][a-z0-9-]*:)/).forEach((part) => {
      const m = part.match(/^:([a-z][a-z0-9-]*):$/);
      if (m) {
        const span = document.createElement('span');
        span.className = `icon icon-${m[1]}`;
        frag.append(span);
      } else if (part) frag.append(part);
    });
    node.replaceWith(frag);
  });
  element.querySelectorAll('span.icon').forEach((span) => {
    if (span.dataset.iconName) return;
    const name = [...span.classList].find((c) => c.startsWith('icon-'))?.substring(5);
    if (!name) return;
    span.dataset.iconName = name;
    span.style.setProperty('--icon', `url('${window.hlx.codeBasePath}/icons/${name}.svg')`);
    span.setAttribute('aria-hidden', 'true');
  });
}

/**
 * Creates an icon element for use in block decoration.
 * @param {string} name icon file name in /icons
 * @returns {HTMLSpanElement}
 */
export function createIcon(name) {
  const span = document.createElement('span');
  span.className = `icon icon-${name}`;
  span.dataset.iconName = name;
  span.style.setProperty('--icon', `url('${window.hlx.codeBasePath}/icons/${name}.svg')`);
  span.setAttribute('aria-hidden', 'true');
  return span;
}

/**
 * Auto-generates a side nav from page headings and prepends it as the first section.
 * Called only when body has the `sidenav-left` template class.
 * @param {Element} main The container element
 */
function buildSideNavLeft(main) {
  const headings = [...main.querySelectorAll('h2, h3')];
  if (!headings.length) return;

  // Assign IDs to headings so the nav links can anchor to them
  headings.forEach((h) => {
    if (!h.id) h.id = toClassName(h.textContent.trim());
  });

  // Build USWDS sidenav structure with h2 → items, h3 → subitems
  const ul = document.createElement('ul');
  ul.className = 'usa-sidenav';

  const allLinks = [];
  let currentItem = null;
  let currentSublist = null;

  headings.forEach((h) => {
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent.trim();
    allLinks.push(a);

    if (h.tagName === 'H2') {
      const li = document.createElement('li');
      li.className = 'usa-sidenav__item';
      li.append(a);
      ul.append(li);
      currentItem = li;
      currentSublist = null;
    } else {
      if (!currentSublist) {
        currentSublist = document.createElement('ul');
        currentSublist.className = 'usa-sidenav__sublist';
        if (currentItem) currentItem.append(currentSublist);
        else ul.append(currentSublist);
      }
      const li = document.createElement('li');
      li.className = 'usa-sidenav__sublist-item';
      li.append(a);
      currentSublist.append(li);
    }
  });

  const navBlock = buildBlock('side-nav', [[ul]]);
  const navSection = document.createElement('div');
  navSection.append(navBlock);
  main.prepend(navSection);

  // Scroll spy: highlight the nav link for the heading currently in view
  requestAnimationFrame(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            allLinks.forEach((l) => l.classList.remove('usa-current'));
            const active = allLinks.find((l) => l.getAttribute('href') === `#${entry.target.id}`);
            if (active) active.classList.add('usa-current');
          }
        });
      },
      { rootMargin: '-10% 0px -80% 0px', threshold: 0 },
    );
    headings.forEach((h) => observer.observe(h));
  });
}

/**
 * Sa11y Accessibility Checker - Sidekick Toggle Plugin
 * Injects/removes Sa11y when the Accessibility button is clicked.
 * https://sa11y.netlify.app/
 */
const SA11Y_VERSION = '4';
const SA11Y_CSS_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/css/sa11y.min.css`;
const SA11Y_LANG_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/js/lang/en.umd.js`;
const SA11Y_JS_URL = `https://cdn.jsdelivr.net/gh/ryersondmp/sa11y@${SA11Y_VERSION}/dist/js/sa11y.umd.min.js`;

let sa11yActive = false;
let sa11yLoaded = false;

function injectCSS(url, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = url;
    link.onload = resolve;
    link.onerror = () => reject(new Error('Failed to load Sa11y CSS'));
    document.head.appendChild(link);
  });
}

function injectScript(url, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) { resolve(); return; }
    const script = document.createElement('script');
    script.id = id;
    script.src = url;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Failed to load Sa11y script'));
    document.head.appendChild(script);
  });
}

async function loadSa11y() {
  if (sa11yLoaded) return;

  await injectCSS(SA11Y_CSS_URL, 'sa11y-injected-styles');
  await injectScript(SA11Y_LANG_URL, 'sa11y-lang-script');
  await new Promise((r) => { setTimeout(r, 100); });
  await injectScript(SA11Y_JS_URL, 'sa11y-main-script');

  // Wait for Sa11y to be available
  await new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      attempts += 1;
      if (window.Sa11y && window.Sa11yLangEn) resolve();
      else if (attempts > 50) reject(new Error('Sa11y load timeout'));
      else setTimeout(check, 100);
    };
    check();
  });

  window.Sa11y.Lang.addI18n(window.Sa11yLangEn.strings);
  sa11yLoaded = true;
}

async function startSa11y() {
  if (sa11yActive) return;

  try {
    await loadSa11y();

    window.sa11yInstance = new window.Sa11y.Sa11y({
      checkRoot: 'main, [role="main"], .main-content, body',
      containerIgnore: '.sidekick-library, .hlx-sk, #hlx-sk, [data-aue-type], .aue-edit',
      showGoodLinkButton: true,
      showHinPageOutline: true,
      detectPageLanguage: true,
      panelPosition: 'left',
    });

    sa11yActive = true;
    // eslint-disable-next-line no-console
    console.log('[Sa11y] Started');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Sa11y] Error starting:', error);
  }
}

function stopSa11y() {
  if (!sa11yActive) return;

  try {
    if (window.sa11yInstance) {
      try { window.sa11yInstance.destroy(); } catch (e) { /* ignore */ }
      delete window.sa11yInstance;
    }

    // Remove Sa11y UI elements (keep scripts/styles loaded for re-use)
    [
      '#sa11y-container', '#sa11y-panel', '#sa11y-toast-container',
      '#sa11y-control-panel', '.sa11y-annotation', '.sa11y-instance',
    ].forEach((sel) => {
      document.querySelectorAll(sel).forEach((el) => {
        try { el.remove(); } catch (e) { /* ignore */ }
      });
    });

    // Remove Sa11y custom elements (web components with shadow DOM)
    [
      'sa11y-control-panel', 'sa11y-panel', 'sa11y-annotation',
      'sa11y-heading-label', 'sa11y-heading-anchor', 'sa11y-tooltips',
    ].forEach((tagName) => {
      document.querySelectorAll(tagName).forEach((el) => {
        try { el.remove(); } catch (e) { /* ignore */ }
      });
    });

    sa11yActive = false;
    // eslint-disable-next-line no-console
    console.log('[Sa11y] Stopped');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Sa11y] Error stopping:', error);
  }
}

function toggleSa11y() {
  if (sa11yActive) {
    stopSa11y();
  } else {
    startSa11y();
  }
}

// Listen for sidekick sa11y event
function initSa11ySidekick() {
  const sk = document.querySelector('aem-sidekick');
  if (sk) {
    sk.addEventListener('custom:sa11y', toggleSa11y);
  } else {
    document.addEventListener('sidekick-ready', () => {
      document.querySelector('aem-sidekick')?.addEventListener('custom:sa11y', toggleSa11y);
    }, { once: true });
  }
}

initSa11ySidekick();

/**
 * Builds hero block and prepends to main in a new section.
 * @param {Element} main The container element
 */
function buildHeroBlock(main) {
  const h1 = main.querySelector('h1');
  const picture = main.querySelector('picture');
  // eslint-disable-next-line no-bitwise
  if (h1 && picture && (h1.compareDocumentPosition(picture) & Node.DOCUMENT_POSITION_PRECEDING)) {
    const section = document.createElement('div');
    section.append(buildBlock('hero', { elems: [picture, h1] }));
    main.prepend(section);
  }
}

/**
 * load fonts.css and set a session storage flag
 */
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) sessionStorage.setItem('fonts-loaded', 'true');
  } catch (e) {
    // do nothing
  }
}

function autolinkModals(doc) {
  doc.addEventListener('click', async (e) => {
    const origin = e.target.closest('a');
    if (origin && origin.href && origin.href.includes('/modals/')) {
      e.preventDefault();
      const { openModal } = await import(`${window.hlx.codeBasePath}/blocks/modal/modal.js`);
      openModal(origin.href);
    }
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    if (!main.querySelector('.hero')) buildHeroBlock(main);
    if (document.body.classList.contains('sidenav-left')) buildSideNavLeft(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * Decorates all sections in a container element.
 * @param {Element} main The container element
 */
function decorateSections(main) {
  main.querySelectorAll(':scope > div').forEach((section) => {
    const wrappers = [];
    let defaultContent = false;
    [...section.children].forEach((e) => {
      if (e.classList.contains('richtext')) {
        e.removeAttribute('class');
        if (!defaultContent) {
          const wrapper = document.createElement('div');
          wrapper.classList.add('default-content-wrapper', 'usa-prose');
          wrappers.push(wrapper);
          defaultContent = true;
        }
      } else if (e.tagName === 'DIV' || !defaultContent) {
        const wrapper = document.createElement('div');
        wrappers.push(wrapper);
        defaultContent = e.tagName !== 'DIV';
        if (defaultContent) wrapper.classList.add('default-content-wrapper', 'usa-prose');
      }
      wrappers[wrappers.length - 1].append(e);
    });

    // Add wrapped content back
    wrappers.forEach((wrapper) => section.append(wrapper));
    section.classList.add('section');
    section.dataset.sectionStatus = 'initialized';
    section.style.display = 'none';

    // Process section metadata
    const sectionMeta = section.querySelector('div.section-metadata');
    if (sectionMeta) {
      const meta = readBlockConfig(sectionMeta);
      Object.keys(meta).forEach((key) => {
        if (key === 'style') {
          const styles = meta.style
            .split(',')
            .filter((style) => style)
            .map((style) => toClassName(style.trim()));
          styles.forEach((style) => section.classList.add(style));
        } else {
          section.dataset[toCamelCase(key)] = meta[key];
        }
      });
      sectionMeta.parentNode.remove();
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  localizeLinks(main);
  decorateButtons(main);
  decorateIcons(main);
  buildAutoBlocks(main);
  decorateSections(main);
  decorateBlocks(main);
  groupButtons(main);
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
/**
 * Multi-site setup: theme class (page metadata "theme", else the site the folder belongs to),
 * skip link and main landmark target.
 * @param {Document} doc
 */
function decorateSite(doc) {
  const site = getSite();
  const theme = toClassName(getMetadata('theme')) || site.theme;
  doc.body.classList.add(`theme-${theme}`);
  doc.body.dataset.site = site.id;
  // commerce pages: start the catalog request while blocks load (mock provider only)
  const provider = getMetadata('commerce-provider') || 'mock';
  if (provider === 'mock' && doc.querySelector('main .product-detail, main .product-grid')) {
    const preload = doc.createElement('link');
    preload.rel = 'preload';
    preload.as = 'fetch';
    preload.crossOrigin = 'anonymous';
    preload.href = `${window.hlx.codeBasePath}/scripts/commerce/mock-catalog.json`;
    doc.head.append(preload);
  }
  const main = doc.querySelector('main');
  if (main && !doc.querySelector('body > .skip-link')) {
    main.id = main.id || 'main';
    main.tabIndex = -1;
    const skip = doc.createElement('a');
    skip.className = 'skip-link';
    skip.href = `#${main.id}`;
    skip.textContent = 'Skip to main content';
    doc.body.prepend(skip);
  }
}

async function loadEager(doc) {
  doc.documentElement.lang = 'en';
  decorateTemplateAndTheme();
  decorateSite(doc);

  // Load template CSS early (before body is revealed) to avoid layout shift
  const templateName = toClassName(getMetadata('template'));
  if (templateName) loadCSS(`${window.hlx.codeBasePath}/styles/templates/${templateName}.css`);

  // Set header variant for CSS height calculation (prevents CLS)
  const headerVariant = getMetadata('header') || getMetadata('header-variant') || 'basic';
  doc.body.dataset.headerVariant = headerVariant;

  if (getMetadata('breadcrumbs').toLowerCase() === 'true') {
    doc.body.dataset.breadcrumbs = true;
  }
  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    doc.body.classList.add('appear');
    // the LCP image may sit in the second section when the page opens with an alert bar
    const [first, second] = main.querySelectorAll('.section');
    await loadSection(first, waitForFirstImage);
    if (second && !first.querySelector('img')) await loadSection(second, waitForFirstImage);
  }

  sampleRUM.enhance();

  try {
    /* if desktop (proxy for fast connection) or fonts already loaded, load fonts.css */
    if (window.innerWidth >= 900 || sessionStorage.getItem('fonts-loaded')) {
      loadFonts();
    }
  } catch (e) {
    // do nothing
  }
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  autolinkModals(doc);

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  // idempotent: DA live preview swaps the body and calls loadPage() again while an
  // earlier run may still be in flight, so never add a second header/footer block
  const header = doc.querySelector('header');
  if (header && !header.querySelector(':scope > .header')) loadHeader(header);
  const footer = doc.querySelector('footer');
  if (footer && !footer.querySelector(':scope > .footer')) loadFooter(footer);

  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);
  loadFonts();

  const loadQuickEdit = async (...args) => {
    // eslint-disable-next-line import/no-cycle
    const { default: initQuickEdit } = await import('../tools/quick-edit/quick-edit.js');
    initQuickEdit(...args);
  };

  const addSidekickListeners = (sk) => {
    sk.addEventListener('custom:quick-edit', loadQuickEdit);
  };

  const sk = document.querySelector('aem-sidekick');
  if (sk) {
    addSidekickListeners(sk);
  } else {
    document.addEventListener('sidekick-ready', () => {
      addSidekickListeners(document.querySelector('aem-sidekick'));
    }, { once: true });
  }
}

/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
  // load anything that can be postponed to the latest here
}

async function loadSidekick() {
  if (document.querySelector('aem-sidekick')) {
    import('./sidekick.js');
    return;
  }

  document.addEventListener('sidekick-ready', () => {
    import('./sidekick.js');
  });
}

export async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
  loadSidekick();
}

// UE Editor support before page load
if (window.location.hostname.includes('ue.da.live')) {
  await import(`${window.hlx.codeBasePath}/ue/scripts/ue.js`).then(({ default: ue }) => ue());
}

loadPage();

(() => {
  const hasQE = new URL(window.location.href).searchParams.has('quick-edit');
  if (hasQE) import('../tools/quick-edit/quick-edit.js').then((mod) => mod.default());
})();

(function da() {
  const { searchParams } = new URL(window.location.href);

  const lp = searchParams.get('dapreview');
  // eslint-disable-next-line import/no-unresolved
  if (lp) import('https://da.live/scripts/dapreview.js').then((mod) => mod.default(loadPage));

  const exp = searchParams.get('daexperiment');
  // eslint-disable-next-line import/no-unresolved
  if (exp) import('https://da.live/nx/public/plugins/exp/exp.js');
}());
