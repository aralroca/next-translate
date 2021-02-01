import {
  I18nConfig,
  I18nDictionary,
  LoaderConfig,
  LoggerProps,
  TranslationQuery,
} from '.'
import { Translate } from './index'

export default function transCore({
  config,
  allNamespaces,
  pluralRules,
  lang,
}: {
  config: LoaderConfig
  allNamespaces: Record<string, I18nDictionary>
  pluralRules: Intl.PluralRules
  lang: string
}): Translate {
  const { logger = missingKeyLogger } = config

  const t: Translate = (key = '', query, options) => {
    const k = Array.isArray(key) ? key[0] : key
    const [namespace, i18nKey] = k.split(/:(.+)/)
    const dic = allNamespaces[namespace] || {}
    const keyWithPlural = plural(pluralRules, dic, i18nKey, query)
    const value = getDicValue(dic, keyWithPlural, options)

    const empty =
      typeof value === 'undefined' ||
      (typeof value === 'object' && !Object.keys(value).length)

    const fallbacks =
      typeof options?.fallback === 'string'
        ? [options.fallback]
        : options?.fallback || []

    // Log only during CSR
    if (typeof window !== 'undefined' && empty) {
      logger({ namespace, i18nKey })
    }

    // Fallbacks
    if (empty && Array.isArray(fallbacks) && fallbacks.length) {
      const [firstFallback, ...restFallbacks] = fallbacks
      if (typeof firstFallback === 'string') {
        return t(firstFallback, query, { ...options, fallback: restFallbacks })
      }
    }

    // no need to try interpolation
    if (empty) {
      return k
    }

    if (value instanceof Object) {
      return objectInterpolation({
        obj: value as Record<string, unknown>,
        query,
        config,
        lang,
      })
    }

    // this can return an empty string if either value was already empty
    // or it contained only an interpolation (e.g. "{{name}}") and the query param was empty
    return interpolation({ text: value as string, query, config, lang })
  }

  return t
}

/**
 * Get value from key (allow nested keys as parent.children)
 */
function getDicValue(
  dic: I18nDictionary,
  key: string = '',
  options: { returnObjects?: boolean; fallback?: string | string[] } = {
    returnObjects: false,
  }
): string | undefined | object {
  const value: string | object = key
    .split('.')
    .reduce((val: I18nDictionary | string, key: string) => {
      if (typeof val === 'string') {
        return {}
      }

      const res = val[key as keyof typeof val]

      // pass all truthy values or (empty) strings
      return res || (typeof res === 'string' ? res : {})
    }, dic)

  if (
    typeof value === 'string' ||
    ((value as unknown) instanceof Object && options.returnObjects)
  ) {
    return value
  }

  return undefined
}

/**
 * Control plural keys depending the {{count}} variable
 */
function plural(
  pluralRules: Intl.PluralRules,
  dic: I18nDictionary,
  key: string,
  query?: TranslationQuery | null
): string {
  if (!query || typeof query.count !== 'number') return key

  const numKey = `${key}_${query.count}`
  if (getDicValue(dic, numKey) !== undefined) return numKey

  const pluralKey = `${key}_${pluralRules.select(query.count)}`
  if (query.count > 1 && getDicValue(dic, pluralKey) !== undefined) {
    return pluralKey
  }

  const nestedNumKey = `${key}.${query.count}`
  if (getDicValue(dic, nestedNumKey) !== undefined) return nestedNumKey

  const nestedKey = `${key}.${pluralRules.select(query.count)}`
  if (getDicValue(dic, nestedKey) !== undefined) return nestedKey

  return key
}

/**
 * Replace {{variables}} to query values
 */
function interpolation({
  text,
  query,
  config,
  lang,
}: {
  text?: string
  query?: TranslationQuery | null
  config: I18nConfig
  lang: string
}): string {
  if (!text || !query) return text || ''

  const escapeRegex = (str: string) =>
    str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const { format = null, prefix = '{{', suffix = '}}' } =
    config.interpolation || {}

  return Object.keys(query).reduce((all, varKey) => {
    const regex = new RegExp(
      `${escapeRegex(prefix)}\\s*${varKey}\\s*,?\\s*([\\w-]+)?\\s*${escapeRegex(
        suffix
      )}`,
      'gm'
    )

    // $1 is the first match group
    return all.replace(regex, (_match, $1) => {
      // $1 undefined can mean either no formatting requested: "{{name}}"
      // or no format name given: "{{name, }}" -> ignore
      return $1 && format
        ? (format(query[varKey], $1, lang) as string)
        : (query[varKey] as string)
    })
  }, text)
}

function objectInterpolation({
  obj,
  query,
  config,
  lang,
}: {
  obj: Record<string, string | unknown>
  query?: TranslationQuery | null
  config: I18nConfig
  lang: string
}): any {
  if (!query || Object.keys(query).length === 0) return obj

  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof Object)
      objectInterpolation({
        obj: obj[key] as Record<string, string | unknown>,
        query,
        config,
        lang,
      })
    if (typeof obj[key] === 'string')
      obj[key] = interpolation({
        text: obj[key] as string,
        query,
        config,
        lang,
      })
  })

  return obj
}

function missingKeyLogger({ namespace, i18nKey }: LoggerProps): void {
  if (process.env.NODE_ENV === 'production') return

  // This means that instead of "ns:value", "value" has been misspelled (without namespace)
  if (!i18nKey) {
    console.warn(
      `[next-translate] The text "${namespace}" has no namespace in front of it.`
    )
    return
  }
  console.warn(
    `[next-translate] "${namespace}:${i18nKey}" is missing in current namespace configuration. Try adding "${i18nKey}" to the namespace "${namespace}".`
  )
}
