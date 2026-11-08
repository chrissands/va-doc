# Form block

Renders an accessible form from a sheet definition (local JSON now, a DA spreadsheet later).

## Content model

| form |  |
|---|---|
| [/vce/forms/release-request.json](/vce/forms/release-request.json) | |
| Submit To | https://example.com/endpoint *(optional)* |

- Row 1: link to the definition (`{ data: [rows], ":type": "sheet" }`). The `<form>` id is the file
  name without `.json` (e.g. `release-request`).
- `Submit To`: when present the form POSTs `{ data: {...} }` as JSON and shows an error alert on
  failure. When absent the form runs in **demo mode**: no network call, a success panel
  "Demo submission received — no backend is connected" with a reference such as `REL-2026-0042`.

## Definition columns

Name, Type, Label, Placeholder, Value, Options (comma list), Mandatory (`true`), Style
(`half` | `full` | `alert` | `divider` | `link`), Fieldset, Description (hint), Pattern (regex),
Accept, Multiple, Max (MB, cumulative for files), ReadOnly.

Types: text, email, tel, select, textarea, checkbox, radio, file, date (`Value: today`), heading,
plaintext, captcha, summary, submit, button. Unknown types render as text.

- Consecutive rows with the same Fieldset become a `<fieldset>`; its first heading row is the legend.
- `half` fields sit two per row when the form is at least 360px wide (container query).
- Validation runs on blur (after the field was changed), on submit, and live once an error shows.
  An error summary (role=alert) links to each invalid field. Known patterns (3-digit agency code,
  5-digit ZIP, virginia.gov email, 7-digit State ID, phone) get specific messages.
- `captcha` is a **demo placeholder** (random code, spelled out for screen readers, refresh
  button). Replace with the Commonwealth CAPTCHA service before launch.
- `summary` renders a live submission summary panel (units, line items, files, review time,
  valuation, status tag) and hosts the submit/button rows. Values come from the `line-items` block
  (`line-items:change` event).
- `button` rows have no backend in the demo; clicking shows a status message.

## Layout

- In a section with style `form-layout` the block builds a two-column layout: main column
  (wrappers up to the form) and a sticky `<aside class="form-sidebar">` with the summary panel and
  the section's later wrappers. Stacks on mobile.
- Elsewhere the block is a white card. In a `split` section a heading directly before the block
  becomes the card title.

## Reuse

```js
import { createForm } from '../form/form.js';
const form = await createForm('/forms/offender-locator.json', { onSubmit, validate });
```

`options`: `id`, `onSubmit(data, form)`, `validate(form) => [{ name, message }]`, `submitTo`.
Controls outside the form element can take part via the `form` attribute (see `line-items`); they
are validated with the constraint API (`data-label`, `data-required-message` customise messages).
