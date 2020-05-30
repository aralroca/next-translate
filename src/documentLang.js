const path = require('path')
const fs = require('fs')

export default function documentLang({ __NEXT_DATA__ }) {
  const configDir = path.join(process.cwd(), 'i18n.json')
  const i = JSON.parse(fs.readFileSync(configDir))
  const { page } = __NEXT_DATA__
  const [, langQuery] = page.split('/')
  const lang = i.allLanguages.find((l) => l === langQuery)

  return lang || i.defaultLanguage
}
