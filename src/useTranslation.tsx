import { useContext, useMemo } from 'react'
import { I18n } from '.'
import wrapTWithDefaultNs from './wrapTWithDefaultNs'
import I18nContext from './_context'

export default function useTranslation(defaultNS?: string): I18n {
  const ctx = useContext(I18nContext)
  return useMemo(
    () => ({
      ...ctx,
      t: wrapTWithDefaultNs(ctx.t, defaultNS),
    }),
    [ctx.lang, defaultNS]
  )
}
