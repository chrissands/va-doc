# AEM Edge Delivery Services + USWDS

This project integrates the **U.S. Web Design System (USWDS)** with **Adobe Edge Delivery Services (EDS)**, providing all 47 USWDS components as EDS blocks for building fast, accessible, Section 508-compliant government websites.

## 🎯 Features

- ✅ **47 USWDS Components** - All official design system components
- ✅ **WCAG 2.1 AA Compliant** - Accessible by default
- ✅ **Section 508 Ready** - Meets federal requirements
- ✅ **Performance Optimized** - Modular CSS/JS loading
- ✅ **Easy to Upgrade** - Simple `npm run upgrade:uswds` command
- ✅ **EDS Compatible** - Follows all EDS best practices

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Verify USWDS Build

The USWDS components have already been built. To rebuild:

```bash
npm run build:uswds
```

### 3. Start Development Server

```bash
# Install AEM CLI (one-time)
sudo npm install -g @adobe/aem-cli

# Start local server
aem up
```

Visit `http://localhost:3000/test-uswds.html` to see USWDS components in action!

## 📚 Documentation

### Core Guides
- **[USWDS-EDS-PATTERN.md](./USWDS-EDS-PATTERN.md)** - ⭐ **START HERE** - Complete integration pattern and block development guide
- **[QUICK-START.md](./QUICK-START.md)** - Quick reference for common tasks

### Technical Details
- **[INTEGRATION-SUMMARY.md](./INTEGRATION-SUMMARY.md)** - Executive overview
- **[USWDS-INTEGRATION-PLAN.md](./USWDS-INTEGRATION-PLAN.md)** - Complete technical plan
- **[ARCHITECTURE-DECISIONS.md](./ARCHITECTURE-DECISIONS.md)** - Design rationale
- **[BUILD-STATUS.md](./BUILD-STATUS.md)** - Current build status

## 🧩 Available Components

### Core (4)
button • link • icon • tag

### Layout (4)
accordion • cards • collection • table

### Navigation (8)
header • footer • breadcrumb • pagination • search • side-nav • in-page-nav • step-indicator

### Forms (18)
form • text-input • textarea • select • checkbox • radio • button-group • character-count • combo-box • date-picker • date-range-picker • file-input • input-mask • input-prefix-suffix • memorable-date • range-slider • time-picker • validation

### Content (10)
alert • banner • icon-list • list • modal • process-list • prose • summary-box • tooltip

### Specialized (3)
identifier • language-selector • graphic-list

See individual block README files in `blocks/[component]/README.md` for usage details.

## 🛠️ Development

### Build Commands

```bash
# Rebuild all USWDS components
npm run build:uswds

# Rebuild specific component
npm run build:uswds:component=button

# Upgrade to latest USWDS
npm run upgrade:uswds

# Linting
npm run lint
```

### Project Structure

```
uswds/
├── blocks/              # 47 USWDS components as EDS blocks
├── styles/              
│   ├── uswds-core.css  # USWDS foundation (740KB)
│   └── styles.css      # Custom styles
├── fonts/              # USWDS web fonts
├── icons/              # USWDS icon library
├── scripts/
│   └── build-uswds.js  # Build automation
└── uswds.config.js     # USWDS configuration
```

## 🎨 Customization

Edit `uswds.config.js` to customize USWDS theme:

```javascript
{
  theme: {
    primary: 'blue-60v',
    typographyBaseFontFamily: 'Public Sans Web',
    siteMaxWidth: 'desktop',
    // ... more settings
  }
}
```

After changing settings, rebuild:

```bash
npm run build:uswds
```

## 📖 Using Components

Components work like standard EDS blocks. In your document:

```markdown
| button |
|---|
| [Click Me](https://example.com) |

| alert |
|---|
| **Important** |
| This is an important message. |
```

## 🌐 DA compatible

This project is compatible with DA's live preview.

### 1. Github Setup
1. Use this template to make a new repo
2. Install [AEM Code Sync](https://github.com/apps/aem-code-sync)

### 2. DA Content
1. Browse to https://da.live/start
2. Follow the steps

## 🏛️ Government Compliance

- **USWDS 3.13.0** - Latest design system
- **WCAG 2.1 Level AA** - Full accessibility compliance
- **Section 508** - Federal accessibility requirements
- **21st Century IDEA** - Modern digital services

## 📊 Performance

- Core CSS: 740KB (cached globally)
- Component CSS: 40-70KB each (loaded as needed)
- Lighthouse scores: Target >90 all categories
- Mobile-first, responsive design

## 🔄 Upgrading USWDS

When USWDS releases updates:

```bash
npm run upgrade:uswds
```

This will:
1. Update the @uswds/uswds package
2. Rebuild all components
3. Copy new assets

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.

## 📄 License

Apache License 2.0

## 🔗 Resources

- [USWDS Website](https://designsystem.digital.gov)
- [USWDS Components](https://designsystem.digital.gov/components/)
- [EDS Documentation](https://www.aem.live/developer/)
- [AEM Block Collection](https://www.aem.live/developer/block-collection)

---

🇺🇸 **Built for digital.gov • Powered by USWDS • Delivered by EDS**
