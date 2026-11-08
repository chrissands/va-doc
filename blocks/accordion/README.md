# Accordion

Rows = `[label, content]`, rendered as native `<details>` / `<summary>` (first item open,
44px targets, keyboard operable natively).

## Variants

- `meetings`: in each panel, a meeting = H3 + a paragraph starting with **MAR 19** (date badge;
  the rest is split on ` · ` into a type tag + meta) + location paragraph + links (plain links
  become secondary buttons) + optional `Associated Committee Agendas:` paragraph and list.
  Committee items: `**Name** time — description — file label` (3-column mini-cards). Meetings
  marked concluded / archived get a gray date badge.
