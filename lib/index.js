import { createContext, useContext } from 'react'

const I18nContext = createContext({})

export function I18nProvider({ lang, namespaces = {}, children }){
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

export function useTranslation(){
  return useContext(I18nContext)
}
