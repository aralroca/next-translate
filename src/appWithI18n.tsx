import React from 'react'
import type { NextPage } from 'next'
import I18nProvider from './I18nProvider'
import loadNamespaces from './loadNamespaces'
import { LoaderConfig } from '.'

type Props = {
  [key: string]: any
}

export default function appWithI18n(
  AppToTranslate: NextPage,
  config: LoaderConfig = {}
) {
  if (!config.isLoader && config.loader !== false) {
    console.warn(
      '🚨 [next-translate] You can remove the "appWithI18n" HoC on the _app.js, unless you set "loader: false" in your i18n config file.'
    )
  }

  function AppWithTranslations(props: Props) {
    const { defaultLocale } = config

    return (
      <I18nProvider
        lang={props.pageProps?.__lang || props.__lang || defaultLocale}
        namespaces={props.pageProps?.__namespaces || props.__namespaces}
        config={config}
      >
        <AppToTranslate {...props} />
      </I18nProvider>
    )
  }

  // @ts-ignore
  if (typeof window === 'undefined') global.i18nConfig = config
  // @ts-ignore
  else window.i18nConfig = config

  if (config.skipInitialProps) return AppWithTranslations

  AppWithTranslations.getInitialProps = async (appCtx: any) => {
    const ctx = { ...(appCtx.ctx || {}), ...(appCtx || {}) }
    let appProps: object = { pageProps: {} }

    if (AppToTranslate.getInitialProps) {
      appProps = (await AppToTranslate.getInitialProps(appCtx)) || {}
    }

    return {
      ...appProps,
      ...(await loadNamespaces({
        ...ctx,
        ...config,
        loaderName: 'getInitialProps',
      })),
    }
  }

  return AppWithTranslations
}
