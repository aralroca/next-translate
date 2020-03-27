#!/usr/bin/env node
const fs = require('fs')
const execSync = require('child_process').execSync
const path = require('path')
const getPageNamespaces = require('../_helpers/getPageNamespaces').default

const {
  allLanguages = [],
  currentPagesDir = 'pages_',
  defaultLanguage = 'en',
  finalPagesDir = 'pages',
  localesPath = 'locales',
  pages = {},
  redirectToDefaultLang = false,
  logBuild = true,
} = require(process.cwd() + '/i18n.json') || {}

function readDirR(dir) {
  const parsedDir = dir.replace(/\\/g, '/')

  return fs.statSync(parsedDir).isDirectory()
    ? Array.prototype.concat(
        ...fs
          .readdirSync(parsedDir)
          .map(f => readDirR(path.join(parsedDir, f)))
      )
    : parsedDir
}

createPagesDir(allLanguages)

/**
 * STEP 1: Create /pages/ dir with their langs:
 *
 * /pages/en/ - /pages/es/ ...
 */
async function createPagesDir(langs = []) {
  execSync(`rm -rf ${finalPagesDir}`)
  fs.mkdirSync(finalPagesDir)

  langs.forEach(async lang => {
    fs.mkdirSync(`${finalPagesDir}/${lang}`)
  })

  if (redirectToDefaultLang) {
    fs.writeFileSync(`${finalPagesDir}/[...path].js`, getCatchAllTemplate())
    fs.writeFileSync(`${finalPagesDir}/index.js`, getIndexRedirectTemplate())
  }

  if (logBuild) {
    console.log(`Building pages | from ${currentPagesDir} to ${finalPagesDir}`)
  }
  readPageNamespaces(langs)
}

function isNextInternal(pagePath) {
  return (
    pagePath.startsWith(`${currentPagesDir}/_`) ||
    pagePath.startsWith(`${currentPagesDir}/api/`)
  )
}

function clearPageExt(page) {
  const rgx = /(\/index.jsx)|(\/index.js)|(\/index.tsx)|(\/index.ts)|(\.jsx)|(\.js)|(\.tsx)|(\.ts)/gm

  return page.replace(rgx, '')
}

/**
 * STEP 2: Read each page namespaces
 */
function readPageNamespaces(langs) {
  readDirR(currentPagesDir).forEach(async page => {
    const pageId = clearPageExt(page.replace(currentPagesDir, '')) || '/'
    const namespaces = await getPageNamespaces({ pages }, pageId)

    if (!isNextInternal(page) && logBuild) {
      console.log(`🔨 ${pageId}`, namespaces)
    }

    buildPageInAllLocales(page, namespaces, langs)
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
    <I18nProvider lang="${lang}" namespaces={namespaces} isStaticMode>
      <C {...p} />
    </I18nProvider>
  )
}

Page = Object.assign(Page, { ...C })

if(C.getInitialProps) {
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
  fs.writeFileSync(finalPath.replace(/(\.tsx|\.ts)$/, '.js'), template)
}

function buildPageInAllLocales(pagePath, namespaces, langs) {
  const prefix = pagePath
    .split('/')
    .map(() => '..')
    .join('/')
  const rootPrefix = prefix.replace('/..', '')

  // _app.js , _document.js, _error.js, /api/*
  if (isNextInternal(pagePath)) {
    if (pagePath.includes('/api/')) {
      fs.mkdirSync(`${finalPagesDir}/api`, { recursive: true })
    }
    fs.copyFileSync(pagePath, pagePath.replace(currentPagesDir, finalPagesDir))
    return
  }

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
  if (langs.includes(defaultLanguage) && !redirectToDefaultLang) {
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

function getCatchAllTemplate() {
  return `import { useRouter } from 'next/router';

export default function CatchAll() {
  const router = useRouter()
  if (Array.isArray(router.query.path) && router.query.path[0] !== '${defaultLanguage}') {
    router.replace(\`/${defaultLanguage}/\${router.query.path.join('/')}\`)
  }
  return null
}
`
}
