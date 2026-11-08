/**
 * Multi-site registry. Every site is a top-level content folder that shares this code base;
 * VADOC is the root site. Adding a site = add an entry here + a content folder with its own
 * nav, footer and pages (see README "Adding a new site").
 */
export const SITES = [
  {
    id: 'vadoc', folder: '', home: '/', short: 'VADOC', name: 'Virginia Department of Corrections', theme: 'vadoc',
  },
  {
    id: 'bolrj', folder: '/bolrj', home: '/bolrj/', short: 'BLRJ', name: 'Board of Local & Regional Jails', theme: 'bolrj',
  },
  {
    id: 'vpb', folder: '/vpb', home: '/vpb/', short: 'VPB', name: 'Virginia Parole Board', theme: 'vpb',
  },
  {
    id: 'vce', folder: '/vce', home: '/vce/modular-office-systems', short: 'VCE', name: 'Virginia Correctional Enterprises', theme: 'vce',
  },
];

/**
 * Local preview serves documents under a /content mount (production serves them at the root).
 * Every content path the code builds goes through contentPath() so it works in both places.
 */
export const CONTENT_ROOT = /^\/content(\/|$)/.test(window.location.pathname) ? '/content' : '';

/** Code-bus folders that are never content paths. */
const CODE_PATHS = /^\/(blocks|scripts|styles|icons|images|fonts|libs|tools|media_)/;

/**
 * @param {string} path site-absolute content path, e.g. /bolrj/nav
 * @returns {string} the same path, prefixed with the local content mount when needed
 */
export function contentPath(path) {
  if (!CONTENT_ROOT || !path || !path.startsWith('/') || path.startsWith(`${CONTENT_ROOT}/`) || CODE_PATHS.test(path)) return path;
  return `${CONTENT_ROOT}${path}`;
}

/**
 * The site a path belongs to: the deepest matching site folder, VADOC (root) otherwise.
 * @param {string} [pathname]
 */
export function getSite(pathname = window.location.pathname) {
  const p = CONTENT_ROOT && pathname.startsWith(CONTENT_ROOT) ? pathname.slice(CONTENT_ROOT.length) || '/' : pathname;
  return SITES
    .filter((s) => s.folder && (p === s.folder || p.startsWith(`${s.folder}/`)))
    .sort((a, b) => b.folder.length - a.folder.length)[0] || SITES[0];
}

/**
 * Path of a site-level fragment (nav, footer…) for the current page's site.
 * @param {string} name fragment name
 * @param {string} [pathname]
 */
export function siteFragmentPath(name, pathname) {
  return contentPath(`${getSite(pathname).folder}/${name}`);
}

/**
 * Rewrites same-origin content links for the local /content mount (no-op in production).
 * @param {Element} element container
 */
export function localizeLinks(element) {
  if (!CONTENT_ROOT) return;
  element.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (href.startsWith('/') && !href.startsWith('//')) a.setAttribute('href', contentPath(href));
  });
}
