import getDefaultLang from './_helpers/getDefaultLang'

export default function i18nMiddleware(config = {}) {
  let {
    ignoreRoutes = [
      '/_next/',
      '/static/',
      '/favicon.ico',
      '/manifest.json',
      '/robots.txt',
    ],
    allLanguages = [],
    defaultLangRedirect,
    redirectToDefaultLang: _deprecated_redirectToDefaultLang,
  } = config

  // @todo 1.0.0 Remove this backwards compatibility.
  if (_deprecated_redirectToDefaultLang !== undefined) {
    defaultLangRedirect = _deprecated_redirectToDefaultLang
      ? 'lang-path'
      : undefined
    console.warn(
      'redirectToDefaultLang is deprecated and will be removed in future major versions. Use defaultLangRedirect instead. Docs: https://github.com/vinissimus/next-translate/blob/master/README.md#4-configuration'
    )
  }

  return (req, res, next) => {
    const ignore = ignoreRoutes.some((r) => req.url.startsWith(r))
    const startsWithLang = allLanguages.some((l) => req.url.startsWith(`/${l}`))
    const defaultLanguage = getDefaultLang(req, config) || 'en'

    /**
     * Don't translate ignoreRoutes
     */
    if (ignore) return next()

    /**
     * When lang is not present on the url
     * Redirect or add lang without redirecting (depending the config)
     */
    if (!startsWithLang) {
      if (defaultLangRedirect === 'lang-path') {
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
    if (defaultLangRedirect === 'root' && lang === defaultLanguage) {
      res.redirect(301, req.url)
      return
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
