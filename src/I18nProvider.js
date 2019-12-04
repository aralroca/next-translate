import React from 'react'
import I18nContext from './_context'

/**
 * Control plural keys depending the {{count}} variable
 */
function plural(dic, key, query) {
  if(!query || typeof query.count !== 'number') return key
  
  const numKey = `${key}_${query.count}`
  if(dic[numKey] !== undefined) return numKey

  const pluralKey = `${key}_plural`
  if(query.count > 1 && dic[pluralKey] !== undefined) return pluralKey

  return key
}

/**
 * Replace {{variables}} to query values
 */
function interpolation(text, query) {
  if(!text || !query) return text || ''

  return Object.keys(query).reduce((all, varKey) => {
    const regex = new RegExp(`{{\\s*${varKey}\\s*}}`, 'gm')
    all = all.replace(regex, `${query[varKey]}`)
    return all
  }, text)
}

export function I18nProvider({ lang, namespaces = {}, children }){
  function t(key = '', query){
    const [namespace, i18nKey] = key.split(':')
    const dic = namespaces[namespace] || {}
    const keyWithPlural = plural(dic, i18nKey, query)
    
    return interpolation(dic[keyWithPlural], query) || key
  }

  return(
    <I18nContext.Provider value={{ lang, t }}>
      {children}
    </I18nContext.Provider>
  )
}
