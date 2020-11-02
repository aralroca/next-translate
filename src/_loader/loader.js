import _appTransformation from './_appTransformation'

export default function loader(code) {
  if (!this.resourcePath.startsWith(process.cwd() + '/pages/')) return code

  const { hasGetInitialPropsOnAppJs, extensionsRgx, ...config } = this.query
  const path = this.resourcePath.replace(process.cwd() + '/pages/', '/', '')
  const pathNoExt = path.replace(extensionsRgx, '')

  // In case there is a getInitialProps in _app it means that we cannot use
  // SSG in the pages to load the namespaces. So if it is like that, we are
  // going to use another strategy:
  //
  // - Wrapping the _app.js with the HoC appWithI18n from next-translate
  // - Do not make any transformation in the rest of the pages
  //
  // This way, the only modified file has to be the _app.js.
  if (hasGetInitialPropsOnAppJs) {
    return pathNoExt === '/_app' ? _appTransformation(code, config) : code
  }

  // @todo
  const newCode =
    code.replace('export default', 'const __Page_NextTranslate__ =') +
    '\nexport default __Page_NextTranslate__'
  console.log(newCode)

  return newCode
}
