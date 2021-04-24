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

    var ns = {}
    var pageProps

    if (typeof window === 'undefined') {
      if (
        props.router &&
        props.router.isFallback &&
        props.Component &&
        typeof props.Component.__PAGE_NEXT_NAMESPACES === 'function'
      ) {
        ns =
          props.Component.__PAGE_NEXT_NAMESPACES({
            locale: props.router.locale,
            pathname: props.router.pathname,
          }) || {}

        pageProps = { ...ns, ...props.pageProps }
      }
    } else {
      if (
        props.Component &&
        typeof props.Component.__PAGE_NEXT_NAMESPACES === 'function'
      ) {
        ns = props.Component.__PAGE_NEXT_NAMESPACES() || {}

        pageProps = { ...ns, ...props.pageProps }
      }
    }

    if (pageProps == null) {
      pageProps = props.pageProps
    }

    var newProps: any = {
      ...props,
      pageProps,
    }

    return (
      <I18nProvider
        lang={pageProps?.__lang || props.__lang || defaultLocale}
        namespaces={pageProps?.__namespaces || props.__namespaces}
        config={config}
      >
        <AppToTranslate {...newProps} />
        <script
          id="__NEXT_NAMESPACES_DATA__"
          type="application/json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ns || {}),
          }}
        />
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
