module.exports = {
  locales: ['en', 'ca', 'es'],
  defaultLocale: 'en',
  loadLocaleFrom: (lang, ns) =>
    import(`./locales/${lang}/${ns}.json`).then((m) => m.default),
  pages: {
    '*': ['common'],
    '/': ['home'],
    '/more-examples': ['more-examples'],
    '/more-examples/catchall/[...all]': ['more-examples'],
    '/more-examples/dynamicroute/[slug]': ['more-examples'],
    '/more-examples/different-namespaces-by-query': ({ query }) =>
      query.fromDynamic ? ['dynamic'] : ['more-examples'],
  },
}
