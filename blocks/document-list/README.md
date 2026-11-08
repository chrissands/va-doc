# Document list

| Document List (variant) | | | | | |
|---|---|---|---|---|---|
| group | **title** | description | meta (`PDF · Published Jan 12, 2025 · File Size: 6.4 MB`) | link | badge (optional) |

- Rows with the same group are listed together; more than one group = tabs (`Group (count)`,
  built with `buildTabs`); a single group = no tabs.
- Meta is split on ` · `; a short first segment without digits (`PDF`, `Certified`) becomes a tag.
- Download links get an icon and are described by the document title (`aria-describedby`).

## Variants

- default: list rows — document icon, meta line (tags, date, size), H3 title, description,
  primary download button.
- `tiles`: 3-column cards — H3 + badge tag, stats line, meta with icons, full-width download
  button. Titles containing "Annual" are featured (tinted).
