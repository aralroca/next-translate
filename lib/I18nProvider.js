import I18nContext from './_context'

export default function I18nProvider({ lang, namespaces = {}, children }){
  function t(key = ''){
    const [namespace, i18nKey] = key.split(':')
    const dic = namespaces[namespace] || {}

    return dic[i18nKey] || key
  }

  return(
    <I18nContext.Provider value={{ lang, t }}>
      {children}
    </I18nContext.Provider>
  )
}
