import { NextComponentType } from 'next'
import React from 'react'
import loadFallbackPageNamespaces from './loadFallbackPageNamespaces'

/**
 * HOC to use translations for Next.js fallback pages.
 */
export default function withFallbackTranslation<P = unknown>(
  Component: React.ComponentType<P> | NextComponentType<any, any, any>
) {
  const WithTranslation = (props: P) => {
    return <Component {...props} />
  }

  WithTranslation.__PAGE_NEXT_NAMESPACES = ({
    locale,
    pathname,
  }: { locale?: string; pathname?: string } = {}) => {
    // hydrate translations on client from DOM
    if (typeof window !== 'undefined') {
      const namespacesScript = document.getElementById(
        '__NEXT_NAMESPACES_DATA__'
      )

      if (namespacesScript) {
        return JSON.parse(namespacesScript.innerHTML)
      }

      return {}
    }

    const ns = loadFallbackPageNamespaces({ locale, pathname })

    return { ...ns }
  }

  return WithTranslation
}
