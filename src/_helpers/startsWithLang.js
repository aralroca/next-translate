export default function startsWithLang(url, allLanguages) {
  return allLanguages.some((l) =>
    new RegExp(`(^\/${l}\/)|(^\/${l}$)|(^\/${l}#.*$)`).test(url)
  )
}
