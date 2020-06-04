const path = require('path')
const fs = require('fs')

export default function documentLang({ __NEXT_DATA__ }, config) {
  if (!config) {
    const configDir = path.join(process.cwd(), 'i18n.json')
    config = JSON.parse(fs.readFileSync(configDir))
  }

  const { page } = __NEXT_DATA__
  const [, langQuery] = page.split('/')
  const lang = config.allLanguages.find((l) => l === langQuery)

  return lang || config.defaultLanguage
}
