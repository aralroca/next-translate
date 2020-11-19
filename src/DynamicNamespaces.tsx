import React, { ReactNode, useEffect, useState } from 'react'
import { DynamicNamespacesProps, I18nDictionary } from '.'
import I18nProvider from './I18nProvider'
import useTranslation from './useTranslation'

export default function DynamicNamespaces({
  dynamic,
  namespaces = [],
  fallback,
  children,
}: DynamicNamespacesProps): ReactNode {
  const { lang, loadLocaleFrom } = useTranslation()
  const [loaded, setLoaded] = useState(false)
  const [pageNs, setPageNs] = useState<I18nDictionary[]>([])
  const loadLocale = dynamic || loadLocaleFrom

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
