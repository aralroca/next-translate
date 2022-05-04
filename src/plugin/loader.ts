import * as babelParser from '@babel/parser'
import { identifier, isExportDefaultDeclaration } from '@babel/types'
import { getNamedExport } from './ast'

import templateWithHoc from './templateWithHoc'
import templateWithLoader from './templateWithLoader'
import {
  clearCommentsRgx,
  getDefaultAppJs,
  hasHOC,
  isPageToIgnore,
} from './utils'

export default function loader(rawCode: string): string {
  const {
    hasGetInitialPropsOnAppJs,
    hasAppJs,
    extensionsRgx,
    pagesPath,
    hasLoadLocaleFrom,
    revalidate,
    // @ts-ignore
  } = this.query

  // Normalize slashes in a file path to be posix/unix-like forward slashes
  const normalizedPagesPath = pagesPath.replace(/\\/g, '/')
  const normalizedResourcePath: string =
    // @ts-ignore
    this.resourcePath.replace(/\\/g, '/')

  // In case that there aren't /_app.js we want to overwrite the default _app
  // to provide the I18Provider on top.
  if (normalizedResourcePath.includes('node_modules/next/dist/pages/_app')) {
    // There are cases that a default appjs is served even if it already has
    // an appjs defined. For example when using a class extended from NextApp.
    // For these cases we must not overwrite it.
    if (hasAppJs) return rawCode
    return getDefaultAppJs(hasLoadLocaleFrom)
  }

  // Skip rest of files that are not inside /pages
  if (!normalizedResourcePath.startsWith(normalizedPagesPath)) {
    return rawCode
  }

  const page = normalizedResourcePath.replace(normalizedPagesPath, '/')
  const pageNoExt = page.replace(extensionsRgx, '')
  const code = rawCode.replace(clearCommentsRgx, '')

  // Skip any transformation if the page is not in raw code
  // Fixes issue with Nx: https://github.com/vinissimus/next-translate/issues/677
  if (code.match(/export *\w* *(__N_SSP|__N_SSG) *=/)) {
    return rawCode
  }

  let ast
  try {
    ast = babelParser.parse(rawCode, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
    })
  } catch (error) {
    console.info('[next-translate]', error, rawCode)
    throw new Error('Failed to parse code.')
  }

  const { body } = ast.program

  // Skip any transformation if for some reason there is no default export
  if (!body.some((s) => isExportDefaultDeclaration(s))) return rawCode

  // In case there is a getInitialProps in _app it means that we can
  // reuse the existing getInitialProps on the top to load the namespaces.
  //
  // - Wrapping the _app.js with the HoC appWithI18n from next-translate
  // - Do not make any transformation in the rest of the pages
  //
  // This way, the only modified file has to be the _app.js.
  if (hasGetInitialPropsOnAppJs) {
    return pageNoExt === '/_app'
      ? templateWithHoc(ast, { hasLoadLocaleFrom })
      : rawCode
  }

  // In case the _app does not have getInitialProps, we can add only the
  // I18nProvider to ensure that translations work inside _app.js
  if (pageNoExt === '/_app') {
    return templateWithHoc(ast, {
      skipInitialProps: true,
      hasLoadLocaleFrom,
    })
  }

  // There are some files that although they are inside pages, are not pages:
  // _app, _document, /api... In that case, let's skip any transformation :)
  if (isPageToIgnore(page)) return rawCode

  // This is where the most complicated part is, since to support automatic page
  // optimization what we do is use:
  //
  // - getStaticProps by default
  // - Use an existing page loader. For example if the page already uses
  //   getServerSideProps, in this case we need to overwrite it.
  // - getServerSideProps for [dynamic] pages and [..catchall] @todo Review if
  //   is possible to change it to getStaticProps + getStaticPaths
  // - getInitialProps when the page uses an external HoC (not the
  //   withTranslation HoC).
  //   This is in order to avoid issues because the getInitialProps is the only
  //   one that can be overwritten on a HoC.
  // Use getInitialProps to load the namespaces
  const isDynamicPage = page.includes('[')
  const isGetInitialProps = !!code.match(/\WgetInitialProps\W/g)
  const isGetServerSideProps = !!getNamedExport(body, getServerSidePropsId)
  const isGetStaticPaths = !!getNamedExport(body, identifier('getStaticPaths'))
  const isGetStaticProps = !!getNamedExport(body, getStaticPropsId)
  const hasLoader =
    isGetStaticProps || isGetServerSideProps || isGetInitialProps
  const isWrappedWithExternalHOC = !hasLoader && hasHOC(code)

  if (isGetInitialProps || (!hasLoader && isWrappedWithExternalHOC)) {
    return templateWithHoc(ast, { hasLoadLocaleFrom })
  }

  const loaderId =
    isGetServerSideProps || (!hasLoader && isDynamicPage && !isGetStaticPaths)
      ? getServerSidePropsId
      : getStaticPropsId

  return templateWithLoader(ast, {
    page: pageNoExt,
    loaderId,
    hasLoadLocaleFrom,
    revalidate,
  })
}

const getServerSidePropsId = identifier('getServerSideProps')
const getStaticPropsId = identifier('getStaticProps')
