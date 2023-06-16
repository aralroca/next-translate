module.exports = {
  locales: ['en', 'ca', 'es'],
  defaultLocale: 'en',
  pages: {
    '*': ['common'],
    '/[lang]': ['home'],
    '/[lang]/second-page': ['home'],
  },
}
