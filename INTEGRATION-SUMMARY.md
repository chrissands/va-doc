# USWDS + EDS Integration - Executive Summary

## 🎯 Project Vision

Create a production-ready Adobe Edge Delivery Services (EDS) boilerplate that seamlessly integrates all 47 U.S. Web Design System (USWDS) components, providing government agencies with a fast, accessible, and maintainable foundation for digital services.

## 📋 What This Gives You

### Immediate Benefits

- ✅ **47 USWDS Components** - All official government design system components
- ✅ **Fully Accessible** - WCAG 2.1 AA compliant out of the box
- ✅ **Section 508 Compliant** - Meets federal accessibility requirements
- ✅ **Easy to Upgrade** - Simple `npm run upgrade:uswds` command
- ✅ **EDS Compatible** - Follows all EDS best practices and patterns
- ✅ **Performance Optimized** - Modular CSS/JS loading, fast page loads
- ✅ **Author Friendly** - Simple block-based content creation
- ✅ **Developer Friendly** - Clear architecture, good documentation

### Components Included

| Category | Components |
|----------|-----------|
| **Core** (8) | Button, Link, Icon, Tag, Typography, List, Alert, Banner |
| **Forms** (14) | Text Input, Select, Checkbox, Radio, Date Picker, Time Picker, File Input, Combo Box, Character Count, Input Mask, Validation, and more |
| **Navigation** (10) | Header, Footer, Breadcrumb, Search, Side Nav, In-Page Nav, Pagination, Step Indicator, Language Selector, Identifier |
| **Content** (11) | Accordion, Cards, Table, Tabs, Modal, Collection, Icon List, Process List, Prose, Summary Box, Site Alert |
| **Advanced** (4) | Date Range Picker, Range Slider, Tooltip, Data Visualizations |

## 🏗️ How It Works

### The Architecture (Simple Version)

```
1. Install USWDS from npm
   ↓
2. Run build script (development time)
   - Compiles USWDS Sass → CSS
   - Wraps USWDS JS in EDS decorators
   - Copies fonts, icons, assets
   ↓
3. Generated files committed to repo
   ↓
4. Deploy to EDS (no build step needed)
   ↓
5. Fast, accessible government websites! 🎉
```

### Key Innovation: Hybrid CSS Architecture

**Problem**: USWDS typically creates one huge CSS file (~500KB). EDS needs per-block CSS for performance.

**Solution**: Split into two layers:

1. **Core CSS** (`uswds-core.css` ~50-100KB)
   - Typography system
   - Color tokens
   - Grid system
   - Core utilities
   - Loaded once, cached globally

2. **Block CSS** (each ~5-20KB)
   - Component-specific styles
   - Only loaded when block is used
   - Total page weight minimized

**Result**: Fast loading + small bundles + no duplication

## 📁 What Gets Created

After setup, you'll have:

```
your-project/
├── blocks/                    # 47 USWDS components as EDS blocks
│   ├── accordion/
│   ├── alert/
│   ├── button/
│   └── ... (47 total)
├── styles/
│   ├── uswds-core.css        # Shared USWDS foundation
│   └── styles.css
├── fonts/                     # USWDS web fonts
├── icons/                     # USWDS icon library
├── scripts/
│   └── build-uswds.js        # Build automation
└── uswds.config.js           # USWDS configuration
```

## 🚀 Implementation Timeline

### 8-Week Implementation Plan

| Phase | Duration | Focus | Deliverables |
|-------|----------|-------|-------------|
| **Phase 1** | Week 1 | Foundation Setup | Build script, core CSS, assets |
| **Phase 2** | Week 2 | Core Components | 8 basic components (button, alert, etc.) |
| **Phase 3** | Week 3 | Form Controls | 12 form components |
| **Phase 4** | Week 4 | Navigation & Layout | 10 navigation components |
| **Phase 5** | Week 5 | Content Display | 10 content components |
| **Phase 6** | Week 6 | Advanced Components | 7 complex components |
| **Phase 7** | Week 7 | Testing & Documentation | Comprehensive testing, docs |
| **Phase 8** | Week 8 | Polish & Launch | Bug fixes, examples, launch |

**Team Size**: 2-3 developers (or 1 developer with adjusted timeline)

## 🛠️ Getting Started (5 Steps)

### 1. Install Dependencies

```bash
npm install
```

This installs:
- `@uswds/uswds` - The design system
- Build tools (Sass, PostCSS, etc.)
- Development tools (linters, etc.)

### 2. Configure USWDS

Edit `uswds.config.js`:

