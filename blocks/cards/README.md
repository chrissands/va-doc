# Cards

## Content model

Each row is one card: `[image | :icon:, content]`, or a single content cell (add the
`no images` variant). Content: paragraphs before the heading are lead lines (eyebrow / tag),
then the heading (H3), text and links.

## Variants (combine with `no images`)

- `audience`: portal tiles — icon + eyebrow ("Portal 01"), H3, text, footer link with arrow.
  The whole tile is clickable through a stretched link (still one tab stop). Use in an
  `overlap` section to pull the tiles over the hero.
- `icon-links`: steps — icon square, H3, text, full-width button (bold / italic link).
- `news`: 16:9 image; lead 1 = category tag over the image, lead 2 = date / place line.
  Without images: lead `Category Feb 21, 2025` = tag + date; a trailing plain paragraph = meta
  beside the link.
- `icon`: icon, eyebrow ("Mandate 01"), H3, text, link. A card with **two** lead paragraphs is
  featured (dark, spans 2 columns): lead 1 = badge, lead 2 = eyebrow; a short plain paragraph
  before its button = footer note.
- `member`: portrait 4:5, lead = role tag over the image, H3 name, title, bio; remaining
  paragraphs = meta footer.
- `document`: lead `Form VPB-101 Rev. 01/2024` = tag + revision, H3, text,
  `Eligibility Criteria:` + list in a tinted box, full-width primary button.
- `stats`: three paragraphs — big value, label, caption (one white ribbon).
