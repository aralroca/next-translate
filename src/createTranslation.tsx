import { useMemo } from 'react'
import isServer from './isServer'
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
      pluralRules: new Intl.PluralRules(ignoreLang ? undefined : lang),
      lang,
    })

    return wrapTWithDefaultNs(t, defaultNS)
  }

  const t = isServer() ? getT() : useMemo(getT, [defaultNS])
  return { t, lang }
}
