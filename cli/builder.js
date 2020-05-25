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

  return fs.statSync(parsedDir).isDirectory()
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
  readDirR(currentPagesDir).forEach(async (page) => {
    const pageId = clearPageExt(page.replace(currentPagesDir, '')) || '/'
    const namespaces = await getPageNamespaces({ pages }, pageId)

    if (!isNextInternal(page) && logBuild) {
      console.log(`🔨 ${pageId}`, namespaces)
    }

    buildPageInAllLocales(page, namespaces)
  })
}

function hasSpecialMethod(data, name) {
  return data.match(
    new RegExp(`export (const|var|let|async function|function) ${name}`)
  )
}

function specialMethod(name, lang) {
  return `export const ${name} = ctx => _rest.${name}({ ...ctx, lang: '${lang}' })`
}

/**
 * STEP 3: Build page in each lang path
 */
function getPageTemplate(prefix, page, lang, namespaces) {
  const clearCommentsRgx = /\/\*[\s\S]*?\*\/|\/\/.*/g
  const pageData = fs
    .readFileSync(page)
    .toString('UTF-8')
    .replace(clearCommentsRgx, '')
  const isGetStaticProps = hasSpecialMethod(pageData, 'getStaticProps')
  const isGetStaticPaths = hasSpecialMethod(pageData, 'getStaticPaths')
  const isGetServerSideProps = hasSpecialMethod(pageData, 'getServerSideProps')
  const hasSomeSpecialMethod =
    isGetStaticProps || isGetStaticPaths || isGetServerSideProps

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

${isGetStaticProps ? specialMethod('getStaticProps', lang) : ''}
${isGetStaticPaths ? specialMethod('getStaticPaths', lang) : ''}
${isGetServerSideProps ? specialMethod('getServerSideProps', lang) : ''}

export * from '${prefix}/${clearPageExt(page)}'
`
}

function buildPageLocale({ prefix, pagePath, namespaces, lang, path }) {
  const finalPath = pagePath.replace(currentPagesDir, path)
  const template = getPageTemplate(prefix, pagePath, lang, namespaces)
  const [filename] = finalPath.split('/').reverse()
  const dirs = finalPath.replace(`/${filename}`, '')
  fs.mkdirSync(dirs, { recursive: true })
  fs.writeFileSync(finalPath.replace(/(\.tsx|\.ts|\.mdx)$/, '.js'), template)
}

function copyFolderRecursiveSync(source, targetFolder) {
  const target = path.join(targetFolder, path.basename(source))

  //check if folder needs to be created
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder)
    //copy
    if (!fs.lstatSync(source).isDirectory()) {
      fs.copyFileSync(source, target)
    }
  }
}

function buildPageInAllLocales(pagePath, namespaces) {
  const prefix = pagePath
    .split('/')
    .map(() => '..')
    .join('/')
  const rootPrefix = prefix.replace('/..', '')

  // _app.js , _document.js, _error.js, /api/*
  if (isNextInternal(pagePath)) {
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
  return `import { useEffect } from 'react'
import { useRouter } from 'next/router'
import C from './${defaultLanguage}/index'

export default function Index(props) {
  const router = useRouter()
  useEffect(() => { router.replace('/${defaultLanguage}') }, [])
  return <C {...props} />
}

Index = Object.assign(Index, { ...C })
export * from './${defaultLanguage}/index'
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

function getCatchAllTemplate() {
  return `import Error from 'next/error';
import { useRouter } from 'next/router';

export default function CatchAll() {
  const router = useRouter()
  if (Array.isArray(router.query.path) && typeof window !== 'undefined') {
    if (router.query.path[0] === '${defaultLanguage}') {
      return <Error statusCode="404" />
    }
    router.replace(\`/${defaultLanguage}/\${router.query.path.join('/')}\`)
  }
  return null
}
`
}
