import templateWithHoc from './templateWithHoc'
import templateWithLoader from './templateWithLoader'
import {
  clearCommentsRgx,
  getDefaultAppJs,
  hasExportName,
  hasHOC,
  isPageToIgnore,
} from './utils'

export default function loader(rawCode: string) {
  const {
    hasGetInitialPropsOnAppJs,
    hasAppJs,
    extensionsRgx,
    pagesPath,
    hasLoadLocaleFrom,
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
  if (!normalizedResourcePath.startsWith(normalizedPagesPath)) return rawCode

  const page = normalizedResourcePath.replace(normalizedPagesPath, '/')
  const pageNoExt = page.replace(extensionsRgx, '')
  const code = rawCode.replace(clearCommentsRgx, '')
  const typescript = page.endsWith('.ts') || page.endsWith('.tsx')

  // Skip any transformation if for some reason they forgot to write the
  // "export default" on the page
  if (!code.includes('export default')) return rawCode

  // In case there is a getInitialProps in _app it means that we can
  // reuse the existing getInitialProps on the top to load the namespaces.
  //
  // - Wrapping the _app.js with the HoC appWithI18n from next-translate
  // - Do not make any transformation in the rest of the pages
  //
  // This way, the only modified file has to be the _app.js.
  if (hasGetInitialPropsOnAppJs) {
    return pageNoExt === '/_app'
      ? templateWithHoc(rawCode, { typescript, hasLoadLocaleFrom })
      : rawCode
  }

  // In case the _app does not have getInitialProps, we can add only the
  // I18nProvider to ensure that translations work inside _app.js
  if (pageNoExt === '/_app') {
    return templateWithHoc(rawCode, {
      skipInitialProps: true,
      typescript,
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
  const isWrapperWithExternalHOC = hasHOC(code)
  const isDynamicPage = page.includes('[')
  const isGetInitialProps = !!code.match(/\WgetInitialProps\W/g)
  const isGetServerSideProps = hasExportName(code, 'getServerSideProps')
  const isGetStaticPaths = hasExportName(code, 'getStaticPaths')
  const isGetStaticProps = hasExportName(code, 'getStaticProps')
  const hasLoader =
    isGetStaticProps || isGetServerSideProps || isGetInitialProps

  if (isGetInitialProps || (!hasLoader && isWrapperWithExternalHOC)) {
    console.warn(
      `🚨 [next-translate] In Next 10.x.x there is an issue related to i18n and getInitialProps. We recommend to replace getInitialProps to getServerSideProps on ${page}. Issue: https://github.com/vercel/next.js/issues/18396`
    )
    return templateWithHoc(rawCode, { typescript, hasLoadLocaleFrom })
  }

  const loader =
    isGetServerSideProps || (!hasLoader && isDynamicPage && !isGetStaticPaths)
      ? 'getServerSideProps'
      : 'getStaticProps'

  return templateWithLoader(rawCode, {
    page: pageNoExt,
    typescript,
    loader,
    hasLoader,
    hasLoadLocaleFrom,
  })
}
