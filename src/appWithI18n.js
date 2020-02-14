import React from 'react'
import I18nProvider from './I18nProvider'
import getDefaultLang from './_helpers/getDefaultLang'
import getPageNamespaces from './_helpers/getPageNamespaces'

function getLang(ctx, config) {
  const { req, asPath = '' } = ctx

  if (req) return req.query.lang || getDefaultLang(req, config)

  const startsWithLang = config.allLanguages.some(l =>
    asPath.startsWith(`/${l}`)
  )

  return startsWithLang ? asPath.split('/')[1] : getDefaultLang(req, config)
}

function removeTrailingSlash(path = '') {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
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
      appProps =
        (await AppToTranslate.getInitialProps({
          Component,
          ctx,
          lang,
        })) || {}
    }
    const page = removeTrailingSlash(ctx.pathname)
    const namespaces = await getPageNamespaces(config, page, ctx)
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
