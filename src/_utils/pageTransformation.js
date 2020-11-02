import templateWithHoc from './templateWithHoc'
import { clearCommentsRgx } from './constants'
import hasExportName from './hasExportName'
import hasHOC from './hasHOC'

function pageTransformation(
  rawCode,
  { i18nFile, arePagesInsideSrc, page } = {}
) {
  const code = rawCode.replace(clearCommentsRgx, '')
  const dotsNumber = page.split('/').length - 1
  const dots = Array.from({ length: dotsNumber })
    .map(() => '..')
    .join('/')
  const prefix = arePagesInsideSrc ? '../' + dots : dots
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
    return templateWithHoc(code, {
      i18nFile,
      arePagesInsideSrc,
      prefix,
    })
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
