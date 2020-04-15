import i from './_internals'
import appendLangPrefix from './appendLangPrefix'

export default (href, lng) => {
  const isDefault = !i.redirectToDefaultLang && i.defaultLanguage === lng
  return i.isStaticMode && !isDefault ? appendLangPrefix(href, lng) : href
}
