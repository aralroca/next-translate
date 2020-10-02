#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const getPageNamespaces = require('../_helpers/getPageNamespaces').default

let {
  allLanguages = [],
  currentPagesDir = 'pages_',
  defaultLangRedirect,
  defaultLanguage = 'en',
  finalPagesDir = 'pages',
  localesPath = 'locales',
  pages = {},
  redirectToDefaultLang: _deprecated_redirectToDefaultLang,
  logBuild = true,
} = require(process.cwd() + '/i18n.json') || {}

const indexFolderRgx = /\/index\/index\....?$/
const allPages = readDirR(currentPagesDir)

// @todo 1.0.0 Remove this backwards compatibility.
if (_deprecated_redirectToDefaultLang !== undefined) {
  defaultLangRedirect = _deprecated_redirectToDefaultLang
    ? 'lang-path'
    : undefined
  console.log(
    '\x1b[33m%s\x1b[0m',
    '🚨 redirectToDefaultLang is deprecated and will be removed in future major versions. Use defaultLangRedirect instead. Docs: https://github.com/vinissimus/next-translate/blob/master/README.md#4-configuration'
  )
}

const internals = JSON.stringify({
  defaultLangRedirect,
  defaultLanguage,
  isStaticMode: true,
})

/**
 * Similar to "rm -rf"
 */
function rimraf(pathname) {
  if (!fs.existsSync(pathname)) return

  fs.readdirSync(pathname).forEach((child) => {
    const childPathname = path.join(pathname, child)

    if (fs.lstatSync(childPathname).isDirectory()) {
      rimraf(childPathname)
      return
    }
    fs.unlinkSync(childPathname)
  })
  fs.rmdirSync(pathname)
}

function readDirR(dir) {
  const parsedDir = dir.replace(/\\/g, '/')
  let d

  try {
    d = fs.statSync(parsedDir)
  } catch (e) {
    console.log(
      '\x1b[33m%s\x1b[0m',
      `Error: '${parsedDir}' directory doesn't exist. Docs: https://github.com/vinissimus/next-translate#how-is-this-lib-handling-the-routes`
    )
    process.exit()
  }

  return d.isDirectory()
    ? Array.prototype.concat(
        ...fs
          .readdirSync(parsedDir)
          .map((f) => readDirR(path.join(parsedDir, f)))
      )
    : parsedDir
}

createPagesDir()

function getLangs() {
  return allLanguages.filter(
    (lng) => defaultLangRedirect === 'lang-path' || lng !== defaultLanguage
  )
}

/**
 * STEP 1: Create /pages/ dir with their langs:
 *
 * /pages/en/ - /pages/es/ ...
 */
async function createPagesDir() {
  rimraf(finalPagesDir)
  fs.mkdirSync(finalPagesDir)

  getLangs().forEach(async (lang) => {
    fs.mkdirSync(`${finalPagesDir}/${lang}`)
  })

  if (defaultLangRedirect === 'lang-path') {
    fs.writeFileSync(`${finalPagesDir}/[...path].js`, getCatchAllTemplate())
    fs.writeFileSync(`${finalPagesDir}/index.js`, getIndexRedirectTemplate())
  }

  if (defaultLangRedirect === 'root') {
    fs.mkdirSync(`${finalPagesDir}/${defaultLanguage}`)
    fs.writeFileSync(
      `${finalPagesDir}/${defaultLanguage}/[...path].js`,
      getDefaultLanguageIndexRedirectTemplate()
    )
  }

  if (logBuild) {
    console.log(`Building pages | from ${currentPagesDir} to ${finalPagesDir}`)
  }
  readPageNamespaces()
}

function isNextInternal(pagePath) {
  return (
    pagePath.startsWith(`${currentPagesDir}/_`) ||
    pagePath.startsWith(`${currentPagesDir}/404.`) ||
    pagePath.startsWith(`${currentPagesDir}/api/`)
  )
}