```javascript
module.exports = {
  theme: {
    // Customize colors, typography, spacing
    primary: 'blue-60v',
    typographyBaseFontFamily: 'Public Sans Web',
  },
  // ... more settings
};
```

### 3. Build USWDS Components

```bash
npm run build:uswds
```

This:
- Compiles USWDS Sass to CSS
- Creates EDS blocks
- Copies fonts, icons
- Generates documentation

### 4. Start Developing

```bash
aem up
```

Your site is live at `http://localhost:3000`

### 5. Create Content

Use USWDS components as EDS blocks:

```markdown
| button |
|---|
| [Click Me](https://example.com) |

| alert |
|---|
| **Important** |
| This is an important message. |
```

## 💡 Key Decisions Made

### 1. Build-Time Compilation ✓

**Decision**: Compile during development, commit generated files

**Why**: EDS doesn't support runtime builds. This keeps deployment simple.

### 2. Hybrid CSS Architecture ✓

**Decision**: Core CSS + per-block CSS

**Why**: Balances performance (modular loading) with efficiency (no duplication).

### 3. Wrap USWDS JavaScript ✓

**Decision**: Wrap USWDS JS modules in EDS decorators

**Why**: Uses official USWDS code, easy to upgrade, follows EDS patterns.

### 4. Copy Assets to Project ✓

**Decision**: Copy fonts, icons to project during build

**Why**: Self-contained project, correct paths, simple deployment.

### 5. Simple EDS Names ✓

**Decision**: Use `button` not `usa-button`

**Why**: Simpler for authors, follows EDS conventions.

See [ARCHITECTURE-DECISIONS.md](./ARCHITECTURE-DECISIONS.md) for detailed rationale.

## 📊 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Core CSS** | < 150KB | Per-file size |
| **Block CSS** | < 30KB each | Per-file size |
| **LCP** | < 2.5s | Lighthouse |
| **FCP** | < 1.8s | Lighthouse |
| **CLS** | < 0.1 | Lighthouse |
| **Lighthouse Score** | > 90 | All categories |
| **Accessibility** | WCAG 2.1 AA | axe, WAVE |

## 🎨 Customization Options

### Theme Customization

Edit `uswds.config.js`:

```javascript
{
  theme: {
    // Colors
    primary: 'blue-60v',        // Your primary color
    secondary: 'red-50v',       // Your secondary color
    
    // Typography
    typographyBaseFontFamily: 'Public Sans Web',
    typographyHeadingFontFamily: 'Merriweather Web',
    
    // Spacing
    siteMaxWidth: 'desktop',    // Max content width
    siteMargins: '4',           // Side margins
  }
}
```

Then rebuild:

```bash
npm run build:uswds
```

### Component-Level Customization

Edit individual block CSS:

```css
/* blocks/button/button.css */

/* USWDS styles (auto-generated) */
.usa-button { ... }

/* Your custom styles */
.button .usa-button.custom {
  /* Custom styling here */
}
```

### Adding Custom Components

```bash
# Build a new component
npm run build:uswds -- --component=my-component
```

## 🔒 Compliance & Accessibility

### Standards Met

- ✅ **WCAG 2.1 Level AA** - Full compliance
- ✅ **Section 508** - Federal accessibility requirements
- ✅ **21st Century IDEA** - Digital services modernization
- ✅ **USWDS 3.x** - Latest design system standards

### Testing Approach

**Automated**:
- Bundle size checks
- CSS/JS linting
- Accessibility scans (axe-core)

**Manual**:
- Cross-browser testing
- Screen reader testing
- Keyboard navigation
- Visual inspection

## 📚 Documentation Provided

