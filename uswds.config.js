/**
 * USWDS Configuration for EDS Integration
 *
 * This configuration file controls how USWDS components are built
 * and integrated into the EDS block structure.
 */

module.exports = {
  // USWDS package settings
  uswds: {
    version: '3.13.0', // Track current version
    packagePath: './node_modules/@uswds/uswds',
    packagesPath: './node_modules/@uswds/uswds/packages',
  },

  // Output paths
  output: {
    blocks: './blocks',
    styles: './styles',
    fonts: './fonts',
    icons: './icons',
    images: './images',
  },

  // USWDS theme settings (passed to Sass)
  theme: {
    // Asset paths (absolute from root to support blocks in subdirectories)
    fontPath: '/fonts',
    imagePath: '/icons',

    // Typography
    typographyBaseFontSize: '16px',
    typographyBaseFontFamily: 'Public Sans Web',
    typographyHeadingFontFamily: 'Merriweather Web',

    // Colors (can override USWDS defaults)
    // primary: 'blue-60v',
    // secondary: 'red-50v',
    // accent: 'cyan-30v',

    // Spacing
    siteMaxWidth: 'desktop',
    siteMargins: '4',
    siteMarginsBreakpoint: 'desktop',

    // Grid
    gridContainerMaxWidth: 'desktop',

    // Banner (government sites)
    bannerBackgroundColor: 'base-lightest',

    // Focus
    focusColor: 'blue-40v',
    focusWidth: '0.25rem',
    focusStyle: 'solid',
  },

  // Component mapping: USWDS component name → EDS block name
  // Only includes components that exist in USWDS packages
  componentMap: {
    // Core components
    'usa-button': 'button',
    'usa-link': 'link',
    'usa-icon': 'icon',
    'usa-tag': 'tag',

    // Layout components
    'usa-accordion': 'accordion',
    'usa-card': 'card',
    'usa-collection': 'collection',
    'usa-table': 'table',
    'usa-hero': 'hero',

    // Navigation components
    'usa-header': 'header',
    'usa-footer': 'footer',
    'usa-breadcrumb': 'breadcrumb',
    'usa-pagination': 'pagination',
    'usa-search': 'search',
    'usa-sidenav': 'side-nav',
    'usa-in-page-navigation': 'in-page-nav',
    'usa-step-indicator': 'step-indicator',

    // Form components
    'usa-form': 'form',
    'usa-input': 'text-input',
    'usa-textarea': 'textarea',
    'usa-select': 'select',
    'usa-checkbox': 'checkbox',
    'usa-radio': 'radio',
    'usa-button-group': 'button-group',
    'usa-character-count': 'character-count',
    'usa-combo-box': 'combo-box',
    'usa-date-picker': 'date-picker',
    'usa-date-range-picker': 'date-range-picker',
    'usa-file-input': 'file-input',
    'usa-input-mask': 'input-mask',
    'usa-input-prefix-suffix': 'input-prefix-suffix',
    'usa-memorable-date': 'memorable-date',
    'usa-range': 'range-slider',
    'usa-time-picker': 'time-picker',
    'usa-validation': 'validation',
    'usa-fieldset': 'fieldset',
    'usa-label': 'label',
    'usa-error-message': 'error-message',
    'usa-hint': 'hint',

    // Content components
    'usa-alert': 'alert',
    'usa-banner': 'banner',
    'usa-icon-list': 'icon-list',
    'usa-list': 'list',
    'usa-modal': 'modal',
    'usa-process-list': 'process-list',
    'usa-prose': 'prose',
    'usa-summary-box': 'summary-box',
    'usa-tooltip': 'tooltip',
    'usa-graphic-list': 'graphic-list',

    // Specialized components
    'usa-identifier': 'identifier',
    'usa-language-selector': 'language-selector',
  },

  // Components to exclude from build (if any)
  excludeComponents: [
    // Example: 'usa-language-selector' // if not needed
  ],

  // Core CSS configuration
  core: {
    // Include these USWDS features in core CSS
    include: [
      'typography',
      'colors',
      'spacing',
      'grid',
      'utilities',
      'focus',
    ],

    // Utility classes to include
    utilities: {
      // Include all utilities (larger file) or specific ones
      includeAll: false,
      include: [
        'layout-grid',
        'flex',
        'display',
        'margin',
        'padding',
        'text-align',
        'font-family',
        'font-size',
        'measure',
      ],
    },
  },

  // Sass compilation options
  sass: {
    includePaths: [
      './node_modules/@uswds/uswds/packages',
      './node_modules/@uswds/uswds/dist/scss',
    ],
    outputStyle: 'expanded', // 'expanded' or 'compressed'
    sourceMap: true,
    sourceMapContents: true,
  },

  // PostCSS/Autoprefixer options
  postcss: {
    autoprefixer: {
      overrideBrowserslist: [
        '> 2%',
        'last 2 versions',
        'not dead',
        'not IE 11',
      ],
    },
  },

  // Build options
  build: {
    // Clean output directories before build
    clean: false,

    // Verbose output
    verbose: true,

    // Generate source maps
    sourceMaps: true,

    // Minify CSS
    minify: false, // Set to true for production

    // Generate component documentation
    generateDocs: true,

    // Copy USWDS examples
    copyExamples: false,

    // Run linting after build
    runLinting: true,
  },

  // Asset handling
  assets: {
    fonts: {
      // Which USWDS fonts to copy
      families: [
        'public-sans',
        'merriweather',
        'roboto-mono',
        'source-sans-pro',
      ],
      formats: ['woff2', 'woff'], // Only copy these formats
    },

    icons: {
      // Copy all USWDS icons
      copyAll: true,
      // Or specify specific icon sets
      sets: ['usa-icons', 'usa-icons-bg', 'uswds-icons'],
      // Generate sprite
      generateSprite: true,
    },

    images: {
      // Copy USWDS images
      copy: true,
      // Optimize images
      optimize: false,
    },
  },

  // Development server settings (if implementing live reload)
  devServer: {
    enabled: false,
    port: 3000,
    livereload: true,
  },

  // Testing configuration
  testing: {
    // Run visual regression tests after build
    visualRegression: false,

    // Run accessibility tests
    a11y: false,

    // Check CSS size
    checkBundleSize: true,
    maxBundleSize: {
      core: 150 * 1024, // 150KB for core CSS
      block: 30 * 1024, // 30KB per block CSS
    },
  },

  // Documentation generation
  docs: {
    // Generate README for each block
    generateBlockReadmes: true,

    // Include USWDS documentation links
    includeUswdsLinks: true,

    // Generate usage examples
    generateExamples: true,
  },
};
