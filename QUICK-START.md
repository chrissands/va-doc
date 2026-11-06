# USWDS + EDS Quick Start Guide

This guide will help you get started with the USWDS-integrated EDS project.

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Basic understanding of EDS and USWDS

## Installation

### 1. Clone/Setup Project

```bash
# If starting from this template
cd /path/to/your/project

# Install dependencies
npm install
```

### 2. Build USWDS Components

```bash
# Build all USWDS components for the first time
npm run build:uswds

# This will:
# - Compile USWDS Sass to CSS
# - Create EDS block structure
# - Copy fonts, icons, and assets
# - Generate documentation
```

### 3. Start Development Server

```bash
# Start AEM CLI
aem up

# Your site is now running at http://localhost:3000
```

## Project Structure

After building, your project will have this structure:

```
uswds/
├── blocks/                    # EDS blocks (USWDS components)
│   ├── accordion/
│   │   ├── accordion.css     # Compiled from USWDS
│   │   ├── accordion.js      # USWDS + EDS integration
│   │   └── README.md         # Component docs
│   ├── alert/
│   ├── button/
│   └── ... (47 components)
├── styles/
│   ├── styles.css            # Global styles
│   ├── uswds-core.css        # USWDS foundation (NEW)
│   └── fonts.css
├── fonts/                     # USWDS fonts
│   ├── public-sans/
│   ├── merriweather/
│   └── ...
├── icons/                     # USWDS icons
│   ├── usa-icons/
│   └── sprite.svg
├── scripts/
│   ├── build-uswds.js        # Build script (NEW)
│   └── scripts.js
└── uswds.config.js           # USWDS configuration (NEW)
```

## Using USWDS Components

### In Your Content

Components are used like standard EDS blocks:

```markdown
## Button Example

| button |
|---|
| [Click Me](https://example.com) |

---

## Alert Example

| alert |
|---|
| **Important** |
| This is an important message. |
```

### Component Documentation

Each component has a README with usage instructions:

```bash
# View component docs
cat blocks/button/README.md
```

## Customization

### Theme Settings

Edit `uswds.config.js` to customize USWDS theme:

```javascript
module.exports = {
  theme: {
    // Colors
    primary: 'blue-60v',
    secondary: 'red-50v',
    
    // Typography
    typographyBaseFontFamily: 'Public Sans Web',
    
    // Spacing
    siteMaxWidth: 'desktop',
    
    // ... more settings
  },
};
```

After changing theme settings:

```bash
npm run build:uswds
```

### Custom Styles

Add custom styles to individual blocks:

```css
/* blocks/button/button.css */

/* USWDS styles (auto-generated) */
.usa-button { ... }

/* Your custom overrides */
.button .usa-button.my-variant {
  background-color: purple;
}
```

### Component Variants

Create variants using EDS classes:

```markdown
| button (primary, large) |
|---|
| [Large Primary Button](/) |
```

## Common Tasks

### Add a New Component

```bash
# Build a single component
npm run build:uswds -- --component=modal
```

### Upgrade USWDS

```bash
# Update to latest USWDS version
npm run upgrade:uswds

# Or manually:
npm update @uswds/uswds
npm run build:uswds
```

### Rebuild Everything

```bash
# Clean and rebuild all
npm run build:uswds -- --clean
```

### Check Bundle Sizes

```bash
# Build with size checking
npm run build:uswds

# Look for size warnings in output
```

## Development Workflow

### 1. Create Content

Author content in your document editor (Google Docs, Word, etc.) or directly in markdown.

### 2. Preview Locally

```bash
aem up
# Visit http://localhost:3000
```

### 3. Use Components

Add USWDS components as EDS blocks in your content.

### 4. Customize if Needed

- Edit component CSS/JS in `blocks/[component]/`
- Modify theme in `uswds.config.js`
- Rebuild if needed: `npm run build:uswds`

### 5. Test

- Test in different browsers
- Check accessibility
- Validate responsive design
- Review performance

## Architecture Overview

```
┌─────────────────────────────────────┐
│  Content (Google Docs, Markdown)    │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  EDS (Edge Delivery Services)       │
│  - Converts to semantic HTML        │
│  - Loads blocks dynamically         │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  USWDS Blocks                       │
│  - Styled with USWDS CSS            │
│  - Enhanced with USWDS JS           │
│  - Accessible & compliant           │
└─────────────────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│  Browser                            │
│  - Fast loading (per-block CSS/JS)  │
│  - Progressive enhancement          │
│  - WCAG 2.1 AA compliant            │
└─────────────────────────────────────┘
```

