# Typography Setup

## USWDS Fonts

This project uses the **U.S. Web Design System (USWDS)** typography system.

### Font Families

- **Body Text**: Source Sans Pro Web
  - Fallback stack: "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif
  - Clean, readable sans-serif font optimized for government websites
  
- **Headings**: Merriweather Web
  - Fallback stack: Georgia, Cambria, "Times New Roman", Times, serif
  - Classic serif font that provides strong visual hierarchy

- **Monospace/Code**: Roboto Mono Web (for `<code>` elements)
  - Used for technical content, code samples, and data tables

- **Alternative Body**: Public Sans Web (available but not used by default)
  - Can be configured in `uswds.config.js` if desired

### Font Files

Font files are located in `/fonts/` and organized by family:

```
/fonts/
  ├── source-sans-pro/    (Body text)
  ├── merriweather/       (Headings)
  ├── public-sans/        (Alternative)
  └── roboto-mono/        (Monospace)
```

### How Fonts Are Loaded

1. **Critical fonts** are loaded in `<head>` via `styles/uswds-core.css`
   - Contains all `@font-face` declarations for USWDS fonts
   - Loaded synchronously for immediate availability

2. **Size-adjusted fallback fonts** in `styles/styles.css`
   - Local system fonts (Arial, Georgia) adjusted to match USWDS font metrics
   - Prevents Cumulative Layout Shift (CLS) when web fonts load
   - Uses CSS `size-adjust` descriptor for seamless font swapping

3. **Additional fonts** can be lazy-loaded via `styles/fonts.css`
   - Currently empty (USWDS fonts sufficient)
   - Loaded asynchronously by `scripts/scripts.js` for performance

### Size-Adjusted Fallback Fonts

To prevent layout shift when web fonts load, we use **size-adjusted fallback fonts**:

```css
/* Fallback for Source Sans Pro Web (normal - 400) */
@font-face {
  font-family: 'Source Sans Pro Fallback';
  src: local('Arial');
  size-adjust: 92.889%;
}

/* Fallback for Merriweather Web (normal - 400) */
@font-face {
  font-family: 'Merriweather Fallback';
  src: local('Arial');
  size-adjust: 91.34%;
}
```

**Values computed using Chrome font fallback extension** for precise metric matching.

**How it works:**
1. Browser initially renders with Arial (available immediately on all systems)
2. Fallback fonts are scaled to match USWDS font dimensions:
   - Source Sans Pro → Arial at 92.889%
   - Merriweather → Arial at 91.34%
3. When web fonts load, the swap is nearly imperceptible
4. Result: No layout shift, better Core Web Vitals (CLS score)

**Benefits:**
- ✅ Eliminates Cumulative Layout Shift (CLS)
- ✅ Improves perceived performance
- ✅ Better user experience during font loading
- ✅ Uses local system fonts for instant rendering

### CSS Variables

Font families are defined as CSS custom properties in `styles/styles.css`:

```css
:root {
  /* USWDS Typography with size-adjusted fallbacks */
  --body-font-family: "Source Sans Pro Web", "Source Sans Pro Fallback", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
  --heading-font-family: "Merriweather Web", "Merriweather Fallback", Georgia, Cambria, "Times New Roman", Times, serif;
}
```

**Font stack order:**
1. **Primary web font** (Source Sans Pro Web / Merriweather Web) - Loaded from `/fonts/`
2. **Size-adjusted fallback** (Source Sans Pro Fallback / Merriweather Fallback) - Local system font scaled to match
3. **Standard fallbacks** (Helvetica, Georgia, etc.) - System fonts as last resort

These variables are used throughout:

```css
body {
  font-family: var(--body-font-family);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--heading-font-family);
}
```

### Customizing Fonts

To customize the typography, edit `uswds.config.js`:

```javascript
theme: {
  // Typography
  typographyBaseFontSize: '16px',
  typographyBaseFontFamily: 'Source Sans Pro Web',  // or 'Public Sans Web'
  typographyHeadingFontFamily: 'Merriweather Web',
}
```

