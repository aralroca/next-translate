import React, { useContext, useEffect, useState } from 'react'
import { DynamicNamespacesProps, I18nDictionary, I18nConfig } from '.'
import I18nProvider, { InternalContext } from './I18nProvider'
import useTranslation from './useTranslation'

export default function DynamicNamespaces({
  dynamic,
  namespaces = [],
  fallback,
  children,
}: DynamicNamespacesProps): any {
  const config = useContext(InternalContext).config as I18nConfig
  const { lang } = useTranslation()
  const [loaded, setLoaded] = useState(false)
  const [pageNs, setPageNs] = useState<I18nDictionary[]>([])
  const loadLocale =
    dynamic || config.loadLocaleFrom || (() => Promise.resolve({}))

  async function loadNamespaces() {
    if (typeof loadLocale !== 'function') return

    const pageNamespaces = await Promise.all(
      namespaces.map((ns) => loadLocale(lang, ns))
    )
    setPageNs(pageNamespaces)
    setLoaded(true)
  }

  useEffect(() => {
    loadNamespaces()
  }, [])

  if (!loaded) return fallback || null

  return (
    <I18nProvider
      lang={lang}
      namespaces={namespaces.reduce((obj, ns, i) => {
        obj[ns] = pageNs[i]
        return obj
      }, {} as Record<string, I18nDictionary>)}
    >
      {children}
    </I18nProvider>
  )
}
