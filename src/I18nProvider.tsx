import React, { createContext, useContext } from 'react'
import { useRouter } from 'next/router'
import I18nContext from './_context'
import transCore from './transCore'
import useTranslation from './useTranslation'
import { I18n, I18nProviderProps } from '.'

export const InternalContext = createContext({ ns: {}, config: {} })

export default function I18nProvider({
  lang: lng,
  namespaces = {},
  children,
  config: newConfig = {},
}: I18nProviderProps) {
  const { lang: parentLang } = useTranslation()
  const { locale, defaultLocale } = useRouter() || {}
  const lang = lng || parentLang || locale || defaultLocale || ''
  const internal = useContext(InternalContext)
  const allNamespaces = { ...internal.ns, ...namespaces } as Record<
    string,
    Object
  >
  const pluralRules = new Intl.PluralRules(lang)
  const config = { ...internal.config, ...newConfig }
  const t = transCore({ config, allNamespaces, pluralRules })

  return (
    <I18nContext.Provider value={{ lang, t } as I18n}>
      <InternalContext.Provider value={{ ns: allNamespaces, config }}>
        {children}
      </InternalContext.Provider>
    </I18nContext.Provider>
  )
}
