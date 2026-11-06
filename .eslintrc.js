module.exports = {
  root: true,
  extends: 'airbnb-base',
  env: {
    browser: true,
  },
  parser: '@babel/eslint-parser',
  parserOptions: {
    allowImportExportEverywhere: true,
    sourceType: 'module',
    requireConfigFile: false,
  },
  rules: {
    'import/extensions': ['error', { js: 'always' }], // require js file extensions in imports
    'linebreak-style': ['error', 'unix'], // enforce unix linebreaks
    'no-param-reassign': [2, { props: false }], // allow modifying properties of param
    'import/no-cycle': 0, // Allow modules to use each other
  },
  overrides: [
    {
      // USWDS-generated block files
      files: ['blocks/*/*.js'],
      rules: {
        'import/no-unresolved': ['error', {
          ignore: ['^@uswds/'], // Allow USWDS imports
        }],
      },
    },
    {
      // Build scripts and configuration files
      files: ['scripts/**/*.js', '*.config.js', 'uswds.config.js'],
      rules: {
        'no-console': 'off', // Console output needed for build logs
        'import/no-extraneous-dependencies': 'off', // Build tools in devDependencies
        'no-restricted-syntax': 'off', // Allow for...of loops in build scripts
        'no-await-in-loop': 'off', // Sequential operations needed in build
        'no-use-before-define': 'off', // Function hoisting common in scripts
        'no-continue': 'off', // Control flow in loops
        'no-param-reassign': 'off', // Param manipulation in utilities
      },
    },
  ],
};
