/** @type {import('stylelint').Config} */
module.exports = {
  extends: ['stylelint-config-recess-order'],
  overrides: [
    {
      files: ['**/*.scss', '**/*.sass'],
      customSyntax: require('postcss-scss'),
    },
  ],
  ignoreFiles: ['node_modules/**', '.wxt/**', 'dist/**', 'output/**'],
};
