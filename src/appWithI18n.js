import React from 'react'
import App from 'next/app'
import I18nProvider from './I18nProvider'
import getDefaultLang from './_helpers/getDefaultLang'
import getPageNamespaces from './_helpers/getPageNamespaces'
import startsWithLang from './_helpers/startsWithLang'

function getLang(ctx, config) {
  const { req, asPath = '' } = ctx

  if (req) return req.query.lang || config.defaultLanguage

  if (startsWithLang(asPath, config.allLanguages)) {
    if (asPath.includes('#')) {
      return asPath.replace(/#[\w-]+/, '').split('/')[1]
    }

    return asPath.split('/')[1]
  }

  return config.defaultLanguage
}

function removeTrailingSlash(path = '') {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}

export default function appWithI18n(AppToTranslate, config = {}) {
  function AppWithTranslations(props) {
    const { lang, namespaces, defaultLanguage } = props
    const { defaultLangRedirect } = config

    return (
      <I18nProvider
        lang={lang}
        namespaces={namespaces}
        internals={{ defaultLangRedirect, defaultLanguage }}
      >
        <AppToTranslate {...props} />
      </I18nProvider>
    )
  }

  AppWithTranslations.getInitialProps = async (appCtx) => {
    const { Component, ctx } = appCtx
    const defaultLanguage = ctx.req
      ? getDefaultLang(ctx.req, config)
      : __NEXT_DATA__.props.defaultLanguage
    const lang = getLang(ctx, { ...config, defaultLanguage })
    const getInitialProps =
      AppToTranslate.getInitialProps || App.getInitialProps
    let appProps = { pageProps: {} }

    if (getInitialProps) {
      appProps = (await getInitialProps({ ...appCtx, lang })) || {}
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
      lang,
      defaultLanguage,
      namespaces: namespaces.reduce((obj, ns, i) => {
        obj[ns] = pageNamespaces[i]
        return obj
      }, {}),
    }
  }

  return AppWithTranslations
}
