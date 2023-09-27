import { useContext, useMemo } from 'react'
import { I18n } from '.'
import wrapTWithDefaultNs from './wrapTWithDefaultNs'
import I18nContext from './context'
import createTranslation from './createTranslation'

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

export default function useTranslation(defaultNS?: string): I18n {
  const appDir = globalThis.__NEXT_TRANSLATE__
  const useT = appDir?.config ? createTranslation : useTranslationInPages
  return useT(defaultNS)
}
