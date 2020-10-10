import i from './_helpers/_internals'
import appendLangPrefix from './_helpers/appendLangPrefix'

function fix(url, lng) {
  const includeLang = (u) =>
    u.includes('?') ? `${u}&lang=${lng}` : `${u}?lang=${lng}`

  if (url.includes('#')) {
    const split = url.split('#')
    return [includeLang(split[0], lng), split[1]].join('#')
  }

  return includeLang(url, lng)
}

export default (href, lng) => {
  const isRoot =
    i.defaultLangRedirect !== 'lang-path' && i.defaultLanguage === lng
  const url = i.isStaticMode && !isRoot ? appendLangPrefix(href, lng) : href

  if (i.isStaticMode) return url

  if (url?.pathname) return { ...url, pathname: fix(url.pathname, lng) }

  return fix(url, lng)
}
