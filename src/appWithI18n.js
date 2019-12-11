import React from 'react'
import I18nProvider from './I18nProvider'

function getLang(ctx, config) {
  const { req, asPath } = ctx

  if (req) return req.query.lang || config.defaultLanguage

  const startsWithLang = config.allLanguages.some(l =>
    asPath.startsWith(`/${l}`)
  )

  return startsWithLang ? asPath.split('/')[1] : config.defaultLanguage
}

export default function appWithI18n(AppToTranslate, config = {}) {
  function AppWithTranslations(props) {
    const { lang, namespaces } = props

    return (
      <I18nProvider lang={lang} namespaces={namespaces}>
        <AppToTranslate {...props} />
      </I18nProvider>
    )
  }

  AppWithTranslations.getInitialProps = async ({ Component, ctx }) => {
    const lang = getLang(ctx, config)
    let appProps = { pageProps: {} }

    if (AppToTranslate.getInitialProps) {
      appProps = (await AppToTranslate.getInitialProps({
        Component, ctx, lang
      })) || {}
    }

    const { pages = {} } = config
    const namespaces = pages[ctx.pathname] || []
    const pageNamespaces = await Promise.all(
      namespaces.map(ns =>
        typeof config.loadLocaleFrom === 'function'
          ? config.loadLocaleFrom(lang, ns)
          : Promise.resolve([])
      )
    )

    return {
      ...appProps,
      lang,
      namespaces: namespaces.reduce((obj, ns, i) => {
        obj[ns] = pageNamespaces[i]
        return obj
      }, {}),
    }
  }

  return AppWithTranslations
}
