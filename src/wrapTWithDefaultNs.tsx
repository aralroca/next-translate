import { Translate } from '.'

export default function wrapTWithDefaultNs(
  oldT: Translate,
  defaultNS?: string
): Translate {
  if (typeof defaultNS !== 'string') return oldT

  // Use default namespace if namespace is missing
  const t: Translate = (key, query, options) => {
    return oldT(key, query, { ...options, defaultNS: defaultNS })
  }

  return t
}
