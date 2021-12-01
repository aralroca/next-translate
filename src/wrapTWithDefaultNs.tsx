import { Translate } from '.'

export default function wrapTWithDefaultNs(
  oldT: Translate,
  ns?: string
): Translate {
  if (typeof ns !== 'string') return oldT

  // Use default namespace if namespace is missing
  const t: Translate = (key, query, options) => {
    return oldT(key, query, { ns, ...options })
  }

  return t
}
