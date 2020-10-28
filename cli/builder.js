#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const getPageNamespaces = require('../_helpers/getPageNamespaces').default

let configFile = {}

if (fs.existsSync(process.cwd() + '/i18n.js')) {
  configFile = require(process.cwd() + '/i18n.js')
} else if (fs.existsSync(process.cwd() + '/i18n.json')) {
  configFile = require(process.cwd() + '/i18n.json')
}

let {
  locales = [],
  allLanguages, // @deprecated
  defaultLanguage, // @deprecated
  currentPagesDir = 'pages_',
  defaultLangRedirect, // @deprecated
  defaultLocale = 'en',
  finalPagesDir = 'pages',
  localesPath = 'locales',
  pages = {},
  logger,
  redirectToDefaultLang, // @deprecated
  logBuild = true,
} = configFile

const indexFolderRgx = /\/index\/index\....?$/
const allPages = readDirR(currentPagesDir)

if (defaultLangRedirect) {
  console.warn(
    '🚨 [next-translate] defaultLangRedirect is not longer supported. The i18n routing has moved to the Next.js core, so we have been forced to deprecate this behavior.'
  )
}

if (redirectToDefaultLang) {
  console.warn(
    '🚨 [next-translate] redirectToDefaultLang is not longer supported. The i18n routing has moved to the Next.js core, so we have been forced to deprecate this behavior.'
  )
}

if (allLanguages) {
  locales = allLanguages
  console.warn(
    '🚨 [next-translate] "allLanguages" is now renamed to "locales". The support to "allLanguages" will be removed in next releases.'
  )
}

if (defaultLanguage) {
  defaultLocale = defaultLanguage
  console.warn(
    '🚨 [next-translate] "defaultLanguage" is now renamed to "defaultLocale". The support to "defaultLanguage" will be removed in next releases.'
  )
}

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
  return locales.filter((lng) => lng !== defaultLocale)
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

    buildPage(page, namespaces)
  })
}

function hasExportName(data, name) {
  return data.match(
    new RegExp(`export (const|var|let|async function|function) ${name}`)
  )
}

function specialMethod(name, namespaces, prefix, loader = true) {
  if (name === 'getStaticPaths') {
    return `export const ${name} = ctx => _rest.${name}(ctx)`
  }

  if (name === 'getInitialProps') {
    return `Page.getInitialProps = async ctx => {
      ${getInternalNamespacesCode(namespaces, prefix)}
      let res = C.getInitialProps(ctx)
      if(typeof res.then === 'function') res = await res
    
      return { ...res,  _ns, _lang }
    }`
  }

  return `export const ${name} = async ctx => {
    ${getInternalNamespacesCode(namespaces, prefix)}
    let res = ${loader ? `_rest.${name}(ctx)` : '{}'}
    if(typeof res.then === 'function') res = await res
  
    return { 
      ...res, 
      props: {
        ...(res.props || {}),
        _ns,
        _lang,
      }
    }
  }`
}

function pageConfig(data) {
  return data.match(/export\s(const|var|let)\sconfig(.|\n)*?}\n{0,1}/m)[0]
}

function exportAllFromPage(prefix, page, namespaces) {
  const clearCommentsRgx = /\/\*[\s\S]*?\*\/|\/\/.*/g
  const pageData = fs
    .readFileSync(page)
    .toString('UTF-8')
    .replace(clearCommentsRgx, '')

  const isDynamicPage = page.includes('[')
  const isHead = hasExportName(pageData, 'Head')
  const isConfig = hasExportName(pageData, 'config')
  const isGetInitialProps = pageData.match(/\\WgetInitialProps\\W/g)
  const isGetStaticProps = hasExportName(pageData, 'getStaticProps')
  const isGetStaticPaths = hasExportName(pageData, 'getStaticPaths')
  const isGetServerSideProps = hasExportName(pageData, 'getServerSideProps')
  const hasSomeSpecialExport =
    isGetStaticProps || isGetStaticPaths || isGetServerSideProps
  const hasLoaderMethod = hasSomeSpecialExport || isGetInitialProps

  const exports = `
${isGetInitialProps ? specialMethod('getInitialProps', namespaces, prefix) : ''}
${isGetStaticPaths ? specialMethod('getStaticPaths', namespaces, prefix) : ''}
${
  isGetServerSideProps || (!hasLoaderMethod && isDynamicPage)
    ? specialMethod('getServerSideProps', namespaces, prefix, hasLoaderMethod)
    : ''
}
${
  isGetStaticProps || (!hasLoaderMethod && !isDynamicPage)
    ? specialMethod('getStaticProps', namespaces, prefix, hasLoaderMethod)
    : ''
}
${isHead ? `export { Head } from '${prefix}/${clearPageExt(page)}'` : ''}
${isConfig ? pageConfig(pageData) : ''}
`

  return { hasSomeSpecialExport, exports }
}

/**
 * STEP 3: Get each page template
 */
function getPageTemplate(prefix, page, namespaces) {
  const { hasSomeSpecialExport, exports } = exportAllFromPage(
    prefix,
    page,
    namespaces
  )

  return `// @ts-nocheck
import I18nProvider from 'next-translate/I18nProvider'
import React from 'react'
import C${
    hasSomeSpecialExport ? ', * as _rest' : ''
  } from '${prefix}/${clearPageExt(page)}'

export default function Page({ _ns, _lang, ...p }){
  return (
    <I18nProvider
      lang={_lang}
      namespaces={_ns}  
      ${typeof logger === 'function' ? `logger={${logger.toString()}}` : ''}
    >
      <C {...p} />
    </I18nProvider>
  )
}

Page = Object.assign(Page, { ...C })
${exports}
`
}

function buildPageWithNamespaces({ prefix, pagePath, namespaces, path }) {
  const finalPath = pagePath.replace(currentPagesDir, path)
  const template = getPageTemplate(prefix, pagePath, namespaces)
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

function buildPage(pagePath, namespaces) {
  let prefix = pagePath
    .split('/')
    .map(() => '..')
    .join('/')
    .replace('/..', '')

  // Rest one path if is index folder /index/index.js is going to
  // be generated directly as /index.js
  if (pagePath.match(indexFolderRgx)) {
    prefix = prefix.replace('/..', '')
  }

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

  // Build pages with namespaces
  buildPageWithNamespaces({
    namespaces,
    pagePath,
    path: finalPagesDir,
    prefix,
  })
}

function getInternalNamespacesCode(namespaces, prefix) {
  return `const _lang = ctx.locale || ctx.router?.locale || '${defaultLocale}'
  ${namespaces
    .map(
      (ns, i) =>
        `const ns${i} = await import(\`${prefix}/${localesPath}/\${_lang}/${ns}.json\`).then(m => m.default)`
    )
    .join('\n')}
  const _ns = { ${namespaces.map((ns, i) => `'${ns}': ns${i}`).join(', ')} }
  `
}
