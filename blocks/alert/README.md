# Alert

Full-width notice bar; content is constrained to `--content-width`. Rendered as an
`<aside aria-label="…">` landmark (label = bold lead-in text, else "Alert" / "Notice").

## Content model

| Alert (variant) |
|---|
| **Lead-in:** message text · optional extra lines · optional link |

- First text paragraph = lead (a bold `Label:` is the lead-in; if nothing is bold, the text
  before the first `: ` is bolded).
- Further paragraphs = detail lines (the value after `Label: ` is bolded).
- Paragraphs holding only a link = action link.
- An optional `:icon-name:` in the cell overrides the icon.

## Variants

- `warning` (default): orange bar, navy text, warning icon, dismiss button ("Dismiss alert");
  the dismissal is remembered for the session (`sessionStorage`, keyed by the alert text).
- `info`: theme header colour, white text, gavel icon (statutory text) or info icon; no dismiss.
