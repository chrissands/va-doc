# Breadcrumb

| Breadcrumb |
|---|
| list of links; last item = current page (plain text) |
| optional note |

Renders `<nav aria-label="Breadcrumb"><ol>` with CSS chevron separators, a home icon on the
first link and `aria-current="page"` on the last item. The optional note is right-aligned
(small, with a dot). A breadcrumb-only section has no vertical margin (slim strip).
