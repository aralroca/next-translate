export default function appendLangPrefix(url, lang) {
  const fix = (u) =>
    `/${[lang, u.replace(/^\//, '')].filter(Boolean).join('/')}`

  if (url?.pathname) return { ...url, pathname: fix(url.pathname) }
  if (!url?.length) return url

  return fix(url)
}
