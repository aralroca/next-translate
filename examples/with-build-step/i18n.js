module.exports = {
  locales: ['en', 'ca', 'es'],
  defaultLocale: 'en',
  loadLocaleFrom: (locale, ns) =>
    import(`./locales/${locale}/${ns}.json`).then((m) => m.default),
  loader: true,
  pages: {
    '*': ['common'],
    '/404': ['error'],
    '/': ['home'],
    '/dashboard': ['home'],
    'rgx:^/more-examples': ['more-examples'],
  },
}
