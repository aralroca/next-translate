import hasExportName from './hasExportName'
import hasHOC from './hasHOC'
import isPageToIgnore from './isPageToIgnore'
import templateWithLoader from './templateWithLoader'
import templateWithHoc from './templateWithHoc'
import { clearCommentsRgx, defaultAppJs } from './constants'

const defaultAppPath = process.cwd() + '/node_modules/next/dist/pages/_app'
const pagePath = process.cwd() + '/pages/'

export default function loader(rawCode) {
  // In case that there aren't /_app.js we want to overwrite the default _app
  // to provide the I18Provider on top
  if (this.resourcePath.startsWith(defaultAppPath)) return defaultAppJs

  // Skip rest of files that are not inside /pages
  if (!this.resourcePath.startsWith(pagePath)) return rawCode

  const { hasGetInitialPropsOnAppJs, extensionsRgx, ...config } = this.query
  const page = this.resourcePath.replace(pagePath, '/', '')
  const pageNoExt = page.replace(extensionsRgx, '')

  // In case there is a getInitialProps in _app it means that we can
  // reuse the existing getInitialProps on the top to load the namespaces.
  //
  // - Wrapping the _app.js with the HoC appWithI18n from next-translate
  // - Do not make any transformation in the rest of the pages
  //
  // This way, the only modified file has to be the _app.js.
  if (hasGetInitialPropsOnAppJs) {
    return pageNoExt === '/_app' ? templateWithHoc(rawCode, config) : rawCode
  }

  // In case the _app does not have getInitialProps, we can add only the
  // I18nProvider to ensure that translations work inside _app.js
  if (pageNoExt === '/_app') {
    return templateWithHoc(rawCode, { ...config, skipInitialProps: true })
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
  const code = rawCode.replace(clearCommentsRgx, '')
  const dotsNumber = page.split('/').length - 1
  const dots = Array.from({ length: dotsNumber })
    .map(() => '..')
    .join('/')
  const prefix = config.arePagesInsideSrc ? '../' + dots : dots
  const typescript = page.endsWith('.ts') || page.endsWith('.tsx')
  const isWrapperWithExternalHOC = hasHOC(code)
  const isDynamicPage = page.includes('[')
  const isGetInitialProps = !!code.match(/\WgetInitialProps\W/g)
  const isGetServerSideProps = hasExportName(code, 'getServerSideProps')
  const isGetStaticPaths = hasExportName(code, 'getStaticPaths')
  const isGetStaticProps = hasExportName(code, 'getStaticProps')
  const hasLoader =
    isGetStaticProps ||
    isGetStaticPaths ||
    isGetServerSideProps ||
    isGetInitialProps

  if (isGetInitialProps || (!hasLoader && isWrapperWithExternalHOC)) {
    return templateWithHoc(rawCode, { ...config, prefix, typescript })
  }

  const loader =
    isGetServerSideProps ||
    (!hasLoader && isDynamicPage && !isWrapperWithExternalHOC)
      ? 'getServerSideProps'
      : 'getStaticProps'

  return templateWithLoader(rawCode, {
    page: pageNoExt,
    typescript,
    prefix,
    loader,
    hasLoader,
    ...config,
  })
}
