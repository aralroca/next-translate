import I18nContext from './_context'

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

export default function I18nProvider({ lang, namespaces = {}, children }){
  function t(key = '', query){
    const [namespace, i18nKey] = key.split(':')
    const dic = namespaces[namespace] || {}
    return interpolation(dic[i18nKey], query) || key
  }

  return(
    <I18nContext.Provider value={{ lang, t }}>
      {children}
    </I18nContext.Provider>
  )
}
