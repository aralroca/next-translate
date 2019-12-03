const fs = require('fs')
const execSync = require('child_process').execSync
const path = require('path')

const {
  currentPagesDir = 'pages_',
  defaultLanguage = 'en',
  pages = {},
  finalPagesDir = 'pages',
  localesPath = 'locales',
} = require('../i18n.json') || {}

function readDirR(dir) {
  return fs.statSync(dir).isDirectory()
    ? Array.prototype.concat(...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f))))
    : dir;
}

/**
 * STEP 1: Read current available locales
 */
fs.readdir(localesPath, (err, allLanguages) => {
  if(err) throw new Error(err)
  createPagesDir(allLanguages)
}) 

/**
 * STEP 2: Create /pages/ dir with their langs:
 * 
 * /pages/en/ - /pages/es/ ...
 */
async function createPagesDir(langs = []) {
  execSync(`rm -rf ${finalPagesDir} && mkdir ${finalPagesDir}`);

  langs.forEach(async lang => {
    execSync(`mkdir ${finalPagesDir}/${lang}`);
  })

  console.log(`Building pages | from ${currentPagesDir} to ${finalPagesDir}`)
  readPageNamespaces(langs)
}

/**
 * STEP 3: Read each page namespaces
 */
function readPageNamespaces(langs){
  readDirR(currentPagesDir).forEach(page => {
    const pageId = page.replace(currentPagesDir, '')
    const namespaces = pages[pageId] || []

    console.log(`🔨 ${pageId}`, namespaces)
    buildPageInAllLocales(page, namespaces, langs)
  })
}

/**
 * STEP 4: Build page in each lang path
 */
function getPageTemplate(prefix, page, lang, namespaces){
  return `import C from '${prefix}/${page}'
${
  namespaces.map((ns, i) => (
    `import ns${i} from '${prefix}/${localesPath}/${lang}/${ns}'`
  )).join('\n')
}
import I18nProvider from '${prefix}/lib/I18nProvider'

const namespaces = { ${namespaces.map((ns, i) => `'${ns}': ns${i}`).join(', ')} }

export default function Page(p){
  return (
    <I18nProvider lang="${lang}" namespaces={namespaces} >
      <C {...p} />
    </I18nProvider>
  )
}

Page.getInitialProps = C.getInitialProps
`
}

function buildPageLocale({ prefix, pagePath, namespaces, lang, path }){
    const finalPath = pagePath.replace(currentPagesDir, path)
    const template = getPageTemplate(prefix, pagePath, lang, namespaces)
    const [filename] = finalPath.split('/').reverse()
    const dirs = finalPath.replace(`/${filename}`, '')
    execSync(`mkdir -p ${dirs} && touch ${filename}`)
    fs.writeFileSync(finalPath, template)
}

function buildPageInAllLocales(pagePath, namespaces, langs) {
  const prefix = pagePath.split('/').map(() => '..').join('/')
  const rootPrefix = prefix.replace('/..', '')

  // For each lang
  langs.forEach(lang => {
    buildPageLocale({
      lang,
      namespaces,
      pagePath,
      path: `${finalPagesDir}/${lang}`,
      prefix,
    })
  })

  // For default lang 
  buildPageLocale({
    lang: defaultLanguage,
    namespaces,
    pagePath,
    path: finalPagesDir,
    prefix: rootPrefix,
  })
}
