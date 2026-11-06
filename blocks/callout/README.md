# Callout

One row of cells; each cell's role is detected from its content:

| Callout (variant) | | | |
|---|---|---|---|
| `:icon:` (optional, icon only) | content | aside (optional, rich content) | actions (optional, links only) |

- Content: a paragraph before the heading = eyebrow; without a heading a short first paragraph
  is the title. Trailing paragraphs starting with a number = verified count list. A label
  paragraph followed by a phone / mail link paragraph = contact card. A short trailing line
  (no full stop) = footnote, shown with the actions in a footer.
- Actions: links become buttons (plain = secondary); `tel:` / `mailto:` get call / mail icons.
- Layout adapts to the callout's own width (container queries): actions on the right when wide,
  below when narrow (two callouts in a `two-up` section, a sidebar, mobile).

## Variants

`danger` (maroon tint, PREA), `dark` (theme header colour, accent primary button), `light`
(default; white, gray outside gray sections), `tint` (blue tint, contact cards, white aside
card), `warning` (light orange delivery notice), `notice` (gray legal advisory, gavel icon in a
maroon square).