After changing the configuration:

1. Run `npm run build:uswds` to regenerate CSS
2. Update the CSS variables in `styles/styles.css` to match
3. Test across different browsers and devices

### Font Weights Available

#### Source Sans Pro Web
- 200 (Extra Light) + Italic
- 300 (Light) + Italic
- 400 (Regular) + Italic
- 600 (Semibold) + Italic
- 700 (Bold) + Italic
- 900 (Black) + Italic

#### Merriweather Web
- 300 (Light) + Italic
- 400 (Regular) + Italic
- 700 (Bold) + Italic
- 900 (Black) + Italic

#### Roboto Mono Web
- 100 (Thin) + Italic
- 300 (Light) + Italic
- 400 (Regular) + Italic
- 500 (Medium) + Italic
- 700 (Bold) + Italic

### Legacy Roboto Fonts

The following legacy font files from the original boilerplate are **not used** and can be safely removed:

- `/fonts/roboto-bold.woff2`
- `/fonts/roboto-condensed-bold.woff2`
- `/fonts/roboto-medium.woff2`
- `/fonts/roboto-regular.woff2`

These were replaced by USWDS fonts when the project was converted.

### Accessibility

USWDS fonts are:
- **Highly readable** at all sizes
- **WCAG 2.1 AA compliant** when used with proper contrast
- **Optimized for screen readers** with clear character differentiation
- **Well-tested** across government websites and assistive technologies

### Performance

Font loading is optimized for performance:

1. **Font display**: Uses `font-display: swap` for faster initial paint
2. **Subsetting**: Fonts include only Latin character ranges (unicode-range)
3. **Format**: Uses modern WOFF2 format for smaller file sizes
4. **Size-adjusted fallbacks**: Prevents layout shift during font swapping
5. **Lazy loading**: Non-critical fonts can be loaded asynchronously

#### Core Web Vitals Impact

The size-adjusted fallback fonts significantly improve **Cumulative Layout Shift (CLS)**:

- **Without fallbacks**: Text reflows when web fonts load (CLS penalty)
- **With size-adjusted fallbacks**: Nearly imperceptible swap (minimal CLS)

This is especially important for:
- Mobile devices with slower connections
- Users on metered data plans
- First-time visitors without cached fonts
- Achieving good Lighthouse/PageSpeed scores

### Troubleshooting

**Problem**: Seeing Roboto fonts instead of USWDS fonts

**Solution**: 
- Clear browser cache (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
- Verify `styles/fonts.css` doesn't contain Roboto declarations
- Check CSS variables in `styles/styles.css` use USWDS fonts
- Confirm `styles/uswds-core.css` is loaded in `head.html`

**Problem**: Fonts not loading at all

**Solution**:
- Check browser console for 404 errors
- Verify font files exist in `/fonts/` directory
- Confirm font paths in `uswds.config.js` are correct (`fontPath: '/fonts'`)
- Check CSP headers allow loading from `/fonts/`

## Tools for Computing Font Metrics

### Chrome Extensions

**Font Fallback** - Automatically computes size-adjust values for any web font:
- Available in Chrome Web Store
- Analyzes loaded fonts on any webpage
- Provides precise `size-adjust` percentages
- Used to compute the values in this project

### Other Tools

- **Fontaine** (npm) - Library for automatic font fallback generation
- **Next.js Font Optimization** - Built-in font metric overrides
- **Google Fonts Dataset** - Pre-calculated metrics for Google Fonts

## Related Documentation

- [USWDS Typography](https://designsystem.digital.gov/components/typography/)
- [USWDS Design Tokens - Typesetting](https://designsystem.digital.gov/design-tokens/typesetting/)
- [CSS size-adjust](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face/size-adjust)
- [Design Tokens Documentation](./DESIGN-TOKENS.md)
- [USWDS Configuration](./uswds.config.js)
