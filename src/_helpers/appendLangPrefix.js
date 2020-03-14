export default function appendLangPrefix(url, lang) {
  if (!url || !url.length) return url

  return `/${lang}/${url.replace(/^\//, '')}`.replace(/\/$/, '')
}
