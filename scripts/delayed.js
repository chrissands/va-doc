// add delayed functionality here

// Load USWDS JavaScript only on pages that actually render USWDS (usa-*) components;
// the agency design system blocks do not need it.
if (document.querySelector('main [class*="usa-"]:not(.usa-prose)')) {
  const uswdsScript = document.createElement('script');
  uswdsScript.src = '/libs/uswds/uswds.min.js';
  uswdsScript.nonce = 'aem';
  document.body.appendChild(uswdsScript);
}
