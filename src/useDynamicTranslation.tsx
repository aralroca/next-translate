import { useContext, useEffect, useMemo, useState } from 'react'
import { DynamicI18n, I18nConfig, LocaleLoader, I18nDictionary } from '.'
import transCore from './transCore'
import { InternalContext } from './I18nProvider'
import I18nContext from './_context'

export default function useDynamicTranslation(
  defaultNS: string,
  dynamic?: LocaleLoader
): DynamicI18n {
  const [ready, setReady] = useState<boolean>(false)
  const internal = useContext(InternalContext)
  const ctx = useContext(I18nContext)
  const config = internal.config as I18nConfig
  const [pageNs, setPageNs] = useState<I18nDictionary | null>(null)
  const loadLocale =
    dynamic || config.loadLocaleFrom || (() => Promise.resolve({}))

  async function loadNamespaces() {
    if (typeof loadLocale !== 'function') return

    const nameSpace = await loadLocale(ctx.lang, defaultNS)
    setPageNs(nameSpace)
    setReady(true)
  }

  useEffect(() => {
    if (!defaultNS) {
      setReady(true)
      return
    }
    loadNamespaces()
  }, [defaultNS])

  return useMemo(() => {
    const allNamespaces: Record<string, I18nDictionary> = {
      ...internal.ns,
      ...(pageNs && { [defaultNS]: pageNs }),
    }
    const localesToIgnore = config.localesToIgnore || ['default']
    const ignoreLang = localesToIgnore.includes(ctx.lang)
    const pluralRules = new Intl.PluralRules(ignoreLang ? undefined : ctx.lang)

    return {
      ...ctx,
      t: transCore({ config, allNamespaces, pluralRules, lang: ctx.lang }),
      ready,
    }
  }, [ctx.lang, defaultNS, ready, pageNs])
}
