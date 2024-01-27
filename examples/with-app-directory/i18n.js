module.exports = {
  locales: ['en-US', 'ca-US', 'es-US'],
  defaultLocale: 'en-US',
  pages: {
    '*': ['common'],
    '/[lang]': ['home'],
    '/[lang]/second-page': ['home'],
  },
}
