import { useContext, useMemo } from 'react'
import { I18n } from '.'
import wrapTWithDefaultNs from './wrapTWithDefaultNs'
import I18nContext from './context'
import transCore from './transCore'

function useTranslationInPages(defaultNS?: string): I18n {
  const ctx = useContext(I18nContext)
  return useMemo(
    () => ({
      ...ctx,
      t: wrapTWithDefaultNs(ctx.t, defaultNS),
    }),
    [ctx, defaultNS]
  )
}

function useTranslationAppDir(defaultNS?: string) {
  const { lang, namespaces, config } = globalThis.__NEXT_TRANSLATE__ ?? {}
  const localesToIgnore = config.localesToIgnore || ['default']
  const ignoreLang = localesToIgnore.includes(lang)
  const t = transCore({
    config,
    allNamespaces: namespaces,
    pluralRules: new Intl.PluralRules(ignoreLang ? undefined : lang),
    lang,
  })

  return { t: wrapTWithDefaultNs(t, defaultNS), lang }
}

export default function useTranslation(defaultNS?: string): I18n {
  const appDir = globalThis.__NEXT_TRANSLATE__
  const useT = appDir?.config ? useTranslationAppDir : useTranslationInPages
  return useT(defaultNS)
}
