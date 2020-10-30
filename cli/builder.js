#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const hasHOC = require('../_helpers/hasHOC').default
const getPageNamespaces = require('../_helpers/getPageNamespaces').default

let configFile = {}

if (fs.existsSync(process.cwd() + '/i18n.js')) {
  configFile = require(process.cwd() + '/i18n.js')
} else if (fs.existsSync(process.cwd() + '/i18n.json')) {
  configFile = require(process.cwd() + '/i18n.json')
}

// The `locales` and `defaultLocale` are not used here at the moment, as it
// is now managed by Next.js within `next.config.js` file. But for the time
// being we have to keep it as part of the configuration. When we can finally
// remove the "build step" (1.0.0), we will make a wrapper of `next.config.js`
// passing all the same configuration from the file i18n.js / i18n.json.
let {
  locales = [],
  allLanguages, // @deprecated
  defaultLanguage, // @deprecated
  currentPagesDir = 'pages_',
  defaultLangRedirect, // @deprecated
  defaultLocale = 'en',
  finalPagesDir = 'pages',
  localesPath = 'locales',
  package = false,
  pages = {},
  logger,
  redirectToDefaultLang, // @deprecated
  logBuild = true,
} = configFile

const indexFolderRgx = /\/index\/index\....?$/
const specFileOrFolderRgx = /(__mocks__|__tests__)|(\.(spec|test)\.(tsx|ts|js|jsx)$)/
const allPages = readDirR(currentPagesDir)

if (defaultLangRedirect) {
  console.warn(
    '🚨 [next-translate] defaultLangRedirect is not longer supported. The i18n routing has moved to the Next.js core, so we have been forced to deprecate this behavior. https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
  )
}

if (redirectToDefaultLang) {
  console.warn(
    '🚨 [next-translate] redirectToDefaultLang is not longer supported. The i18n routing has moved to the Next.js core, so we have been forced to deprecate this behavior. https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
  )
}

if (allLanguages) {
  locales = allLanguages
  console.warn(
    '🚨 [next-translate] "allLanguages" is now renamed to "locales". The support to "allLanguages" will be removed in next releases. https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
  )
}

if (defaultLanguage) {
  defaultLocale = defaultLanguage
  console.warn(
    '🚨 [next-translate] "defaultLanguage" is now renamed to "defaultLocale". The support to "defaultLanguage" will be removed in next releases. https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
  )
}

startBuildStep()

/**
 * STEP 1:
 * - Clear "pages" folder
 * - Log feedback
 */
async function startBuildStep() {
  rimraf(finalPagesDir)
  fs.mkdirSync(finalPagesDir)

  if (logBuild) {
    console.log(`Building pages | from ${currentPagesDir} to ${finalPagesDir}`)
  }

  readPageNamespaces() // Next step
}

/**
 * STEP 2:
 * - Read each page namespaces
 * - Log namespaces for each page to the console
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

    checkIfFileIsAPage(page, namespaces) // Next step
  })
}

/**
 * STEP 3 (is executed for each file):
 * - Check if the file is a page to build or another kind of file
 */
function checkIfFileIsAPage(pagePath, namespaces) {
  let prefix = pagePath
    .split('/')
    .map(() => '..')
    .join('/')
    .replace('/..', '')

  // ignore tests files
  if (pagePath.match(specFileOrFolderRgx)) {
    return
  }

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

  // Next step
  buildPage({
    namespaces,
    pagePath,
    path: finalPagesDir,
    prefix,
  })
}

/**
 * STEP 4 (is executed for each file):
 * - Get the new template for the page (wrapping I18nProvider + loading namespaces)
 * - Create file to /pages folder
 */
function buildPage({ prefix, pagePath, namespaces, path }) {
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

///////////////////////////////////////////////////////////////////////////////
/////////////////////////////////// HELPERS ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

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
      let res = typeof C.getInitialProps === 'function' ? C.getInitialProps(ctx) : {}
      if(typeof res.then === 'function') res = await res
      console.warn('[next-translate] In Next 10.0.0 there is an issue related to i18n and getInitialProps. We recommend that you change getInitialProps to getServerSideProps. Issue: https://github.com/vercel/next.js/issues/18396')
    
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
  const isWrappedWithHOC = hasHOC(pageData)
  const isHead = hasExportName(pageData, 'Head')
  const isConfig = hasExportName(pageData, 'config')
  const isGetInitialProps = pageData.match(/\WgetInitialProps\W/g)
  const isGetStaticProps = hasExportName(pageData, 'getStaticProps')
  const isGetStaticPaths = hasExportName(pageData, 'getStaticPaths')
  const isGetServerSideProps = hasExportName(pageData, 'getServerSideProps')
  const hasSomeSpecialExport =
    isGetStaticProps || isGetStaticPaths || isGetServerSideProps
  const hasLoaderMethod = hasSomeSpecialExport || isGetInitialProps

  const exports = `
${
  isGetInitialProps || (!hasLoaderMethod && isWrappedWithHOC)
    ? specialMethod('getInitialProps', namespaces, prefix, hasLoaderMethod)
    : ''
}
${isGetStaticPaths ? specialMethod('getStaticPaths', namespaces, prefix) : ''}
${
  isGetServerSideProps ||
  (!hasLoaderMethod && isDynamicPage && !isWrappedWithHOC)
    ? specialMethod('getServerSideProps', namespaces, prefix, hasLoaderMethod)
    : ''
}
${
  isGetStaticProps || (!hasLoaderMethod && !isDynamicPage && !isWrappedWithHOC)
    ? specialMethod('getStaticProps', namespaces, prefix, hasLoaderMethod)
    : ''
}
${isHead ? `export { Head } from '${prefix}/${clearPageExt(page)}'` : ''}
${isConfig ? pageConfig(pageData) : ''}
`

  return { hasSomeSpecialExport, exports }
}

function getInternalNamespacesCode(namespaces, prefix) {
  const path = package ? localesPath : `${prefix}/${localesPath}`

  return `const _lang = ctx.locale || ctx.router?.locale || '${defaultLocale}'
  ${namespaces
    .map(
      (ns, i) =>
        `const ns${i} = await import(\`${path}/\${_lang}/${ns}.json\`).then(m => m.default)`
    )
    .join('\n')}
  const _ns = { ${namespaces.map((ns, i) => `'${ns}': ns${i}`).join(', ')} }
  `
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
    console.error(
      `Error: '${parsedDir}' directory doesn't exist. Docs: https://github.com/vinissimus/next-translate#use-translations-in-your-pages`
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

function isNextInternal(pagePath) {
  return (
    (pagePath.startsWith(`${currentPagesDir}/_`) &&
      !pagePath.startsWith(`${currentPagesDir}/_error.`)) ||
    pagePath.startsWith(`${currentPagesDir}/api/`)
  )
}

function clearPageExt(page) {
  const rgx = /(\/index\.jsx)|(\/index\.js)|(\/index\.tsx)|(\/index\.ts)|(\/index\.mdx)|(\.jsx)|(\.js)|(\.tsx)|(\.ts)|(\.mdx)/gm

  return page.replace(rgx, '')
}
