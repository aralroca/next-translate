import i from './_helpers/_internals'
import appendLangPrefix from './_helpers/appendLangPrefix'

export default (as, href, lng) => {
  const isRoot =
    i.defaultLangRedirect !== 'lang-path' && i.defaultLanguage === lng
  if (isRoot && i.isStaticMode) return as
  return i.isStaticMode
    ? appendLangPrefix(as, lng)
    : appendLangPrefix(as || href, lng)
}
