# USWDS + EDS Architecture Decisions

## Overview

This document records the key architectural decisions made for integrating USWDS (United States Web Design System) with Adobe Edge Delivery Services (EDS). Each decision includes the context, options considered, decision made, and rationale.

---

## Decision 1: Build-Time Compilation vs. Runtime Compilation

### Context

USWDS is distributed as Sass files that require compilation. EDS expects pre-compiled CSS files and doesn't support runtime build processes.

### Options Considered

**Option A: Runtime Compilation**
- Compile Sass on each request or page load
- Pros: Always up-to-date, dynamic theming
- Cons: Violates EDS architecture, poor performance, complex deployment

**Option B: Build-Time Compilation (Development)**
- Compile Sass during development, commit generated files
- Pros: EDS-compliant, simple deployment, no runtime overhead
- Cons: Generated files in repository, must rebuild when upgrading

**Option C: Build-Time Compilation (CI/CD)**
- Compile Sass during deployment pipeline
- Pros: Cleaner repository, automated
- Cons: EDS deployment doesn't support build steps, more complex setup

### Decision

**Option B: Build-Time Compilation during development**

### Rationale

- EDS architecture expects static files
- Simpler deployment (no build step in production)
- Generated files show clear diffs in version control
- Developers control when compilation happens
- Standard practice in EDS projects

### Consequences

- Generated CSS/JS files will be committed to repository
- Developers must run build script after USWDS upgrades
- Clear documentation needed about when to rebuild

---

## Decision 2: CSS Architecture - Monolithic vs. Modular

### Context

USWDS typically compiles to a single large CSS file (~500KB). EDS loads CSS per-block for optimal performance.

### Options Considered

**Option A: Single USWDS.css File**
- Include entire USWDS CSS on every page
- Pros: Simple, everything always available
- Cons: Large file size, poor performance, violates EDS patterns

**Option B: Fully Modular (Per-Block Only)**
- Each block includes ALL its CSS (including typography, colors, etc.)
- Pros: True per-block loading
- Cons: Massive duplication, very large total CSS

**Option C: Hybrid (Core + Per-Block)**
- Core CSS with shared styles (typography, colors, utilities)
- Block CSS with component-specific styles
- Pros: Balance of performance and maintainability
- Cons: Slightly more complex, core CSS loaded globally

### Decision

**Option C: Hybrid approach with core + per-block CSS**

### Rationale

- Shared USWDS foundation (typography, colors, grid) used by all components
- Component-specific styles isolated to blocks
- Reduces duplication while maintaining modularity
- Core CSS (~50-100KB) cached globally
- Block CSS (~5-20KB each) loaded as needed
- Total page weight much smaller than monolithic

### Implementation

```
styles/uswds-core.css         # ~50-100KB - loaded globally
blocks/button/button.css       # ~8KB    - loaded when used
blocks/accordion/accordion.css # ~12KB   - loaded when used
```

### Consequences

- Core CSS must be included in `head.html`
- Build script must carefully separate core vs. component styles
- Core CSS changes require reviewing impact on all blocks

---

## Decision 3: JavaScript Integration Pattern

### Context

USWDS provides JavaScript modules for interactive components. EDS uses a block decorator pattern.

### Options Considered

**Option A: Direct USWDS JavaScript**
- Use USWDS JS directly without wrapper
- Pros: Simple, no custom code
- Cons: Doesn't integrate with EDS lifecycle, initialization issues

**Option B: Custom Reimplementation**
- Rewrite all component JavaScript for EDS
- Pros: Perfect EDS integration
- Cons: Massive effort, hard to maintain, loses USWDS benefits

**Option C: Wrapped USWDS JavaScript**
- Wrap USWDS JS modules in EDS decorators
- Pros: Uses official USWDS code, easy to upgrade, EDS-compliant
- Cons: Thin integration layer needed

### Decision

**Option C: Wrap USWDS JavaScript in EDS decorators**

### Pattern

```javascript
// blocks/accordion/accordion.js
import accordion from '@uswds/uswds/js/usa-accordion';

export default function decorate(block) {
  // 1. Any EDS-specific HTML transformation
  
  // 2. Initialize USWDS component
  accordion.on(block);
  
  // 3. Cleanup function
  return () => accordion.off(block);
}
```

### Rationale

- Leverages official USWDS JavaScript
- Maintains USWDS component behavior and accessibility
- Easy to upgrade (USWDS updates flow through automatically)
- Follows EDS patterns
- Minimal custom code to maintain

### Consequences

- Each component needs a thin decorator wrapper
- Must import USWDS JS modules (requires npm package)
- Need to understand both USWDS and EDS initialization patterns

