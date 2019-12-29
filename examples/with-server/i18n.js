module.exports = {
  allLanguages: ['en', 'ca', 'es'],
  defaultLanguage: 'es',
  redirectToDefaultLang: true,
  loadLocaleFrom: (lang, ns) =>
    import(`./locales/${lang}/${ns}.json`).then(m => m.default),
  pages: {
    '*': ['common'],
    '/': ['home'],
    '/more-examples': ['more-examples'],
  },
}
