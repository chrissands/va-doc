# Hero

## Content model

| Hero (variant) |
|---|
| image (optional) |
| eyebrow paragraph · **H1** · text · list · optional blockquote · CTA links |

- Paragraph(s) before the H1 = eyebrow chip. A short paragraph right after the H1 that is
  followed by more text = subtitle.
- A list where every item starts with **bold** = stats (`**22.3%** Label · Sub-label`); any
  other list = feature chips (add `:icon:` to an item to choose its icon; default check mark).
- Blockquote = mission quote. Standalone links = CTAs (**bold** primary, *italic* secondary,
  plain = ghost button).
- First image gets `loading=eager` + `fetchpriority=high` (LCP). Heights are reserved
  (min-height / aspect-ratio) to avoid layout shift.
- A `locator-search` block in the same section is moved into the hero as its right column
  (7/5 grid on desktop, stacked on mobile).

## Variants

- default: full-bleed image with a navy gradient overlay, white text, stat chips.
- `dark`: theme header colour, no image; the stats render as a panel on the right (long values
  as a wide row with a verified icon).
- `split`: content left, image right in a rounded frame. With a blockquote the hero becomes a
  white card with the image flush right.
