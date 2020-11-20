import { useContext } from 'react'
import I18nContext from './_context'

export default function useTranslation(defaultNs) {
  const ctx = useContext(I18nContext)

  if (typeof defaultNs !== 'string') return ctx

  // Use default namespace if namespace is missing
  function t(key = '', query, options) {
    let k = Array.isArray(key) ? key[0] : key
    if (!k.includes(':')) k = `${defaultNs}:${k}`
    return ctx.t(k, query, options)
  }

  return { ...ctx, t }
}
