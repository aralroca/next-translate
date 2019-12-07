import React, { useEffect, useState } from 'react'
import I18nProvider from './I18nProvider'
import useTranslation from './useTranslation'

export default function DynamicNamespaces({
  dynamic,
  namespaces = [],
  fallback,
  children,
}) {
  const { lang } = useTranslation()
  const [loaded, setLoaded] = useState(false)
  const [pageNs, setPageNs] = useState({})

  async function loadNamespaces() {
    if (typeof dynamic !== 'function') return

    const pageNamespaces = await Promise.all(
      namespaces.map(ns => dynamic(lang, ns))
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
      }, {})}
    >
      {children}
    </I18nProvider>
  )
}
