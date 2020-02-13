#!/usr/bin/env node
const fs = require('fs')
const execSync = require('child_process').execSync
const path = require('path')

const {
  allLanguages = [],
  currentPagesDir = 'pages_',
  defaultLanguage = 'en',
  finalPagesDir = 'pages',
  localesPath = 'locales',
  pages = {},
} = require(process.cwd() + '/i18n.json') || {}

function readDirR(dir) {
  return fs.statSync(dir).isDirectory()
    ? Array.prototype.concat(
        ...fs.readdirSync(dir).map(f => readDirR(path.join(dir, f)))
      )
    : dir
}

createPagesDir(allLanguages)

/**
 * STEP 1: Create /pages/ dir with their langs:
 *
 * /pages/en/ - /pages/es/ ...
 */
async function createPagesDir(langs = []) {
  execSync(`rm -rf ${finalPagesDir} && mkdir ${finalPagesDir}`)

  langs.forEach(async lang => {
    execSync(`mkdir ${finalPagesDir}/${lang}`)
  })

  console.log(`Building pages | from ${currentPagesDir} to ${finalPagesDir}`)
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
  readDirR(currentPagesDir).forEach(page => {
    const pageId = clearPageExt(page.replace(currentPagesDir, '')) || '/'

    const namespaces = [...(pages['*'] || []), ...(pages[pageId] || [])]

    if (!isNextInternal(page)) {
      console.log(`🔨 ${pageId}`, namespaces)
    }

    buildPageInAllLocales(page, namespaces, langs)
  })
}

/**
 * STEP 3: Build page in each lang path
 */
function getPageTemplate(prefix, page, lang, namespaces) {
  const isTypeScript = page.endsWith('.ts') || page.endsWith('.tsx')

  return `import I18nProvider from 'next-translate/I18nProvider'
import React from 'react'
import C from '${prefix}/${clearPageExt(page)}'
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
    <I18nProvider lang="${lang}" namespaces={namespaces} >
      <C {...p} />
    </I18nProvider>
  )
}

Page.getInitialProps = ${isTypeScript ? '(C as any)' : 'C'}.getInitialProps
`
}

function buildPageLocale({ prefix, pagePath, namespaces, lang, path }) {
  const finalPath = pagePath.replace(currentPagesDir, path)
  const template = getPageTemplate(prefix, pagePath, lang, namespaces)
  const [filename] = finalPath.split('/').reverse()
  const dirs = finalPath.replace(`/${filename}`, '')
  execSync(`mkdir -p ${dirs}`)
  fs.writeFileSync(finalPath, template)
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
      execSync(`mkdir -p ${finalPagesDir}/api`)
    }
    execSync(
      `cp ${pagePath} ${pagePath.replace(currentPagesDir, finalPagesDir)}`
    )
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
  if (langs.includes(defaultLanguage)) {
    buildPageLocale({
      lang: defaultLanguage,
      namespaces,
      pagePath,
      path: finalPagesDir,
      prefix: rootPrefix,
    })
  }
}
