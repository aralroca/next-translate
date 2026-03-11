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
  loadLocaleFrom: (locale, namespace) => {
    const locales = {
      en: {
        common: () => require('./locales/en/common.json'),
        home: () => require('./locales/en/home.json'),
        'more-examples': () => require('./locales/en/more-examples.json'),
        dynamic: () => require('./locales/en/dynamic.json'),
        error: () => require('./locales/en/error.json'),
      },
      es: {
        common: () => require('./locales/es/common.json'),
        home: () => require('./locales/es/home.json'),
        'more-examples': () => require('./locales/es/more-examples.json'),
        dynamic: () => require('./locales/es/dynamic.json'),
        error: () => require('./locales/es/error.json'),
      },
      ca: {
        common: () => require('./locales/ca/common.json'),
        home: () => require('./locales/ca/home.json'),
        'more-examples': () => require('./locales/ca/more-examples.json'),
        dynamic: () => require('./locales/ca/dynamic.json'),
        error: () => require('./locales/ca/error.json'),
      },
    }
    return Promise.resolve(locales[locale]?.[namespace]?.() || {})
  },
}
