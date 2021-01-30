import React from 'react'
import I18nProvider from './I18nProvider'
import loadNamespaces from './loadNamespaces'
import { LoaderConfig } from '.'

type Props = {
  [key: string]: any
}

interface PartialNextContext {
  res?: any
  AppTree?: NextComponentType<PartialNextContext>
  Component?: NextComponentType<PartialNextContext>
  ctx?: PartialNextContext
  [key: string]: any
}

type NextComponentType<
  C extends PartialNextContext = PartialNextContext,
  IP = {},
  P = {}
> = React.ComponentType<P> & {
  getInitialProps?(context: C): IP | Promise<IP>
}

export default function appWithI18n(
  AppToTranslate: NextComponentType,
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

  if (typeof config.staticsHoc === 'function') {
    config.staticsHoc(AppWithTranslations, AppToTranslate)
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
