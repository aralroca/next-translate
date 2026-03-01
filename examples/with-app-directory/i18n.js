module.exports = {
  locales: ['en', 'ca', 'es'],
  defaultLocale: 'en',
  pages: {
    '*': ['common'],
    '/[lang]': ['home'],
    '/[lang]/second-page': ['home'],
    '/[lang]/remote-loading': ['remote'],
  },
  loadLocaleFrom: (lang, ns) => {
    if (ns === 'remote') {
      // Mocking a remote fetch
      return Promise.resolve({
        title: `Remote Title (${lang})`,
        description: `This is a remote translation for ${lang}!`,
        'html-example': 'This is a <0>remote</0> example with <b>HTML</b>',
      })
    }
    return import(`./locales/${lang}/${ns}.json`).then((m) => m.default)
  },
}
