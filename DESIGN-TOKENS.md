# USWDS Design Tokens Guide

## What Are Design Tokens?

Design tokens are the **visual design atoms** of the USWDS system - the smallest, named design decisions that make up your site's visual language. They're like variables for design: instead of hard-coding "use 16px font size and #1b1b1b color," you use tokens like `'body'` and `'ink'`.

Think of them as a **design API** that connects designers and developers.

### Why Design Tokens?

✅ **Consistency** - One source of truth for colors, spacing, typography  
✅ **Maintainability** - Change `primary` color once, updates everywhere  
✅ **Communication** - Designers and developers speak the same language  
✅ **Theming** - Easy to create variants (light/dark, agencies, brands)  
✅ **Accessibility** - Tokens ensure contrast ratios and spacing standards

## Token Categories

USWDS organizes design tokens into several categories:

### 1. Color Tokens

**Role-based color families:**
- **Base** - Neutrals/grays (text, backgrounds)
- **Primary** - Main brand color (~60% of site color)
- **Secondary** - Supporting brand color (~30% of site color)
- **Accent Warm** - Warm accent (~10%)
- **Accent Cool** - Cool accent (~10%)

Each family has 7 grades from lightest to darkest:
```
primary-lightest
primary-lighter  
primary-light
primary          (base)
primary-dark
primary-darker
primary-darkest
```

**State colors:**
- **Info** - Informational messages (blue)
- **Success** - Success states (green)
- **Warning** - Warning states (yellow)
- **Error** - Error states (red)
- **Disabled** - Disabled states (gray)
- **Emergency** - Emergency alerts (red)

### 2. Typography Tokens

**Font families:**
- Headings, body text, code, alternate fonts
- System font stacks for performance

**Font sizes:**
- Named sizes: `micro`, `1`, `2`, `3`, through `3xl`
- Responsive sizing included

**Font weights:**
- `light`, `normal`, `medium`, `semibold`, `bold`

**Line heights:**
- Body text (1.5), headings (1.2), specific components

### 3. Spacing Tokens

**Spacing scale** (0-20):
```
0    = 0
05   = 4px
1    = 8px
2    = 16px
3    = 24px
...
10   = 80px
15   = 120px
20   = 160px
```

Also: `auto`, `neg-[size]` (negative margins)

**Layout spacing:**
- Grid gaps, container padding, section margins

### 4. Sizing Tokens

**Mobile-first breakpoints:**
- `mobile-lg` - 480px
- `tablet` - 640px
- `tablet-lg` - 880px
- `desktop` - 1024px
- `desktop-lg` - 1200px
- `widescreen` - 1400px

**Border radius:**
- `0`, `sm`, `md`, `lg`, `pill`, `circle`

**Border width:**
- `0`, `1px`, `2px`, `05` (4px), `1` (8px)

## Where to Configure Tokens

### In This Project: `uswds.config.js`

Your design token configuration is in `/uswds.config.js` under the `theme` object:

```javascript
theme: {
  // Asset paths
  fontPath: '/fonts',
  imagePath: '/icons',
  
  // Typography
  typographyBaseFontSize: '16px',
  typographyBaseFontFamily: 'Public Sans Web',
  typographyHeadingFontFamily: 'Merriweather Web',
  
  // Colors (commented out = using USWDS defaults)
  // primary: 'blue-60v',
  // secondary: 'red-50v',
  // accent: 'cyan-30v',
  
  // Spacing
  siteMaxWidth: 'desktop',
  siteMargins: '4',
  siteMarginsBreakpoint: 'desktop',
  
  // Grid
  gridContainerMaxWidth: 'desktop',
  
  // Banner
  bannerBackgroundColor: 'base-lightest',
  
  // Focus
  focusColor: 'blue-40v',
  focusWidth: '0.25rem',
  focusStyle: 'solid',
}
```

### How It Works

1. **Edit `uswds.config.js`** - Change token values in the `theme` object
2. **Run `npm run build:uswds`** - Compiles Sass with your token values
3. **CSS generated** - All components use your customized tokens

