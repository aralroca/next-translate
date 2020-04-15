import React, { createContext, useContext } from 'react'
import I18nContext from './_context'
import { setInternals } from './_helpers/_internals'

const NsContext = createContext({})

/**
 * Get value from key (allow nested keys as parent.children)
 */
function getDicValue(dic, key = '') {
  const value = key.split('.').reduce((val, key) => val[key] || {}, dic)
  return typeof value === 'string' ? value : undefined
}

/**
 * Control plural keys depending the {{count}} variable
 */
function plural(dic, key, query) {
  if (!query || typeof query.count !== 'number') return key

  const numKey = `${key}_${query.count}`
  if (getDicValue(dic, numKey) !== undefined) return numKey

  const pluralKey = `${key}_plural`
  if (query.count > 1 && getDicValue(dic, pluralKey) !== undefined)
    return pluralKey

  return key
}

/**
 * Replace {{variables}} to query values
 */
function interpolation(text, query) {
  if (!text || !query) return text || ''

  return Object.keys(query).reduce((all, varKey) => {
    const regex = new RegExp(`{{\\s*${varKey}\\s*}}`, 'gm')
    all = all.replace(regex, `${query[varKey]}`)
    return all
  }, text)
}

export default function I18nProvider({
  lang,
  namespaces = {},
  children,
  internals = {},
}) {
  const ns = useContext(NsContext)
  const allNamespaces = { ...ns, ...namespaces }

  setInternals({ ...internals, lang })

  function t(key = '', query) {
    const k = Array.isArray(key) ? key[0] : key
    const [namespace, i18nKey] = k.split(':')
    const dic = allNamespaces[namespace] || {}
    const keyWithPlural = plural(dic, i18nKey, query)
    const value = getDicValue(dic, keyWithPlural)

    return interpolation(value, query) || k
  }

  return (
    <I18nContext.Provider value={{ lang, t }}>
      <NsContext.Provider value={allNamespaces}>{children}</NsContext.Provider>
    </I18nContext.Provider>
  )
}
