module.exports = {
  locales: ['en', 'ca', 'es'],
  defaultLocale: 'en',
  pages: {
    '*': ['common'],
    '/404': ['error'],
    '/': ['home'],
    '/dashboard': ['common', 'home'],
    'rgx:^/more-examples': ['more-examples'],
  },
}
