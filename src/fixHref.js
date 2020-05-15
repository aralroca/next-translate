import i from './_helpers/_internals'
import appendLangPrefix from './_helpers/appendLangPrefix'

export default (href, lng) => {
  const isDefault = !i.redirectToDefaultLang && i.defaultLanguage === lng
  return i.isStaticMode && !isDefault ? appendLangPrefix(href, lng) : href
}
