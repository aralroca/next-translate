import i from './_helpers/_internals'
import appendLangPrefix from './_helpers/appendLangPrefix'

function includeLang(url, lng) {
  return url.includes('?') ? `${url}&lang=${lng}` : `${url}?lang=${lng}`
}

export default (href, lng) => {
  const isRoot =
    i.defaultLangRedirect !== 'lang-path' && i.defaultLanguage === lng
  const url = i.isStaticMode && !isRoot ? appendLangPrefix(href, lng) : href

  if (i.isStaticMode) return url

  if (url.includes('#')) {
    const split = url.split('#')
    return [includeLang(split[0], lng), split[1]].join('#')
  }

  return includeLang(url, lng)
}
