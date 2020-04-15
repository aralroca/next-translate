import i from './_internals'
import appendLangPrefix from './appendLangPrefix'

export default (as, href, lng) => {
  const isDefault = !i.redirectToDefaultLang && i.defaultLanguage === lng
  if (isDefault && i.isStaticMode) return as
  return i.isStaticMode
    ? appendLangPrefix(as, lng)
    : appendLangPrefix(as || href, lng)
}