## Common Customizations

### Change Brand Colors

```javascript
theme: {
  primary: 'blue-60v',      // Main brand color
  secondary: 'red-50v',     // Secondary brand
  accentWarm: 'orange-40v', // Warm accent
  accentCool: 'cyan-30v',   // Cool accent
  base: 'gray-5',           // Base/neutral
}
```

### Customize Typography

```javascript
theme: {
  // Font families
  typographyBaseFontFamily: 'Source Sans Pro',
  typographyHeadingFontFamily: 'Merriweather',
  typographyCodeFontFamily: 'Roboto Mono',
  
  // Font sizes
  typographyBaseFontSize: '16px',
  typographyBodyFontSize: 'md',  // Can use tokens
  typographyHeadingFontSize: 'xl',
  
  // Line height
  textLineHeight: '5',  // 1.5
  headingLineHeight: '2', // 1.2
}
```

### Adjust Spacing

```javascript
theme: {
  // Site-wide spacing
  siteMargins: '3',        // Outer margins
  siteMarginsBreakpoint: 'tablet',
  
  // Grid
  gridContainerMaxWidth: 'widescreen', // 1400px
  
  // Component spacing
  columnGap: '2',  // Gap between columns
}
```

### Customize Buttons

```javascript
theme: {
  buttonBorderRadius: 'pill',     // Fully rounded
  buttonStrokeWidth: '2px',       // Outline button border
  buttonSmallWidth: '6',          // Small button min-width
  buttonFontFamily: 'sans',       // Button font
}
```

### Configure Focus Styles

```javascript
theme: {
  focusColor: 'blue-40v',
  focusWidth: '0.25rem',
  focusStyle: 'solid',
  focusOffset: '0',
}
```

## Available Token Values

### Color Token Values

Colors use a **grade + vivid** system:

**Grade (lightness):** `5`, `10`, `20`, `30`, `40`, `50`, `60`, `70`, `80`, `90`  
**Vivid variant:** Add `v` suffix (e.g., `blue-60v`)

**Examples:**
- `'blue-60v'` - Vivid blue, grade 60
- `'red-50'` - Standard red, grade 50
- `'gray-5'` - Very light gray
- `'gray-90'` - Very dark gray

**Special values:**
- `'black'` - Pure black
- `'white'` - Pure white
- `'transparent'` - Transparent

### Spacing Token Values

Use the spacing scale or named values:

**Numbers:** `'0'`, `'05'`, `'1'`, `'2'`, `'3'`, `'4'`, `'5'`, `'6'`, `'7'`, `'8'`, `'9'`, `'10'`, `'15'`, `'20'`

**Named:** `'auto'`, `'card'`, `'card-lg'`, `'mobile'`

**Negative:** `'neg-1'`, `'neg-2'`, etc.

### Size Token Values

**Breakpoints:** `'mobile'`, `'mobile-lg'`, `'tablet'`, `'tablet-lg'`, `'desktop'`, `'desktop-lg'`, `'widescreen'`

**Measures:** `'1'` (1 character), `'2'` (2 characters), through `'6'` (6 characters)

### Font Family Token Values

- `'sans'` - Sans-serif stack
- `'serif'` - Serif stack
- `'mono'` - Monospace stack
- `'body'` - Body text font
- `'heading'` - Heading font
- `'alt'` - Alternative font
- `'ui'` - UI font

Or specify custom font names:
```javascript
typographyBaseFontFamily: 'Source Sans Pro Web'
```

### Font Size Token Values

- `'micro'`, `'1'`, `'2'`, `'3'`, `'4'`, `'5'`, `'6'`, `'7'`, `'8'`, `'9'`
- `'sm'`, `'md'`, `'lg'`, `'xl'`, `'2xl'`, `'3xl'`

## Complete Settings Reference

Here are ALL available USWDS theme settings you can configure:

### General Settings
- `$theme-image-path`
- `$theme-font-path`
- `$theme-show-notifications`
- `$theme-show-compile-warnings`

