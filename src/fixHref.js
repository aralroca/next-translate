import i from './_helpers/_internals'
import appendLangPrefix from './_helpers/appendLangPrefix'

export default (href, lng) => {
  const isRoot =
    i.defaultLangRedirect !== 'lang-path' && i.defaultLanguage === lng
  const url = i.isStaticMode && !isRoot ? appendLangPrefix(href, lng) : href

  if (i.isStaticMode) return url

  const fix = (u) => (u.includes('?') ? `${u}&lang=${lng}` : `${u}?lang=${lng}`)

  if (url?.pathname) return { ...url, pathname: fix(url.pathname) }

  return fix(url)
}
