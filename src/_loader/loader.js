import _appTransformation from './_appTransformation'
import isPageToIgnore from './isPageToIgnore'
import pageTransformation from './pageTransformation'

export default function loader(code) {
  if (!this.resourcePath.startsWith(process.cwd() + '/pages/')) return code

  const { hasGetInitialPropsOnAppJs, extensionsRgx, ...config } = this.query
  const path = this.resourcePath.replace(process.cwd() + '/pages/', '/', '')
  const pathNoExt = path.replace(extensionsRgx, '')

  // In case there is a getInitialProps in _app it means that we can
  // reuse the existing getInitialProps on the top to load the namespaces.
  //
  // - Wrapping the _app.js with the HoC appWithI18n from next-translate
  // - Do not make any transformation in the rest of the pages
  //
  // This way, the only modified file has to be the _app.js.
  if (hasGetInitialPropsOnAppJs) {
    return pathNoExt === '/_app' ? _appTransformation(code, config) : code
  }

  // In case the _app does not have getInitialProps, we can add only the
  // I18nProvider to ensure that translations work inside _app.js
  if (pathNoExt === '/_app') {
    return _appTransformation(code, { ...config, skipInitialProps: true })
  }

  // There are some files that although they are inside pages, are not pages:
  // _app, _document, /api... In that case, let's skip any transformation :)
  if (isPageToIgnore(path)) return code

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
  return pageTransformation(code, { path, pathNoExt, ...config })
}
