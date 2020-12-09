import { Translate } from '.'

export default function wrapTWithDefaultNs(oldT: any, defaultNs?: string) {
  if (typeof defaultNs !== 'string') return oldT

  // Use default namespace if namespace is missing
  function t(key = '', query, options): Translate {
    let k = Array.isArray(key) ? key[0] : key
    if (!k.includes(':')) k = `${defaultNs}:${k}`
    return oldT(k, query, options)
  }

  return t
}
