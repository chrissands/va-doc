# Header

Loads the site's nav fragment (`<site folder>/nav`, or page metadata `nav`). Fragment sections, in order:

1. **Utility bar**: a paragraph (official-site statement) + a list of links.
2. **Brand**: a link with the site's short name (to the site home) + a tagline paragraph.
3. **Tools**: a list. The first link becomes the search form (its text is the placeholder, its href the
   search page). **Bold** links become accent CTA buttons; other links are text/icon links.
4. **Primary navigation**: a list. An item with a nested list becomes a mega-menu; nested items
   with their own list become mega-menu columns.

Colours and the logo come from the `--theme-*` tokens. The header height equals `--header-height`,
so it causes no layout shift. The mega-menu supports Enter/Space, ArrowDown and Escape; below
900px it becomes a drawer. The VCE cart badge reads localStorage `vce-cart` and the
`cart:updated` event.
