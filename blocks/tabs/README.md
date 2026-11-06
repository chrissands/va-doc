# Tabs

Rows = `[tab label, panel content]`. WAI-ARIA tabs pattern: roving tabindex, Arrow Left / Right,
Home / End (automatic activation), `aria-selected`, `aria-controls`, `hidden` panels, underline
style. The tab list is labelled by the closest preceding heading.

## Reuse from other blocks

```js
import { buildTabs, loadTabsStyles } from '../tabs/tabs.js';

await loadTabsStyles(); // tabs.css (styles are scoped to .tabs-component)
block.append(buildTabs([{ label: 'One', content: nodeOrNodes }], { label: 'Accessible name' }));
```
