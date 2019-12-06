import React from 'react'
import I18nProvider from './I18nProvider'

export default function appWithI18n(AppToTranslate, config = {}) {
  function AppWithTranslations(props) {
    const { lang, namespaces } = props
  
    return (
      <I18nProvider lang={lang} namespaces={namespaces} >
        <AppToTranslate {...props} />       
      </I18nProvider>
    )
  }

  AppWithTranslations.getInitialProps = async ({ Component, ctx }) => { 
    const lang = ctx.query.lang || config.defaultLanguage
    let pageProps = {}

    if(AppToTranslate.getInitialProps) {
      appProps = (await AppToTranslate.getInitialProps(ctx)) || {}
    }
  
    const namespaces = config.pages[ctx.pathname] || []
    const pageNamespaces = await Promise.all(namespaces.map(ns => (
      typeof config.loadLocaleFrom === 'function'
      ? config.loadLocaleFrom(lang, ns)
      : Promise.resolve([])
    )))

    return { 
      pageProps,
      lang,
      namespaces: namespaces.reduce((obj, ns, i) => {
        obj[ns] = pageNamespaces[i]
        return obj
      }, {}) 
    }
  }

  return AppWithTranslations
}
