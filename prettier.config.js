/** @type {import("prettier").Config} */
const config = {
  // Formatting
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  semi: true,
  singleQuote: true,
  quoteProps: 'as-needed',
  jsxSingleQuote: false,
  trailingComma: 'all',
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  embeddedLanguageFormatting: 'auto',

  // Per-language overrides
  overrides: [
    {
      files: ['*.json', '*.jsonc'],
      options: { printWidth: 80 },
    },
    {
      files: ['*.md', '*.mdx'],
      options: {
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: ['*.yaml', '*.yml'],
      options: {
        singleQuote: false,
        printWidth: 80,
      },
    },
    {
      files: ['*.css'],
      options: { singleQuote: false },
    },
  ],
};

export default config;
