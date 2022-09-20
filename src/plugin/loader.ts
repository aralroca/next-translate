import type webpack from 'webpack'

import templateWithHoc from './templateWithHoc'
import templateWithLoader from './templateWithLoader'
import {
  parseFile,
  getDefaultAppJs,
  getDefaultExport,
  hasExportName,
  hasStaticName,
  isPageToIgnore,
  hasHOC,
} from './utils'
import { LoaderOptions } from './types'

export default function loader(
  this: webpack.LoaderContext<LoaderOptions>,
  rawCode: string
) {
  const {
    basePath,
    pagesPath,
    hasAppJs,
    hasGetInitialPropsOnAppJs,
    hasLoadLocaleFrom,
    extensionsRgx,
    revalidate,
  } = this.getOptions()

  // Normalize slashes in a file path to be posix/unix-like forward slashes
  const normalizedPagesPath = pagesPath.replace(/\\/g, '/')
  const normalizedResourcePath = this.resourcePath.replace(/\\/g, '/')

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
  if (!normalizedResourcePath.startsWith(normalizedPagesPath)) return rawCode

  const page = normalizedResourcePath.replace(normalizedPagesPath, '/')
  const pageNoExt = page.replace(extensionsRgx, '')
  const pagePkg = parseFile(basePath, normalizedResourcePath)
  const defaultExport = getDefaultExport(pagePkg)

  // Skip any transformation if for some reason they forgot to write the
  // "export default" on the page
  if (!defaultExport) return rawCode

  // Skip any transformation if the page is not in raw code
  // Fixes issue with Nx: https://github.com/vinissimus/next-translate/issues/677
  if (hasExportName(pagePkg, '__N_SSP') || hasExportName(pagePkg, '__N_SSG')) {
    return rawCode
  }

  // In case there is a getInitialProps in _app it means that we can
  // reuse the existing getInitialProps on the top to load the namespaces.
  //
  // - Wrapping the _app.js with the HoC appWithI18n from next-translate
  // - Do not make any transformation in the rest of the pages
  //
  // This way, the only modified file has to be the _app.js.
  if (hasGetInitialPropsOnAppJs) {
    return pageNoExt === '/_app'
      ? templateWithHoc(pagePkg, { hasLoadLocaleFrom })
      : rawCode
  }

  // In case the _app does not have getInitialProps, we can add only the
  // I18nProvider to ensure that translations work inside _app.js
  if (pageNoExt === '/_app') {
    return templateWithHoc(pagePkg, {
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
  const isWrapperWithExternalHOC = hasHOC(pagePkg)
  const isDynamicPage = page.includes('[')
  const isGetStaticProps = hasExportName(pagePkg, 'getStaticProps')
  const isGetStaticPaths = hasExportName(pagePkg, 'getStaticPaths')
  const isGetServerSideProps = hasExportName(pagePkg, 'getServerSideProps')
  const isGetInitialProps = hasStaticName(
    pagePkg,
    defaultExport,
    'getInitialProps'
  )

  const hasLoader =
    isGetStaticProps || isGetServerSideProps || isGetInitialProps

  if (isGetInitialProps || (!hasLoader && isWrapperWithExternalHOC)) {
    return templateWithHoc(pagePkg, { hasLoadLocaleFrom })
  }

  const loader =
    isGetServerSideProps || (!hasLoader && isDynamicPage && !isGetStaticPaths)
      ? 'getServerSideProps'
      : 'getStaticProps'

  return templateWithLoader(pagePkg, {
    page: pageNoExt,
    loader,
    hasLoadLocaleFrom,
    revalidate,
  })
}
