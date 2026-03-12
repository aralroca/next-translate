module.exports = {
  locales: ['en', 'ca', 'es'],
  defaultLocale: 'en',
  loader: false, // This deactivate the webpack loader that loads the namespaces
  pages: {
    '*': ['common'],
    '/404': ['error'],
    '/': ['home'],
    '/dashboard': ['home'],
    'rgx:^/more-examples': ['more-examples'],
  },
  // When loader === false (or when using Turbopack), then loadLocaleFrom is required
  loadLocaleFrom: (locale, namespace) =>
    import(`./locales/${locale}/${namespace}`).then((r) => r.default),
}
