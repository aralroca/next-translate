import { Translate } from '.'

export default function wrapTWithDefaultNs(
  oldT: Translate,
  defaultNs?: string
): Translate {
  if (typeof defaultNs !== 'string') return oldT

  // Use default namespace if namespace is missing
  const t: Translate = (key = '', query, options) => {
    let k = Array.isArray(key) ? key[0] : key
    if (!k.includes(':')) k = `${defaultNs}:${k}`

    // Use default namespace for query.fallback keys
    if (options?.fallback) {
      if (Array.isArray(options.fallback)) {
        options.fallback = options.fallback.map((k) =>
          k.includes(':') ? k : `${defaultNs}:${k}`
        )
      } else {
        const k = options.fallback
        options.fallback = k.includes(':') ? k : `${defaultNs}:${k}`
      }
    }

    return oldT(k, query, options)
  }

  return t
}