---

## Decision 4: Asset Management Strategy

### Context

USWDS includes fonts, icons, and images with specific path requirements.

### Options Considered

**Option A: Reference Assets in node_modules**
- Point CSS directly to node_modules/@uswds/uswds/dist/
- Pros: No copying needed, always in sync
- Cons: Deployment issues, path complexity, not self-contained

**Option B: Copy Assets to Project**
- Copy fonts, icons, images during build
- Pros: Self-contained project, simple deployment, correct paths
- Cons: Duplication, must copy again after USWDS updates

**Option C: CDN Hosting**
- Host USWDS assets on CDN
- Pros: No local files, cached globally
- Cons: External dependency, version management, path management

### Decision

**Option B: Copy assets to project during build**

### Rationale

- Makes project self-contained and deployable
- Ensures correct relative paths in CSS
- Standard practice for EDS projects
- No runtime dependencies
- Assets part of version control (can diff changes)

### Implementation

Build script copies:
- `fonts/` - USWDS web fonts
- `icons/` - USWDS icon sets and sprite
- `images/` - Component images

### Consequences

- Assets duplicated from node_modules
- Must re-copy when upgrading USWDS
- Assets committed to repository (increases repo size slightly)
- Need to configure Sass to use correct paths

---

## Decision 5: Component Naming Convention

### Context

USWDS uses `usa-*` naming (e.g., `usa-button`). EDS uses simpler block names (e.g., `button`).

### Options Considered

**Option A: Keep USWDS Names**
- Blocks named `usa-button`, `usa-accordion`, etc.
- Pros: Clear USWDS connection, no mapping needed
- Cons: Verbose, not EDS convention, harder for authors

**Option B: Use EDS Names**
- Blocks named `button`, `accordion`, etc.
- Pros: Clean, EDS convention, author-friendly
- Cons: Need mapping, potential conflicts

**Option C: Prefixed EDS Names**
- Blocks named `uswds-button`, `uswds-accordion`, etc.
- Pros: Clear origin, avoids conflicts
- Cons: Still verbose, not standard EDS

### Decision

**Option B: Use simple EDS names with mapping**

### Mapping Strategy

```javascript
{
  'usa-button': 'button',
  'usa-accordion': 'accordion',
  'usa-card': 'cards',
  // ... etc
}
```

### Rationale

- Simpler for content authors
- Follows EDS conventions
- Cleaner URLs and class names
- Mapping in build config keeps USWDS connection clear
- For conflicting names, use descriptive variants

### Consequences

- Need mapping configuration
- Documentation must reference both names
- When USWDS adds new components, must choose EDS name

---

## Decision 6: Theme Customization Approach

### Context

Projects need to customize USWDS to match their brand while staying upgradeable.

### Options Considered

**Option A: Fork USWDS**
- Create custom version of USWDS
- Pros: Total control
- Cons: Can't upgrade easily, massive maintenance burden

**Option B: CSS Overrides**
- Use stock USWDS, override with custom CSS
- Pros: Easy to upgrade USWDS
- Cons: Fighting specificity, larger CSS, not using USWDS theming

**Option C: USWDS Theme Settings**
- Use USWDS's built-in theming via Sass variables
- Pros: Supported approach, compiles efficiently, upgradeable
- Cons: Limited to USWDS's theme tokens

**Option D: Hybrid (Theme + Overrides)**
- Use USWDS theme settings for core, CSS overrides for edge cases
- Pros: Best of both worlds
- Cons: Two customization methods to manage

### Decision

**Option D: Hybrid approach**

Primary: USWDS theme settings
Secondary: CSS overrides when necessary

### Implementation

```javascript
// uswds.config.js
{
  theme: {
    primary: 'blue-60v',
    typographyBaseFontFamily: 'Public Sans Web',
    // ... all theme tokens
  }
}
```

```css
/* blocks/button/button.css */
/* USWDS compiled styles */
.usa-button { ... }

/* Project-specific overrides (minimal) */
.button .usa-button.custom-variant {
  /* Override only when necessary */
}
```

### Rationale

- Uses USWDS the way it's designed to be used
- Theme settings compiled efficiently
- Easy to upgrade (just rebuild)
- Overrides only when truly needed
- Clear separation of concerns

### Consequences

- Must learn USWDS theme system
- Two places to look for customizations
- Need to document why overrides exist

---

## Decision 7: Version Control of Generated Files

### Context

Build script generates CSS and JavaScript files. Should these be committed?

### Options Considered

**Option A: Commit Generated Files**
- Git tracks generated CSS/JS
- Pros: Simple deployment, visible diffs, no build step in production
- Cons: Larger repository, generated files in version control

