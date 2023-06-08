import React, { useEffect, useReducer } from 'react'
import type { LoaderConfig } from '.'

/**
 * @description HOC for internal use only (used by next-translate-plugin)
 */
export default function withTranslationClientComponent<
  P extends JSX.IntrinsicAttributes
>(
  Component: React.ComponentType<P>,
  i18nConfig: LoaderConfig
): React.ComponentType<P> {
  function WithTranslation(props: P) {
    // @ts-ignore
    const forceUpdate = useReducer(() => [])[1]
    const isClient = typeof window !== 'undefined'

    if (isClient && !window.__NEXT_TRANSLATE__) {
      window.__NEXT_TRANSLATE__ = {
        lang: i18nConfig.defaultLocale!,
        namespaces: {},
      }
      update(false)
    }

    if (isClient && !window.i18nConfig) {
      window.i18nConfig = i18nConfig
    }

    useEffect(update)

    function update(rerender = true) {
      const el = document.getElementById('__NEXT_TRANSLATE_DATA__')

      if (!el) return

      const { lang, ns, pathname } = el.dataset as {
        lang: string
        ns: string
        pathname: string
      }

      const shouldRerender =
        lang !== window.__NEXT_TRANSLATE__.lang ||
        pathname !== window.__NEXT_TRANSLATE__.pathname

      window.__NEXT_TRANSLATE__ = { lang, namespaces: JSON.parse(ns), pathname }

      if (shouldRerender && rerender) forceUpdate()
    }

    return <Component {...props} />
  }

  const displayName = Component.displayName || Component.name || 'Component'
  WithTranslation.displayName = `withTranslationClientComponent(${displayName})`

  return WithTranslation
}
