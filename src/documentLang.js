export default function documentLang({ __NEXT_DATA__ }) {
  const { resolve } = require('path')
  const i = require(resolve(process.cwd() + '/i18n.json'))
  const { page } = __NEXT_DATA__
  const [, langQuery] = page.split('/')
  const lang = i.allLanguages.find((l) => l === langQuery)

  return lang || i.defaultLanguage
}
