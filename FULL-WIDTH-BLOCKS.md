# Full-Width Blocks

## Overview

Some USWDS components are designed to span edge-to-edge (full viewport width) for maximum visual impact. This document explains how full-width blocks are implemented in this project.

## Full-Width Blocks

The following blocks are configured to go edge-to-edge:

### 1. **Hero Block** (`blocks/hero/`)
- **Background image** extends full viewport width
- **Callout content** is constrained within USWDS grid
- Used for prominent page headers and landing page headers

### 2. **Alert Block** (`blocks/alert/`)
- **Background color** extends full viewport width
- **Alert content** is constrained within USWDS grid
- Used for important notifications, status messages, and site-wide announcements

### 3. **Banner Block** (`blocks/banner/`)
- **Background color** extends full viewport width
- Government site identification banner
- Located in `<header>`, not `<main>`, so not affected by section constraints

## Implementation

### 1. Exclude from Section Container (`styles/styles.css`)

The default section container constrains content to `max-width: 64rem` (1024px). Full-width blocks are excluded using `:not()` selectors:

```css
/* Default content container - constrained to USWDS grid max-width 
   Exclude full-width blocks that need edge-to-edge layout */
main > .section > div:not(.hero):not(.alert):not(.banner) {
  max-width: 64rem; /* Match USWDS grid-container max-width */
  margin: auto;
  padding: 0 1rem;
}
```

### 2. Add Full-Width Overrides (Block CSS)

Each full-width block uses the **viewport width technique** to break out of container constraints:

```css
/* Example from blocks/hero/hero.css */
.hero.block {
  max-width: none !important;
  width: 100vw !important;
  margin-left: calc(50% - 50vw) !important;
  margin-right: calc(50% - 50vw) !important;
  padding: 0 !important;
}
```

**How the viewport width technique works:**
- `width: 100vw` makes the element span the full viewport width
- `margin-left: calc(50% - 50vw)` creates a negative margin to pull the element left
- `margin-right: calc(50% - 50vw)` creates a negative margin to pull the element right
- This effectively breaks the element out of any parent container constraints
- The element remains centered while spanning edge-to-edge

**Alternative approach for blocks with `display: contents`:**

```css
/* Example from blocks/alert/alert.css */
.alert.block {
  display: contents; /* Remove wrapper from layout */
}

.alert.block .usa-alert {
  max-width: none !important;
  width: 100vw !important;
  margin-left: calc(50% - 50vw) !important;
  margin-right: calc(50% - 50vw) !important;
}
```

### 3. USWDS Grid Container

Inside full-width blocks, USWDS components use `.grid-container` to constrain content:

```html
<div class="usa-hero"> <!-- Full width -->
  <div class="grid-container"> <!-- Constrained content -->
    <div class="usa-hero__callout">
      <!-- Content here -->
    </div>
  </div>
</div>
```

## Adding New Full-Width Blocks

To make a new block full-width:

### Step 1: Update `styles/styles.css`

Add the block class to the `:not()` exclusion list:

```css
main > .section > div:not(.hero):not(.alert):not(.banner):not(.your-block) {
  max-width: 64rem;
  margin: auto;
  padding: 0 1rem;
}

@media (width >= 64em) {
  main > .section > div:not(.hero):not(.alert):not(.banner):not(.your-block) {
    padding: 0 2rem;
  }
}
```

### Step 2: Add Block CSS Override

Add to your block's CSS file (e.g., `blocks/your-block/your-block.css`):

```css
/**
 * EDS Override styles for USWDS Your Block
 */

/* Make block full-width (edge-to-edge) using viewport width technique */
.your-block.block {
  max-width: none !important;
  width: 100vw !important;
  margin-left: calc(50% - 50vw) !important;
  margin-right: calc(50% - 50vw) !important;
  padding: 0 !important;
}
```

### Step 3: Use USWDS Grid Container

In your block's JavaScript decorator, wrap content in `.grid-container`:

```javascript
export default function decorate(block) {
  const container = document.createElement('div');
  container.className = 'usa-your-block';
  
  // Add grid container for content constraints
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid-container';
  
  // Add your content to gridContainer
  // ...
  
  container.appendChild(gridContainer);
  block.appendChild(container);
}
```

### Step 4: Update `.buildignore`

Add your block's CSS to `.buildignore` if it has custom overrides:

```
blocks/your-block/your-block.css
```

## Visual Examples

### Constrained Block (Default)

```
┌─────────────────────────────────────────┐
│          Browser Viewport                │
│                                          │
│    ┌─────────────────────────────┐     │
│    │   Content (max-width 64rem)  │     │
│    │   Centered with padding      │     │
│    └─────────────────────────────┘     │
│                                          │
└─────────────────────────────────────────┘
```

### Full-Width Block (Hero, Alert)

```
┌─────────────────────────────────────────┐
│┌───────────────────────────────────────┐│
││  Background (full viewport width)     ││
││    ┌─────────────────────────────┐   ││
││    │  Content (grid-container)    │   ││
││    │  Centered with padding       │   ││
││    └─────────────────────────────┘   ││
│└───────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

## Best Practices

### When to Use Full-Width

Use full-width blocks for:
- **Hero images** - Maximum visual impact for landing pages
- **Alerts/Announcements** - Draw attention across entire viewport
- **Banners** - Government site identification or site-wide notices
- **Backgrounds** - Colored or patterned backgrounds that need continuity

### When NOT to Use Full-Width

Don't use full-width for:
- **Regular content sections** - Use default constrained layout for readability
- **Forms** - Keep form width reasonable for usability
- **Cards/Tables** - Constrained width improves scannability
- **Text-heavy content** - Optimal line length is ~65-75 characters

### Accessibility Considerations

- **Don't rely on full-width alone** for visual hierarchy
- Ensure sufficient color contrast on full-width backgrounds
- Content within full-width blocks should still respect USWDS grid
- Test at various viewport sizes to ensure content remains readable

## Testing

Test full-width blocks at various breakpoints:

- **Mobile (320px)** - Should span full width, no horizontal scroll
- **Tablet (640px)** - Should span full width, content properly constrained
- **Desktop (1024px+)** - Background edge-to-edge, content centered with max-width

## Troubleshooting

### Block Not Going Full-Width

1. Check that block class is in `:not()` exclusion list in `styles.css`
2. Verify block CSS has `max-width: 100% !important`
3. Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)
4. Inspect element to check for conflicting styles

### Content Constrained When It Shouldn't Be

1. Check that content is inside `.grid-container` 
2. Verify USWDS grid utilities are applied correctly
3. Check for custom padding/margin on parent elements

### Background Not Extending to Edges

1. Verify block element has `width: 100%`
2. Check for padding on parent elements
3. Ensure no margin on the block element
4. Check browser DevTools for layout issues

## Related Documentation

- [USWDS Grid](https://designsystem.digital.gov/utilities/layout-grid/)
- [USWDS Hero](https://designsystem.digital.gov/components/hero/)
- [USWDS Alert](https://designsystem.digital.gov/components/alert/)
- [styles/styles.css](./styles/styles.css)
