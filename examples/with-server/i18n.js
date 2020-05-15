const defaultLangsFromHost = {
  'uk.co': 'en',
  cat: 'ca',
  com: 'ca',
  default: 'es', // localhost
}

function getDomain(host) {
  const domain = host.split('.')
  return domain[domain.length - 1]
}

module.exports = {
  allLanguages: ['en', 'ca', 'es'],
  defaultLanguage: (req) => {
    let host = req ? req.get('Host') : window.location.hostname
    const domain = getDomain(host)
    return defaultLangsFromHost[domain] || defaultLangsFromHost.default
  },
  defaultLangRedirect: 'lang-path',
  loadLocaleFrom: (lang, ns) =>
    import(`./locales/${lang}/${ns}.json`).then((m) => m.default),
  pages: {
    '*': ['common'],
    '/': ['home'],
    '/more-examples': ['more-examples'],
    '/more-examples/different-namespaces-by-query': ({ query }) =>
      query.fromDynamic ? ['dynamic'] : ['more-examples'],
  },
}
