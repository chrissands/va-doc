# Table

First row = column headers (`th scope=col`), following rows = data. Cells keep their content
(a lone paragraph is unwrapped). The table is labelled by the closest preceding heading; when it
overflows horizontally, its scroll container becomes a focusable `role=region`.

## Variants

- `documents`: column 1 = key (bold); a cell with a **bold title** + text = title & scope; the
  "Classification / Category / Type" column = tag (text containing "critical" = red tag); a cell
  holding only a link = small download button (PDF icon, accessible name includes the row
  title). Below 900px, rows become stacked cards labelled with the column headers (`data-label`).
