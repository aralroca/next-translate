const fs = require('fs')

module.exports = {
  locales: ['en', 'ca', 'es'],
  defaultLocale: 'en',
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
  loadLocaleFrom: (locale, namespace) =>
    import(`./src/translations/${namespace}_${locale}`).then((m) => m.default),

  loadLocaleFromSync: (locale, namespace) => {
    return JSON.parse(
      fs.readFileSync(`./src/translations/${namespace}_${locale}.json`)
    )
  },
}
