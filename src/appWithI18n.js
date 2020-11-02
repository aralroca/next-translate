import React from 'react'
import App from 'next/app'
import I18nProvider from './I18nProvider'
import getPageNamespaces from './_helpers/getPageNamespaces'

function removeTrailingSlash(path = '') {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

export default function appWithI18n(AppToTranslate, config = {}) {
  if (!config.isLoader && config.loader !== false) {
    console.warn(
      '🚨 [next-translate] You can remove the "appWithI18n" HoC on the _app.js, unless you set "loader: false" in your i18n config file.'
    )
  }

  function AppWithTranslations(props) {
    const { logger } = config

    return (
      <I18nProvider
        lang={props.__lang}
        namespaces={props.__namespaces}
        logger={logger}
      >
        <AppToTranslate {...props} />
      </I18nProvider>
    )
  }

  if (config.skipInitialProps) return AppWithTranslations

  AppWithTranslations.getInitialProps = async (appCtx) => {
    const { router, ctx } = appCtx
    const lang = router.locale
    const getInitialProps =
      AppToTranslate.getInitialProps || App.getInitialProps
    let appProps = { pageProps: {} }

    if (getInitialProps) {
      appProps = (await getInitialProps(appCtx)) || {}
    }

    const page = removeTrailingSlash(ctx.pathname)
    const namespaces = await getPageNamespaces(config, page, ctx)
    const pageNamespaces =
      (await Promise.all(
        namespaces.map((ns) =>
          typeof config.loadLocaleFrom === 'function'
            ? config.loadLocaleFrom(lang, ns)
            : Promise.resolve([])
        )
      ).catch(() => {})) || []

    return {
      ...appProps,
      __lang: lang,
      __namespaces: namespaces.reduce((obj, ns, i) => {
        obj[ns] = pageNamespaces[i]
        return obj
      }, {}),
    }
  }

  return AppWithTranslations
}