| Document | Purpose | Audience |
|----------|---------|----------|
| **INTEGRATION-SUMMARY.md** | High-level overview (this file) | Everyone |
| **USWDS-INTEGRATION-PLAN.md** | Comprehensive technical plan | Developers, Architects |
| **ARCHITECTURE-DECISIONS.md** | Decision rationale | Technical leads |
| **QUICK-START.md** | Getting started guide | Developers |
| **blocks/*/README.md** | Component usage | Developers, Authors |
| **uswds.config.js** | Configuration reference | Developers |

## 🔄 Upgrade Process

### When USWDS Releases Update

```bash
# Simple one-liner
npm run upgrade:uswds

# Or step-by-step
npm update @uswds/uswds
npm run build:uswds
# Test, then commit
```

### What Gets Updated

- ✅ USWDS npm package
- ✅ All component CSS (recompiled)
- ✅ All component JS (if USWDS changed)
- ✅ Fonts, icons, assets (if USWDS changed)

### Breaking Changes

For major USWDS updates (e.g., 3.x → 4.x):

1. Review USWDS release notes
2. Update build script if needed
3. Test in a branch
4. Update migration guide
5. Roll out to projects

## ⚠️ Trade-offs & Limitations

### What You Gain

- ✅ Official USWDS components
- ✅ Easy upgrades
- ✅ Performance optimized
- ✅ Accessible by default
- ✅ Government compliant

### What You Trade

- ⚠️ Generated files in repository (larger diffs)
- ⚠️ Build step after USWDS updates
- ⚠️ Core CSS always loaded (~50-100KB)
- ⚠️ Learning both USWDS and EDS

### What You Avoid

- ❌ Runtime compilation
- ❌ Monolithic CSS
- ❌ Forking USWDS
- ❌ Complex deployment

## 🎓 Learning Resources

### USWDS

- [USWDS Website](https://designsystem.digital.gov)
- [USWDS Components](https://designsystem.digital.gov/components/)
- [USWDS Documentation](https://designsystem.digital.gov/documentation/)

### EDS

- [EDS Documentation](https://www.aem.live/developer/)
- [EDS Block Collection](https://www.aem.live/developer/block-collection)
- [EDS Tutorial](https://www.aem.live/developer/tutorial)

### This Project

- Start with [QUICK-START.md](./QUICK-START.md)
- Deep dive: [USWDS-INTEGRATION-PLAN.md](./USWDS-INTEGRATION-PLAN.md)
- Understand decisions: [ARCHITECTURE-DECISIONS.md](./ARCHITECTURE-DECISIONS.md)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- How to contribute
- Code standards
- PR process
- Testing requirements

## ❓ FAQ

### Do I need to be a USWDS expert?

No. The build script handles USWDS complexity. You just use the components.

### Do I need to be an EDS expert?

Helpful but not required. Follow the patterns in existing blocks.

### Can I use this for non-government sites?

Technically yes, but USWDS is designed for government. For other sites, consider alternatives.

### What if I only need some components?

Edit `uswds.config.js` and exclude components you don't need:

```javascript
{
  excludeComponents: ['usa-language-selector', 'usa-combo-box']
}
```

### How do I add a custom component?

1. Create block directory
2. Add to `componentMap` in config
3. Run build script
4. Customize as needed

### What about browser support?

- ✅ Chrome, Firefox, Safari, Edge (latest)
- ❌ Internet Explorer 11 (not supported by USWDS 3.x)

### How big is the total CSS/JS?

Depends on components used, but typical page:
- Core CSS: ~50-100KB (cached)
- Block CSS: ~5-20KB each (3-5 blocks typical)
- Block JS: ~10-30KB each (only for interactive components)
- **Total**: ~150-300KB CSS, ~50-150KB JS

Much smaller than monolithic USWDS!

## 🎉 Next Steps

### Immediate (This Week)

1. ✅ Review this summary
2. ✅ Read [QUICK-START.md](./QUICK-START.md)
3. ✅ Review [ARCHITECTURE-DECISIONS.md](./ARCHITECTURE-DECISIONS.md)
4. ✅ Discuss with team
5. ✅ Get stakeholder approval

### Short Term (Next 2 Weeks)

1. Set up development environment
2. Run build script
3. Create sample page with components
4. Test in browsers
5. Validate accessibility

### Medium Term (Next 2 Months)

1. Implement all 47 components (8-week plan)
2. Comprehensive testing
3. Complete documentation
4. Create example site
5. Launch! 🚀

## 📞 Getting Help

### Issues

File issues in project repository

### Questions

- Check documentation first
- Review USWDS docs
- Review EDS docs
- Ask in project discussions

### Contributing

PRs welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## Summary

This plan provides everything you need to integrate USWDS into EDS:

- ✅ **Clear architecture** - Hybrid CSS, wrapped JS, build-time compilation
- ✅ **Implementation plan** - 8 weeks, phased approach
- ✅ **Build automation** - One command to build all components
- ✅ **Complete documentation** - For developers and authors
- ✅ **Upgrade path** - Easy USWDS updates
- ✅ **Performance** - Modular, optimized, fast
- ✅ **Compliance** - WCAG 2.1 AA, Section 508
- ✅ **Maintainability** - Clean code, minimal custom logic

**Ready to start?** 

```bash
npm install
npm run build:uswds
aem up
```

Then check out [QUICK-START.md](./QUICK-START.md) and start building!

---

*Document Version: 1.0*  
*Date: January 27, 2026*  
*For questions or feedback, open an issue in the project repository.*

🇺🇸 **Built for digital.gov • Powered by USWDS • Delivered by EDS**
