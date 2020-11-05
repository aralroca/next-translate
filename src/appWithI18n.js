import React from 'react'
import App from 'next/app'
import I18nProvider from './I18nProvider'
import loadNamespaces from './loadNamespaces'

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
        lang={props.pageProps?.__lang || props.__lang}
        namespaces={props.pageProps?.__namespaces || props.__namespaces}
        logger={logger}
      >
        <AppToTranslate {...props} />
      </I18nProvider>
    )
  }

  if (config.skipInitialProps) return AppWithTranslations

  AppWithTranslations.getInitialProps = async (appCtx) => {
    const ctx = { ...(appCtx.ctx || {}), ...(appCtx || {}) }
    let appProps = { pageProps: {} }

    const getInitialProps =
      AppToTranslate.getInitialProps || App.getInitialProps

    if (getInitialProps) {
      appProps = (await getInitialProps(appCtx)) || {}
    }

    return {
      ...appProps,
      ...(await loadNamespaces({ ...ctx, ...config })),
    }
  }

  return AppWithTranslations
}
