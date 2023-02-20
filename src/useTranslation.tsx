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
  const { lang, namespaces } = globalThis.__NEXT_TRANSLATE__ || {}
  const localesToIgnore = globalThis.i18nConfig.localesToIgnore || ['default']
  const ignoreLang = localesToIgnore.includes(lang)
  const t = transCore({
    config: globalThis.i18nConfig,
    allNamespaces: namespaces,
    pluralRules: new Intl.PluralRules(ignoreLang ? undefined : lang),
    lang,
  })

  return { t: wrapTWithDefaultNs(t, defaultNS), lang }
}

export default function useTranslation(defaultNS?: string): I18n {
  const isAppDir = !!globalThis.__NEXT_TRANSLATE__
  const useT = isAppDir ? useTranslationAppDir : useTranslationInPages
  return useT(defaultNS)
}
