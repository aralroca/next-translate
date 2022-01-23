import React, { createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import I18nContext from './_context'
import transCore from './transCore'
import useTranslation from './useTranslation'
import { I18nDictionary, I18nProviderProps } from '.'

export const InternalContext = createContext({ ns: {}, config: {} })

export default function I18nProvider({
  lang: lng,
  namespaces = {},
  children,
  config: newConfig = {},
}: I18nProviderProps) {
  const { lang: parentLang } = useTranslation()
  const { locale, defaultLocale } = useRouter() || {}
  const internal = useContext(InternalContext)
  const allNamespaces: Record<string, I18nDictionary> = {
    ...internal.ns,
    ...namespaces,
  }
  const lang = lng || parentLang || locale || defaultLocale || ''
  const config = { ...internal.config, ...newConfig }
  const localesToIgnore = config.localesToIgnore || ['default']
  const ignoreLang = localesToIgnore.includes(lang)
  const pluralRules = new Intl.PluralRules(ignoreLang ? undefined : lang)
  const t = transCore({ config, allNamespaces, pluralRules, lang })

  return (
    <I18nContext.Provider value={{ lang, t }}>
      <InternalContext.Provider value={{ ns: allNamespaces, config }}>
        {children}
      </InternalContext.Provider>
    </I18nContext.Provider>
  )
}
