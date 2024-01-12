import {
  I18nConfig,
  I18nDictionary,
  LoaderConfig,
  LoggerProps,
  TranslationQuery,
} from '.'
import { Translate } from './index'

function splitNsKey(key: string, nsSeparator: string | false) {
  if (!nsSeparator) return { i18nKey: key }
  const i = key.indexOf(nsSeparator)
  if (i < 0) return { i18nKey: key }
  return {
    namespace: key.slice(0, i),
    i18nKey: key.slice(i + nsSeparator.length),
  }
}

export default function transCore({
  config,
  allNamespaces,
  pluralRules,
  lang,
}: {
  config: LoaderConfig
  allNamespaces: Record<string, I18nDictionary>
  pluralRules: Intl.PluralRules
  lang: string | undefined
}): Translate {
  const {
    logger = missingKeyLogger,
    // An optional parameter allowEmptyStrings - true as default.
    // If allowEmptyStrings parameter is marked as false,
    // it should log an error when an empty string is attempted to be translated
    // and return the namespace and key as result of the translation.
    allowEmptyStrings = true,
  } = config

  const interpolateUnknown = (
    value: unknown,
    query?: TranslationQuery | null
  ): typeof value => {
    if (Array.isArray(value)) {
      return value.map((val) => interpolateUnknown(val, query))
    }
    if (value instanceof Object) {
      return objectInterpolation({
        obj: value as Record<string, unknown>,
        query,
        config,
        lang,
      })
    }
    return interpolation({ text: value as string, query, config, lang })
  }

  const t: Translate = (key = '', query, options) => {
    const k = Array.isArray(key) ? key[0] : key
    const { nsSeparator = ':', loggerEnvironment = 'browser' } = config

    const { i18nKey, namespace = options?.ns ?? config.defaultNS } = splitNsKey(
      k,
      nsSeparator
    )

    const dic = (namespace && allNamespaces[namespace]) || {}
    const keyWithPlural = plural(
      pluralRules,
      dic,
      i18nKey,
      config,
      query,
      options
    )
    const dicValue = getDicValue(dic, keyWithPlural, config, options)
    const value =
      typeof dicValue === 'object'
        ? JSON.parse(JSON.stringify(dicValue))
        : dicValue

    const empty =
      typeof value === 'undefined' ||
      (typeof value === 'object' && !Object.keys(value).length) ||
      (value === '' && !allowEmptyStrings)

    const fallbacks =
      typeof options?.fallback === 'string'
        ? [options.fallback]
        : options?.fallback || []

    if (
      empty &&
      (loggerEnvironment === 'both' ||
        loggerEnvironment ===
          (typeof window === 'undefined' ? 'node' : 'browser'))
    ) {
      logger({ namespace, i18nKey })
    }

    // Fallbacks
    if (empty && Array.isArray(fallbacks) && fallbacks.length) {
      const [firstFallback, ...restFallbacks] = fallbacks
      if (typeof firstFallback === 'string') {
        return t(firstFallback, query, { ...options, fallback: restFallbacks })
      }
    }

    if (
      empty &&
      options &&
      // options.default could be a nullish value so check that the property exists
      options.hasOwnProperty('default') &&
      !fallbacks?.length
    ) {
      // if options.default is falsey there's no reason to do interpolation
      return options.default
        ? interpolateUnknown(options.default, query)
        : options.default
    }

    // no need to try interpolation
    if (empty) {
      return k
    }

    // this can return an empty string if either value was already empty
    // or it contained only an interpolation (e.g. "{{name}}") and the query param was empty
    return interpolateUnknown(value, query)
  }

  return t
}

/**
 * Get value from key (allow nested keys as parent.children)
 */
function getDicValue(
  dic: I18nDictionary,
  key: string = '',
  config: I18nConfig,
  options: { returnObjects?: boolean; fallback?: string | string[] } = {
    returnObjects: false,
  }
): unknown | undefined {
  const { keySeparator = '.' } = config || {}
  const keyParts = keySeparator ? key.split(keySeparator) : [key]

  if (key === keySeparator && options.returnObjects) return dic

  const value: string | object = keyParts.reduce(
    (val: I18nDictionary | string, key: string) => {
      if (typeof val === 'string') {
        return {}
      }

      const res = val[key as keyof typeof val]

      // pass all truthy values or (empty) strings
      return res || (typeof res === 'string' ? res : {})
    },
    dic
  )

  if (
    typeof value === 'string' ||
    ((value as unknown) instanceof Object &&
      options.returnObjects &&
      Object.keys(value).length > 0)
  ) {
    return value
  }

  if (Array.isArray(value) && options.returnObjects) return value
  return undefined
}

/**
 * Control plural keys depending the {{count}} variable
 */
function plural(
  pluralRules: Intl.PluralRules,
  dic: I18nDictionary,
  key: string,
  config: I18nConfig,
  query?: TranslationQuery | null,
  options?: {
    returnObjects?: boolean
    fallback?: string | string[]
  }
): string {
  if (!query || typeof query.count !== 'number') return key

  const numKey = `${key}_${query.count}`
  if (getDicValue(dic, numKey, config, options) !== undefined) return numKey

  const pluralKey = `${key}_${pluralRules.select(query.count)}`
  if (getDicValue(dic, pluralKey, config, options) !== undefined) {
    return pluralKey
  }

  const nestedNumKey = `${key}.${query.count}`
  if (getDicValue(dic, nestedNumKey, config, options) !== undefined)
    return nestedNumKey

  const nestedKey = `${key}.${pluralRules.select(query.count)}`
  if (getDicValue(dic, nestedKey, config, options) !== undefined)
    return nestedKey

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
  lang?: string | undefined
}): string {
  if (!text || !query) return text || ''

  const escapeRegex = (str: string) =>
    str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const {
    format = null,
    prefix = '{{',
    suffix = '}}',
  } = config.interpolation || {}

  const regexEnd =
    suffix === '' ? '' : `(?:[\\s,]+([\\w-]*))?\\s*${escapeRegex(suffix)}`
  return Object.keys(query).reduce((all, varKey) => {
    const regex = new RegExp(
      `${escapeRegex(prefix)}\\s*${varKey}${regexEnd}`,
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
  lang?: string
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
  if (!namespace) {
    console.warn(
      `[next-translate] The text "${i18nKey}" has no namespace in front of it.`
    )
    return
  }
  console.warn(
    `[next-translate] "${namespace}:${i18nKey}" is missing in current namespace configuration. Try adding "${i18nKey}" to the namespace "${namespace}".`
  )
}
