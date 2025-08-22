// https://docs.expo.dev/guides/using-eslint/
const js = require('@eslint/js');
const typescript = require('typescript-eslint');

module.exports = [
  js.configs.recommended,
  ...typescript.configs.recommended,
  {
    ignores: ['dist/*', 'node_modules/*', 'build/*', '.expo/*', '**/*.js'],
  },
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    }
  }
];
