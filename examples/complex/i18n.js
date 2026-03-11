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
  loadLocaleFrom: (locale, namespace) => {
    if (locale === '__default') return Promise.resolve({})
    const locales = {
      en: {
        common: () => require('./src/translations/common_en.json'),
        home: () => require('./src/translations/home_en.json'),
        'more-examples': () =>
          require('./src/translations/more-examples_en.json'),
        dynamic: () => require('./src/translations/dynamic_en.json'),
        error: () => require('./src/translations/error_en.json'),
      },
      es: {
        common: () => require('./src/translations/common_es.json'),
        home: () => require('./src/translations/home_es.json'),
        'more-examples': () =>
          require('./src/translations/more-examples_es.json'),
        dynamic: () => require('./src/translations/dynamic_es.json'),
        error: () => require('./src/translations/error_es.json'),
      },
      ca: {
        common: () => require('./src/translations/common_ca.json'),
        home: () => require('./src/translations/home_ca.json'),
        'more-examples': () =>
          require('./src/translations/more-examples_ca.json'),
        dynamic: () => require('./src/translations/dynamic_ca.json'),
        error: () => require('./src/translations/error_ca.json'),
      },
    }
    return Promise.resolve(locales[locale]?.[namespace]?.() || {})
  },
}
