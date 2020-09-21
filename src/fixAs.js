import i from './_helpers/_internals'
import appendLangPrefix from './_helpers/appendLangPrefix'

export default (as, href, lng) => {
  const isRoot =
    i.defaultLangRedirect !== 'lang-path' && i.defaultLanguage === lng
  const fallback = i.isStaticMode ? undefined : href?.pathname || href

  if (isRoot) return as || fallback
  return appendLangPrefix(as || fallback, lng)
}
