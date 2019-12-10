export default function i18nMiddleware(config = {}) {
  const {
    ignoreRoutes = [
      '/_next/',
      '/static/',
      '/favicon.ico',
      '/manifest.json',
      '/robots.txt',
    ],
    defaultLanguage = 'en',
    allLanguages = [],
  } = config

  return (req, res, next) => {
    const ignore = ignoreRoutes.some(r => req.url.startsWith(r))
    const startsWithLang = allLanguages.some(l => req.url.startsWith(`/${l}`))

    /**
     * Don't translate ignoreRoutes
     */
    if (ignore) return next()

    /**
     * Add defaultLang if is not present on the url
     */
    if (!startsWithLang) {
      req.lang = defaultLanguage
      req.query = { ...req.query, lang: defaultLanguage }
      return next()
    }

    const lang = req.url.split('/')[1]

    // Remove lang subpath to allow next.js to render the same page
    req.url = req.url.replace(`/${lang}`, '') || '/'

    // Don't translate ignoreRoutes and redirect without lang
    const [redirect] = ignoreRoutes.filter(r => req.url.startsWith(r))
    if (redirect) {
      res.redirect(301, redirect)
      return
    }

    // Add lang if is present on the url
    req.lang = lang
    req.query = { ...req.query,  lang }
    return next()
  }
}
