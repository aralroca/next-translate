import i from './_helpers/_internals'
import appendLangPrefix from './_helpers/appendLangPrefix'

export default (href, lng) => {
  const isRoot =
    i.defaultLangRedirect !== 'lang-path' && i.defaultLanguage === lng
  const url = i.isStaticMode && !isRoot ? appendLangPrefix(href, lng) : href

  if (i.isStaticMode) return url

  return url.includes('?') ? `${url}&lang=${lng}` : `${url}?lang=${lng}`
}
