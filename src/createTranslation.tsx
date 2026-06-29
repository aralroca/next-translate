import { useMemo } from 'react'
import isServer from './isServer'
import safePluralRules from './safePluralRules'
import transCore from './transCore'
import wrapTWithDefaultNs from './wrapTWithDefaultNs'

// Only for App directory
export default function createTranslation(defaultNS?: string) {
  const { lang, namespaces, config } = globalThis.__NEXT_TRANSLATE__ ?? {}
  const localesToIgnore = config.localesToIgnore || ['default']
  const ignoreLang = !lang || localesToIgnore.includes(lang)
  const getT = () => {
    const t = transCore({
      config,
      allNamespaces: namespaces,
      pluralRules: safePluralRules(ignoreLang ? undefined : lang),
      lang,
    })

    return wrapTWithDefaultNs(t, defaultNS)
  }

  // A stable signature of the currently loaded namespace set. In the Pages
  // Router the appWithI18n HoC reassigns globalThis.__NEXT_TRANSLATE__ on every
  // navigation, so a translation function held by a component that never
  // unmounts (e.g. lifted to _app or a context provider) would otherwise stay
  // memoized on the first page's namespaces and miss namespaces loaded later.
  // Keying on the namespace names refreshes t when the set actually changes,
  // while keeping its identity stable otherwise (#447).
  const nsKey = namespaces ? Object.keys(namespaces).sort().join('|') : ''
  const t = isServer() ? getT() : useMemo(getT, [defaultNS, lang, nsKey])
  return { t, lang }
}