## Key Concepts

### EDS Blocks

EDS uses "blocks" to componentize content. Each block is a self-contained unit with its own CSS and JavaScript.

### USWDS Components

USWDS provides 47 standardized government components. This project maps each USWDS component to an EDS block.

### Build Process

The build process compiles USWDS Sass and creates EDS-compatible blocks:

1. **USWDS Sass** → Compiled → **Block CSS**
2. **USWDS JS** → Wrapped → **Block JS**
3. **Assets** → Copied → **Project Structure**

### No Runtime Compilation

EDS doesn't compile at runtime. The build script runs during development and outputs static files that are committed to the repository.

## Troubleshooting

### Build Fails

```bash
# Check Node/npm versions
node --version  # Should be v18+
npm --version   # Should be v9+

# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build:uswds
```

### Component Not Working

1. Check that CSS file exists: `blocks/[component]/[component].css`
2. Check that JS file exists: `blocks/[component]/[component].js`
3. Check browser console for errors
4. Verify component HTML structure matches USWDS requirements

### Styles Not Loading

1. Verify `uswds-core.css` is included in `head.html`
2. Check CSS file paths are correct
3. Clear browser cache
4. Check for CSS compilation errors

### Assets Not Found (fonts, icons)

1. Verify assets were copied: check `fonts/` and `icons/` directories
2. Check asset paths in `uswds.config.js`
3. Rebuild: `npm run build:uswds`
4. Check CSS for correct relative paths

## Performance Tips

### 1. Use Core CSS Wisely

The `uswds-core.css` file includes shared USWDS styles. Keep it focused on truly shared features:

- Typography
- Colors
- Core utilities

Avoid including component-specific styles in core.

### 2. Lazy Load Components

Only load blocks that are used on the page. EDS does this automatically.

### 3. Optimize Images

Use responsive images and proper formats (WebP, AVIF).

### 4. Monitor Bundle Sizes

```bash
# Check sizes during build
npm run build:uswds

# Aim for:
# - Core CSS: < 150KB
# - Block CSS: < 30KB each
```

### 5. Use Utility Classes Sparingly

USWDS utility classes are convenient but can increase CSS size. Use component-specific styles when possible.

## Accessibility Checklist

All USWDS components are WCAG 2.1 AA compliant by default. To maintain compliance:

- [ ] Test with keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Ensure focus indicators are visible
- [ ] Test with browser zoom (up to 200%)
- [ ] Validate HTML
- [ ] Use semantic HTML
- [ ] Provide text alternatives for images
- [ ] Test forms for proper labeling
- [ ] Verify ARIA attributes are correct

## Browser Support

Supported browsers (as of USWDS 3.13.0):

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Internet Explorer 11 is **not supported**.

## Resources

### USWDS

- [USWDS Website](https://designsystem.digital.gov)
- [USWDS Components](https://designsystem.digital.gov/components/)
- [USWDS Documentation](https://designsystem.digital.gov/documentation/)
- [USWDS GitHub](https://github.com/uswds/uswds)

### EDS

- [EDS Documentation](https://www.aem.live/developer/)
- [EDS Block Collection](https://www.aem.live/developer/block-collection)
- [EDS Tutorial](https://www.aem.live/developer/tutorial)

### This Project

- [Integration Plan](./USWDS-INTEGRATION-PLAN.md) - Comprehensive architectural plan
- [Configuration](./uswds.config.js) - USWDS build configuration
- [Build Script](./scripts/build-uswds.js) - USWDS build tool

## Getting Help

### Issues

If you encounter issues:

1. Check the troubleshooting section above
2. Review component README files
3. Check USWDS documentation
4. Review EDS documentation
5. File an issue in the project repository

### Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Next Steps

Now that you're set up:

1. **Explore Components** - Browse `blocks/` to see what's available
2. **Create a Page** - Build a sample page using USWDS components
3. **Customize Theme** - Edit `uswds.config.js` to match your brand
4. **Review Plan** - Read [USWDS-INTEGRATION-PLAN.md](./USWDS-INTEGRATION-PLAN.md) for architectural details
5. **Build Something!** - Start creating compliant, accessible government websites

---

**Ready to build?** Start with a simple page using buttons, alerts, and cards, then explore more complex components like forms and navigation.