**Option B: Ignore Generated Files**
- Git ignores generated files, regenerate on deployment
- Pros: Cleaner repository, only source files tracked
- Cons: Must build on every deployment, EDS doesn't support build steps

**Option C: Separate Build Branch**
- Development branch has source only, build branch has generated files
- Pros: Clean separation
- Cons: Complex workflow, merge conflicts, not standard for EDS

### Decision

**Option A: Commit generated files**

### Files to Commit

- `blocks/*/[component].css` - Generated CSS
- `blocks/*/[component].js` - Generated/wrapped JS
- `styles/uswds-core.css` - Generated core CSS
- `fonts/` - Copied fonts
- `icons/` - Copied icons

### Files to Ignore

- `node_modules/`
- Build logs
- Temporary files

### Rationale

- EDS expects static files in repository
- Simple deployment (no build step)
- Generated files show intent (visible diffs)
- Standard practice for EDS projects
- Developers control when generation happens

### Consequences

- Generated files in PRs (larger diffs)
- Must document clearly which files are generated
- Need good comments in generated files
- PR reviewers see generated code changes

---

## Decision 8: USWDS Version Strategy

### Context

USWDS releases updates regularly. How to manage versions?

### Options Considered

**Option A: Pin to Specific Version**
- Lock to exact USWDS version
- Pros: Predictable, no surprises
- Cons: Missing updates, security issues, new features

**Option B: Use Latest Always**
- Always use latest USWDS
- Pros: Latest features and fixes
- Cons: Breaking changes, unstable

**Option C: Use Range (Patch/Minor)**
- Allow patch and minor updates: `^3.13.0`
- Pros: Gets fixes, stays stable
- Cons: Potential unexpected changes

### Decision

**Option C: Use caret range for minor/patch updates**

```json
{
  "dependencies": {
    "@uswds/uswds": "^3.13.0"
  }
}
```

### Update Strategy

- **Automatic**: Patch updates (3.13.0 → 3.13.1)
- **Manual**: Minor updates (3.13.0 → 3.14.0)
- **Planned**: Major updates (3.x → 4.x)

### Process

1. Monitor USWDS releases
2. Review release notes
3. Test updates in branch
4. Run `npm run upgrade:uswds`
5. Test generated output
6. Commit if successful

### Rationale

- Gets security fixes automatically
- Stays relatively stable
- Controlled upgrade process
- Can pin further if issues arise

### Consequences

- Must test after `npm install`
- Document current version clearly
- Create upgrade guide for major versions

---

## Decision 9: Testing Strategy

### Context

Need to ensure components work correctly and remain accessible.

### Options Considered

**Option A: No Automated Tests**
- Manual testing only
- Pros: Simple, no test infrastructure
- Cons: Error-prone, slow, not comprehensive

**Option B: Full Test Suite**
- Unit tests, integration tests, visual regression, a11y tests
- Pros: Comprehensive, catches issues early
- Cons: Complex, time-consuming to create

**Option C: Focused Testing**
- Key tests for critical functionality
- Automated accessibility checks
- Bundle size monitoring
- Manual testing for complex scenarios
- Pros: Balance of coverage and effort
- Cons: Some gaps in coverage

### Decision

**Option C: Focused testing approach**

### Test Coverage

**Automated**:
- Bundle size checks (in build script)
- Linting (ESLint, Stylelint)
- Accessibility (axe-core for critical components)

**Manual**:
- Cross-browser testing
- Screen reader testing
- Complex user interactions
- Visual review

**Optional** (Future):
- Visual regression tests
- Unit tests for custom logic
- E2E tests for critical flows

### Rationale

- Practical for initial implementation
- Focuses on most important aspects (accessibility, size)
- Room to expand later
- Leverages USWDS's existing testing

### Consequences

- Some issues may slip through
- Must do thorough manual testing
- Document testing procedures clearly

---

## Decision 10: Documentation Structure

### Context

Need comprehensive documentation for developers, authors, and maintainers.

### Options Considered

**Option A: Single README**
- Everything in one README file
- Pros: Simple, one place to look
- Cons: Too long, hard to navigate

**Option B: Wiki**
- Separate wiki for documentation
- Pros: Organized, searchable
- Cons: Separate from code, can diverge

**Option C: Multiple Markdown Files**
- Different files for different audiences
- Pros: Focused, in repository, versioned
- Cons: Multiple files to maintain

### Decision

**Option C: Multiple documentation files**

### Documentation Files

