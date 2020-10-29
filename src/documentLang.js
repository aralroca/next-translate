const path = require('path')
const fs = require('fs')

console.warn(
  '🚨 [next-translate] documentLang is no longer needed, it should be remove it in next releases. Now i18n routing is part of the Next.js core. Read more about it here: https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
)

/**
 * @deprecated
 */
export default function documentLang({ __NEXT_DATA__ }, config) {
  if (!config) {
    const file = fs.existsSync(process.cwd() + '/i18n.js')
      ? 'i18n.js'
      : 'i18n.json'

    config = require(path.join(process.cwd(), file))
  }

  const { page } = __NEXT_DATA__
  const [, langQuery] = page.split('/')
  const lang = (config.locales || config.allLanguages).find(
    (l) => l === langQuery
  )

  return lang || config.defaultLocale || config.defaultLanguage
}
