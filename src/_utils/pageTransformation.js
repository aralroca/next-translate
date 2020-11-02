import { clearCommentsRgx } from './constants'
import hasExportName from './hasExportName'
import hasHOC from './hasHOC'

function pageTransformation(
  rawCode,
  { i18nFile, arePagesInsideSrc, page } = {}
) {
  const pageName = '__Page_Next_Translate__'
  const code = rawCode.replace(clearCommentsRgx, '')
  const dotsNumber = page.split('/').length - 1
  const dots = Array.from({ length: dotsNumber })
    .map(() => '..')
    .join('/')
  const prefix = arePagesInsideSrc ? '../' + dots : dots
  const configPath = `${prefix}${i18nFile}`
  const defaultLoadLocaleFrom = `${prefix}/locales/\${l}/\${n}.json`
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

  // Use getInitialProps to load the namespaces
  if (isGetInitialProps || (!hasLoader && isWrapperWithExternalHOC)) {
    let modifiedCode = code.replace(
      'export default',
      'const __Page_Next_Translate__ ='
    )
    const [, , componentName] =
      code.match(/export +default +(function|class) +([A-Z]\w*)/) || []

    if (componentName) {
      modifiedCode = modifiedCode.replace(
        `${componentName}.getInitialProps`,
        `${pageName}.getInitialProps`
      )
    }

    return `
      import __i18nConfig from '${configPath}'
      import __appWithI18n from 'next-translate/appWithI18n'
      ${modifiedCode}
      export default __appWithI18n(${pageName}, {
        loadLocaleFrom: (l, n) => import(\`${defaultLoadLocaleFrom}\`).then(m => m.default),
        ...__i18nConfig,
        isLoader: true
      });
    `
  }

  // Use getStaticProps by default to load the namespaces
  let defaultLoader = 'getStaticProps'

  // Use getServerSideProps to load the namespaces
  if (
    isGetServerSideProps ||
    (!hasLoader && isDynamicPage && !isWrapperWithExternalHOC)
  ) {
    defaultLoader = 'getServerSideProps'
  }

  return code // @todo implement
}

export default pageTransformation
