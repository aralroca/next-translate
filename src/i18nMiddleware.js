import getDefaultLang from './_helpers/getDefaultLang'

export default function i18nMiddleware(config = {}) {
  const {
    ignoreRoutes = [
      '/_next/',
      '/static/',
      '/favicon.ico',
      '/manifest.json',
      '/robots.txt',
    ],
    allLanguages = [],
    redirectToDefaultLang = false,
  } = config

  return (req, res, next) => {
    const ignore = ignoreRoutes.some((r) => req.url.startsWith(r))
    const startsWithLang = allLanguages.some((l) => req.url.startsWith(`/${l}`))

    /**
     * Don't translate ignoreRoutes
     */
    if (ignore) return next()

    /**
     * When lang is not present on the url
     * Redirect or add lang without redirecting (depending the config)
     */
    if (!startsWithLang) {
      const defaultLanguage = getDefaultLang(req, config) || 'en'

      if (redirectToDefaultLang) {
        res.redirect(301, `/${defaultLanguage}${req.url}`)
        return
      }
      req.lang = defaultLanguage
      req.query = { ...req.query, lang: defaultLanguage }
      return next()
    }

    const lang = req.url.split('/')[1]

    // Remove lang subpath to allow next.js to render the same page
    req.url = req.url.replace(`/${lang}`, '') || '/'

    // Redirect to root url from default language
    if (!redirectToDefaultLang) {
      const defaultLanguage = getDefaultLang(req, config) || 'en'

      if (lang === defaultLanguage) {
        res.redirect(301, req.url)
        return
      }
    }

    // Don't translate ignoreRoutes and redirect without lang
    const [redirect] = ignoreRoutes.filter((r) => req.url.startsWith(r))
    if (redirect) {
      res.redirect(301, redirect)
      return
    }

    // Add lang if is present on the url
    req.lang = lang
    req.query = { ...req.query, lang }
    return next()
  }
}