function clearPageExt(page) {
  const rgx = /(\/index\.jsx)|(\/index\.js)|(\/index\.tsx)|(\/index\.ts)|(\/index\.mdx)|(\.jsx)|(\.js)|(\.tsx)|(\.ts)|(\.mdx)/gm

  return page.replace(rgx, '')
}

/**
 * STEP 2: Read each page namespaces
 */
function readPageNamespaces() {
  allPages.forEach(async (page) => {
    const pageId =
      clearPageExt(page.replace(currentPagesDir, ''))
        // Clear index folder case
        .replace(/\/index$/, '') || '/'

    const namespaces = await getPageNamespaces({ pages }, pageId)

    if (!isNextInternal(page) && logBuild && !pageId.match(/\.s?css$/)) {
      console.log(`🔨 ${pageId}`, namespaces)
    }

    buildPageInAllLocales(page, namespaces)
  })
}

function hasExportName(data, name) {
  return data.match(
    new RegExp(`export (const|var|let|async function|function) ${name}`)
  )
}

function specialMethod(name, lang) {
  return `export const ${name} = ctx => _rest.${name}({ ...ctx, lang: '${lang}' })`
}

function pageConfig(data) {
  return data.match(/export\s(const|var|let)\sconfig(.|\n)*?}\n{0,1}/m)[0]
}

function exportAllFromPage(prefix, page, lang) {
  const clearCommentsRgx = /\/\*[\s\S]*?\*\/|\/\/.*/g
  const pageData = fs
    .readFileSync(page)
    .toString('UTF-8')
    .replace(clearCommentsRgx, '')

  const isHead = hasExportName(pageData, 'Head')
  const isConfig = hasExportName(pageData, 'config')
  const isGetStaticProps = hasExportName(pageData, 'getStaticProps')
  const isGetStaticPaths = hasExportName(pageData, 'getStaticPaths')
  const isGetServerSideProps = hasExportName(pageData, 'getServerSideProps')
  const hasSomeSpecialMethod =
    isGetStaticProps || isGetStaticPaths || isGetServerSideProps

  const exports = `
${isGetStaticProps ? specialMethod('getStaticProps', lang) : ''}
${isGetStaticPaths ? specialMethod('getStaticPaths', lang) : ''}
${isGetServerSideProps ? specialMethod('getServerSideProps', lang) : ''}
${isHead ? `export { Head } from '${prefix}/${clearPageExt(page)}'` : ''}
${isConfig ? pageConfig(pageData) : ''}
`

  return { hasSomeSpecialMethod, exports }
}

/**
 * STEP 3: Build page in each lang path
 */
function getPageTemplate(prefix, page, lang, namespaces) {
  const { hasSomeSpecialMethod, exports } = exportAllFromPage(
    prefix,
    page,
    lang
  )

  return `// @ts-nocheck
import I18nProvider from 'next-translate/I18nProvider'
import React from 'react'
import C${
    hasSomeSpecialMethod ? ', * as _rest' : ''
  } from '${prefix}/${clearPageExt(page)}'
${namespaces
  .map(
    (ns, i) =>
      `import ns${i} from '${prefix}/${localesPath}/${lang}/${ns}.json'`
  )
  .join('\n')}

const namespaces = { ${namespaces
    .map((ns, i) => `'${ns}': ns${i}`)
    .join(', ')} }

export default function Page(p){
  return (
    <I18nProvider 
      lang="${lang}" 
      namespaces={namespaces}  
      internals={${internals}}
    >
      <C {...p} />
    </I18nProvider>
  )
}

Page = Object.assign(Page, { ...C })

if(C && C.getInitialProps) {
  Page.getInitialProps = ctx => C.getInitialProps({ ...ctx, lang: '${lang}'})
}

${exports}
`
}

function buildPageLocale({ prefix, pagePath, namespaces, lang, path }) {
  const finalPath = pagePath.replace(currentPagesDir, path)
  const template = getPageTemplate(prefix, pagePath, lang, namespaces)
  const [filename] = finalPath.split('/').reverse()
  const dirs = finalPath.replace(`/${filename}`, '')
  let finalFile = finalPath
    .replace(/(\.tsx|\.ts|\.mdx)$/, '.js')
    .replace(indexFolderRgx, '/index.js')

  fs.mkdirSync(dirs, { recursive: true })
  fs.writeFileSync(finalFile, template)
}

