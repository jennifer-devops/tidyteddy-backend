const globals = require('globals');
const pluginJs = require('@eslint/js');
const nPlugin = require('eslint-plugin-n');
const reactPlugin = require('eslint-plugin-react');

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  pluginJs.configs.recommended,
  {
    plugins: {
      n: nPlugin,
      react: reactPlugin,
    },
    rules: {
      'no-console': 'off', // Allow console statements in deployment
      'no-debugger': 'error', // Disallow debugger statements
      'eqeqeq': 'error', // Enforce strict equality
      'curly': 'error', // Require curly braces for all control statements
      'no-var': 'error', // Disallow var declarations
      'no-unused-vars': 'warn', // Warn about unused variables
    },
  },
];