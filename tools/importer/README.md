# Content importer (Stitch designs → EDS documents)

Source: the six Stitch `code.html` design exports, served locally (e.g. `python3 -m http.server 8001`
from a folder holding `vadoc.html`, `bolrj.html`, `vpb.html`, `vce-plp.html`, `vce-pdp.html`,
`vce-release.html`), plus live-site menu structure embedded in `page-templates.json`.

- `page-templates.json`: one template per page type (URLs, target path, metadata, section map,
  parser hints, block selectors). `site-fragments` builds every site's `nav` / `footer`.
- `parsers/*.js`: one per block (self-contained, run inside the importer page).
- `transformers/`: `cleanup` (drops design chrome), `sections` (section breaks, section styles,
  default content), `metadata` (page metadata incl. `Theme`).
- `generate-import-scripts.mjs`: writes `import-<template>.js` from `page-templates.json`.

Run: `node tools/importer/generate-import-scripts.mjs`, bundle with `aem-import-helper`, then run the
bulk importer for each template; output is `content/<path>.plain.html`.
