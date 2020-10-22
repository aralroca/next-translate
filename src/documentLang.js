const path = require('path')
const fs = require('fs')

export default function documentLang({ __NEXT_DATA__ }, config) {
  if (!config) {
    const file = fs.existsSync(process.cwd() + '/i18n.js')
      ? 'i18n.js'
      : 'i18n.json'

    config = require(path.join(process.cwd(), file))
  }

  const { page } = __NEXT_DATA__
  const [, langQuery] = page.split('/')
  const lang = config.allLanguages.find((l) => l === langQuery)

  return lang || config.defaultLanguage
}