function copyFolderRecursiveSync(source, targetFolder) {
  const target = path.join(targetFolder, path.basename(source))

  //check if folder needs to be created
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true })
    //copy
    if (!fs.lstatSync(source).isDirectory()) {
      fs.copyFileSync(source, target)
    }
  }
}

function buildPageInAllLocales(pagePath, namespaces) {
  let prefix = pagePath
    .split('/')
    .map(() => '..')
    .join('/')

  let rootPrefix = prefix.replace('/..', '')

  // Rest one path if is index folder /index/index.js is going to
  // be generated directly as /index.js
  if (pagePath.match(indexFolderRgx)) {
    rootPrefix = rootPrefix.replace('/..', '')
    prefix = prefix.replace('/..', '')
  }

  // _app.js , _document.js, _error.js, /api/*, .css, .scss
  if (isNextInternal(pagePath) || pagePath.match(/\.s?css$/)) {
    if (pagePath.includes('/api/')) {
      fs.mkdirSync(`${finalPagesDir}/api`, { recursive: true })
      copyFolderRecursiveSync(
        pagePath,
        path.dirname(pagePath.replace(currentPagesDir, finalPagesDir))
      )
    }
    fs.copyFileSync(pagePath, pagePath.replace(currentPagesDir, finalPagesDir))
    return
  }

  // For each lang
  getLangs().forEach((lang) => {
    buildPageLocale({
      lang,
      namespaces,
      pagePath,
      path: `${finalPagesDir}/${lang}`,
      prefix,
    })
  })

  // For default lang
  if (
    allLanguages.includes(defaultLanguage) &&
    defaultLangRedirect !== 'lang-path'
  ) {
    buildPageLocale({
      lang: defaultLanguage,
      namespaces,
      pagePath,
      path: finalPagesDir,
      prefix: rootPrefix,
    })
  }
}

function getIndexRedirectTemplate() {
  const page = allPages.find((p) => p.startsWith(`${currentPagesDir}/index`))
  const { hasSomeSpecialMethod, exports } = exportAllFromPage(
    `./${defaultLanguage}/`,
    page,
    defaultLanguage
  )

  return `import { useEffect } from 'react'
import { useRouter } from 'next/router'
import C${
    hasSomeSpecialMethod ? ', * as _rest' : ''
  }  from './${defaultLanguage}/index'

export default function Index(props) {
  const router = useRouter()
  useEffect(() => { router.replace('/${defaultLanguage}'+location.search) }, [])
  return <C {...props} />
}

Index = Object.assign(Index, { ...C })
${exports}
`
}

function getDefaultLanguageIndexRedirectTemplate() {
  return `import { useRouter } from 'next/router';

export default function DefaultLanguageCatchAll() {
  const router = useRouter()
  if (Array.isArray(router.query.path) && typeof window !== 'undefined') {
    router.replace(\`/\${router.query.path.join('/')}\`)
  }
  return null
}
`
}

function getErrorImport() {
  const pages = fs.readdirSync(currentPagesDir)

  if (pages.some((page) => page.startsWith('404.'))) {
    return "import Error from '../pages/404';"
  }

  if (pages.some((page) => page.startsWith('_error.'))) {
    return "import Error from '../pages/_error';"
  }

  return "import Error from 'next/error';"
}

function getCatchAllTemplate() {
  return `${getErrorImport()}
import { useRouter } from 'next/router';

export default function CatchAll() {
  const router = useRouter()
  if (Array.isArray(router.query.path) && typeof window !== 'undefined') {
    if (router.query.path[0] === '${defaultLanguage}') {
      return <Error statusCode="404" />
    }
    router.replace(\`/${defaultLanguage}/\${router.query.path.join('/')}\${location.search}\`)
  }
  return null
}
`
}