**For Developers**:
- `USWDS-INTEGRATION-PLAN.md` - Comprehensive architectural plan
- `ARCHITECTURE-DECISIONS.md` - This document
- `QUICK-START.md` - Getting started guide
- `CONTRIBUTING.md` - Contribution guidelines

**For Each Component**:
- `blocks/[component]/README.md` - Component usage

**Configuration**:
- `uswds.config.js` - Inline comments
- `scripts/build-uswds.js` - Inline comments

**For Authors** (Future):
- Author guide
- Component showcase

### Rationale

- Clear separation of concerns
- Easy to find relevant information
- Documentation versioned with code
- Each file focused on one topic

### Consequences

- Multiple files to maintain
- Must keep cross-references updated
- Need clear navigation between docs

---

## Summary of Key Decisions

| Decision | Choice | Primary Rationale |
|----------|--------|------------------|
| **Compilation** | Build-time (development) | EDS requires static files |
| **CSS Architecture** | Hybrid (core + per-block) | Balance performance & maintainability |
| **JavaScript** | Wrapped USWDS modules | Uses official code, easy upgrades |
| **Assets** | Copy to project | Self-contained, correct paths |
| **Naming** | Simple EDS names | Author-friendly, EDS conventions |
| **Theming** | USWDS theme + overrides | Supported, upgradeable |
| **Version Control** | Commit generated files | EDS pattern, simple deployment |
| **Versioning** | Caret range (^) | Gets fixes, stays stable |
| **Testing** | Focused + manual | Practical, covers critical aspects |
| **Documentation** | Multiple MD files | Clear, focused, versioned |

---

## Trade-offs Summary

### What We Gain

✅ **Official USWDS components** - Proven, accessible, compliant  
✅ **Easy upgrades** - Update npm package, rebuild  
✅ **EDS compatibility** - Follows all EDS patterns  
✅ **Performance** - Modular loading, optimized bundles  
✅ **Maintainability** - Minimal custom code  
✅ **Accessibility** - WCAG 2.1 AA by default  
✅ **Government compliance** - Section 508 ready  

### What We Trade

⚠️ **Generated files in repo** - Larger diffs, generated code in PRs  
⚠️ **Build step required** - Must run script after USWDS updates  
⚠️ **Core CSS always loaded** - ~50-100KB on every page  
⚠️ **Integration layer** - Thin wrappers for each component  
⚠️ **Learning curve** - Must understand both USWDS and EDS  

### What We Avoid

❌ **Runtime compilation** - Would violate EDS architecture  
❌ **Monolithic CSS** - Would hurt performance  
❌ **Custom reimplementation** - Would be unmaintainable  
❌ **Complex deployment** - No build steps in production  
❌ **Forking USWDS** - Would lose upgrade path  

---

## Future Considerations

### Potential Improvements

1. **Component Templates** - Generate block templates automatically
2. **Visual Regression Testing** - Catch visual changes in upgrades
3. **Performance Monitoring** - Track bundle sizes over time
4. **A11y Automation** - Automated accessibility testing in CI
5. **CDN for Core CSS** - Load core styles from CDN
6. **Dynamic Core CSS** - Build core CSS based on components used
7. **Author GUI** - Visual component builder for authors
8. **npm Package** - Publish as reusable package

### Known Limitations

1. **IE11 Not Supported** - USWDS 3.x dropped IE11 support
2. **Manual Testing Required** - Not fully automated
3. **Build Script Complexity** - May need maintenance
4. **USWDS Major Updates** - May require significant work

---

## Questions & Answers

### Why not use pre-compiled USWDS CSS directly?

USWDS's pre-compiled CSS is monolithic (~500KB+). EDS requires per-block CSS for performance. We need to split and customize USWDS CSS, which requires compilation.

### Can we use a different build tool besides Node.js?

Technically yes, but USWDS is a Node package with Sass. Using Node/npm is the path of least resistance and integrates well with EDS's existing tooling.

### What if USWDS makes breaking changes?

We're using semantic versioning (^3.13.0) which won't auto-update to breaking changes. Major updates require:
1. Review breaking changes
2. Update build script if needed
3. Test thoroughly
4. Update migration guide

### How do we handle USWDS components not suited for EDS?

Some USWDS components might not map well to EDS blocks. Options:
1. Adapt the component
2. Use as a page template instead of a block
3. Skip the component
4. Create custom variation

### Can we contribute back to USWDS?

Yes! If we find bugs or make improvements that would benefit USWDS:
1. Create issue in USWDS repo
2. Submit PR to USWDS
3. Document workaround in our project until merged

---

*Document Version: 1.0*  
*Date: January 27, 2026*  
*Last Updated: January 27, 2026*
