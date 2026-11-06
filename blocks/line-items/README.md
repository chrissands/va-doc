# Line Items

Repeatable item table with client-side totals, submitted with a form block on the same page.

| Line Items | |
| --- | --- |
| Title | heading + subtitle |
| Form | id of the form to submit with (the definition's file name, e.g. `release-request`) |
| Columns | Description, Mfg / Alt Vendor / PO #, Item # / SKU, Item Type, Qty, Price (ea), Total, Reason |
| Item Types | comma-separated options |
| Reasons | comma-separated options |
| Item | optional sample row: description; vendor/PO; item #; type; qty; price; reason |

The inputs join the form through the HTML `form` attribute. The block fires `line-items:change`
(`{ form, units, lines, total }`) on `document`. Below a 720px container width the table becomes stacked cards.
