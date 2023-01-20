module.exports = {
  locales: ['__default', 'en', 'ca', 'es'],
  defaultLocale: '__default',
  localesToIgnore: ['__default'],
  pages: {
    '*': ['common'],
    '/404': ['error'],
    '/': ['home'],
    '/dashboard': ['home'],
    'rgx:^/more-examples': ['more-examples'],
  },
  interpolation: {
    prefix: '${',
    suffix: '}',
  },
  loadLocaleFrom: async (locale, namespace) =>
    require(`./src/translations/${namespace}_${locale}`),
}
