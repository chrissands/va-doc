# USWDS Update Strategy

This document explains how to update your USWDS integration when new versions are released.

## Protected Files

Files in `.buildignore` are protected from automatic regeneration to preserve custom EDS overrides. This includes:

- **All JavaScript files** (`blocks/**/*.js`) - contain custom EDS decorators
- **Specific CSS files** - contain custom EDS overrides at the top

## Updating USWDS

### 1. Update USWDS Package

```bash
npm update @uswds/uswds
```

### 2. Choose Your Update Strategy

#### Option A: Force Regenerate Specific Components

Use the `--force` flag to regenerate protected files:

```bash
# Regenerate all components (including protected ones)
npm run build:uswds -- --force

# Regenerate a specific component
npm run build:uswds -- --force --component=card
```

**⚠️ Warning:** This will overwrite custom EDS overrides!

**After using --force:**
1. Check `git diff` to see what changed
2. Re-add your custom EDS overrides at the TOP of the CSS file
3. Keep the updated USWDS styles below

#### Option B: Manual Update (Recommended for CSS with Custom Overrides)

For files with custom overrides (card, header, hero, banner, footer):

1. **Temporarily unprotect the file:**
   ```bash
   # Edit .buildignore and comment out the file you want to update
   # blocks/card/card.css  →  # blocks/card/card.css
   ```

2. **Save your custom overrides:**
   ```bash
   # Copy the custom override section (typically at the top of the file)
   head -50 blocks/card/card.css > card-custom.css.backup
   ```

3. **Regenerate the file:**
   ```bash
   npm run build:uswds -- --component=card
   ```

4. **Re-add your custom overrides:**
   - Open the regenerated CSS file
   - Add your custom EDS overrides at the TOP
   - Keep the new USWDS styles below

5. **Re-protect the file:**
   ```bash
   # Edit .buildignore and uncomment the file
   # # blocks/card/card.css  →  blocks/card/card.css
   ```

#### Option C: Full Regeneration (Safe for Files Without Custom Overrides)

For components without custom overrides:

```bash
# Clean and rebuild everything
npm run build:uswds -- --clean
```

Protected files will remain untouched.

## File Structure Pattern

### CSS Files with Custom Overrides

Custom EDS overrides should always be at the TOP:

```css
/**
 * EDS Override styles for USWDS Component
 * These styles override default EDS/USWDS behavior
 */

/* Your custom overrides here */
.usa-component {
  /* Custom EDS-specific styles */
}

/* ===== USWDS GENERATED STYLES BELOW ===== */
/* Do not modify below this line */

/*
* * * * * ==============================
* USWDS Auto-generated styles...
*/
```

This makes it easy to:
1. Identify custom vs. generated code
2. Copy custom overrides before regeneration
3. Re-add custom overrides after regeneration

## Best Practices

1. **Document custom overrides** with clear comments explaining WHY they exist
2. **Keep custom overrides minimal** - only override what's necessary
3. **Test after updates** - verify components still work correctly
4. **Use version control** - commit before and after USWDS updates
5. **Review diffs carefully** - understand what changed in USWDS

## Common Custom Overrides

- **Card**: Responsive grid utilities (tablet-lg, widescreen breakpoints)
- **Header**: Logo sizing, EDS wrapper fixes
- **Hero**: Background image positioning, button text color
- **Banner**: Mobile hover state fix
- **Footer**: EDS wrapper display fix

## Questions?

See the main README.md or USWDS documentation at https://designsystem.digital.gov/
