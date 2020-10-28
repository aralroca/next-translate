export default function startsWithLang(url, locales) {
  return locales.some((l) =>
    new RegExp(`(^\/${l}\/)|(^\/${l}$)|(^\/${l}#.*$)`).test(url)
  )
}
