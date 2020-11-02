const fs = require('fs')
const hasHOC = require('./hasHOC').default

function hasGetInitialPropsOnAppJs(arePagesInsideSrc) {
  const pagesPath =
    process.cwd() + (arePagesInsideSrc ? '/src/pages' : '/pages')
  const app = fs
    .readdirSync(pagesPath)
    .filter((page) => page.startsWith('_app.'))

  if (!app) return false

  const code = fs.readFileSync(`${pagesPath}/${app}`).toString('UTF-8')

  return /\WgetInitialProps\W/g.test(code) || hasHOC(code)
}

module.exports = hasGetInitialPropsOnAppJs