### Global Color Settings
- `$theme-global-color-ink`
- `$theme-global-color-background-lightest`
- `$theme-global-color-background-light`
- `$theme-global-color-background-mid`
- `$theme-global-color-background-dark`
- `$theme-global-color-background-darkest`

### Theme Color Settings
- `$theme-color-base-lightest` through `darkest`
- `$theme-color-primary-lightest` through `darkest`
- `$theme-color-secondary-lightest` through `darkest`
- `$theme-color-accent-warm-lightest` through `darkest`
- `$theme-color-accent-cool-lightest` through `darkest`

### State Color Settings
- `$theme-color-error-[lightest-darkest]`
- `$theme-color-warning-[lightest-darkest]`
- `$theme-color-success-[lightest-darkest]`
- `$theme-color-info-[lightest-darkest]`
- `$theme-color-disabled-[light-dark]`
- `$theme-color-emergency-[light-dark]`

### Typography Settings
- `$theme-type-scale-[micro-3xl]`
- `$theme-font-type-[sans-serif-mono]`
- `$theme-font-role-[body-heading-alt-ui]`
- `$theme-font-weight-[thin-heavy]`
- `$theme-line-height-[1-6]`
- `$theme-text-measure-[narrow-wide]`

### Component-Specific Settings
Each component has its own settings (buttons, forms, navigation, etc.)

See [USWDS Settings Documentation](https://designsystem.digital.gov/documentation/settings) for the complete list.

## Best Practices

### ✅ DO

- **Use semantic names** - `primary` not `blue`
- **Start with defaults** - Only override what you need
- **Use the scale** - Stick to standard spacing/size values
- **Test accessibility** - Verify contrast ratios after changes
- **Document changes** - Comment why you chose specific tokens

### ❌ DON'T

- **Don't hard-code values** - Always use tokens
- **Don't break the scale** - Custom spacing breaks consistency
- **Don't guess colors** - Use USWDS's tested combinations
- **Don't skip testing** - Changes affect entire site

## Testing Your Changes

After updating tokens:

```bash
# 1. Rebuild USWDS with new tokens
npm run build:uswds

# 2. Check the compiled CSS
head -100 styles/uswds-core.css

# 3. Test in browser
# Refresh your site and verify colors, spacing, typography
```

## Examples

### Example 1: Agency Rebrand

```javascript
theme: {
  // New agency colors
  primary: 'blue-60v',
  secondary: 'red-50v',
  accentWarm: 'gold-30v',
  
  // Agency fonts
  typographyBaseFontFamily: 'Source Sans Pro Web',
  typographyHeadingFontFamily: 'Merriweather Web',
  
  // Tighter spacing
  siteMargins: '2',
  gridContainerMaxWidth: 'desktop',
}
```

### Example 2: Accessibility Enhancement

```javascript
theme: {
  // Higher contrast
  primary: 'blue-70v',  // Darker for better contrast
  
  // Larger focus indicators
  focusWidth: '0.375rem',  // 6px instead of 4px
  focusColor: 'orange-50v',  // More visible
  
  // Larger base font
  typographyBaseFontSize: '18px',
}
```

### Example 3: Modern/Minimal Look

```javascript
theme: {
  // Modern rounded corners
  buttonBorderRadius: 'lg',
  
  // Clean sans-serif throughout
  typographyBaseFontFamily: 'Source Sans Pro Web',
  typographyHeadingFontFamily: 'Source Sans Pro Web',
  
  // More white space
  siteMargins: '5',
  columnGap: '3',
}
```

## Resources

- **[USWDS Design Tokens](https://designsystem.digital.gov/design-tokens/)** - Complete token reference
- **[USWDS Settings](https://designsystem.digital.gov/documentation/settings)** - All available settings
- **[Theme Colors](https://designsystem.digital.gov/design-tokens/color/theme-tokens)** - Color token guide
- **Your Config:** `/uswds.config.js` - Your project's token configuration

## Need Help?

- Check existing tokens first - often one exists for your use case
- Review USWDS examples - see how other sites use tokens
- Test accessibility - use browser tools to verify contrast
- Ask the team - share your token choices for feedback
