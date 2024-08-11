export default {
  endOfLine: 'auto',
  overrides: [{
    files: ['*.json5'],
    options: {
      quoteProps: 'preserve',
      singleQuote: false,
    },
  }, {
    files: ['*.yaml', '*.yml'],
    options: {
      singleQuote: false,
    },
  }],
  printWidth: 80,
  proseWrap: 'never',
  semi: false,
  singleQuote: true,
  trailingComma: 'all',
}
