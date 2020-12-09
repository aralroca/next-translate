const specFileOrFolderRgx = /(__mocks__|__tests__)|(\.(spec|test)\.(tsx|ts|js|jsx)$)/

export const clearCommentsRgx = /\/\*[\s\S]*?\*\/|\/\/.*/g

export const defaultLoader =
  '(l, n) => import(`@next-translate-root/locales/${l}/${n}`).then(m => m.default)'

export function getDefaultAppJs(hasLoadLocaleFrom) {
  return `
  import i18nConfig from '@next-translate-root/i18n'
  import appWithI18n from 'next-translate/appWithI18n'

  function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />
  }

  export default appWithI18n(MyApp, {
    ...i18nConfig,
    skipInitialProps: true,
    isLoader: true,
    ${overwriteLoadLocales(hasLoadLocaleFrom)}
  })
`
}

export function overwriteLoadLocales(exist) {
  if (exist) return ''
  return `loadLocaleFrom: ${defaultLoader},`
}

export function hasExportName(data, name) {
  return Boolean(
    data.match(
      new RegExp(`export +(const|var|let|async +function|function) +${name}`)
    ) ||
      data.match(
        new RegExp(`export\\s*\\{[^}]*(?<!\\w)${name}(?!\\w)[^}]*\\}`, 'm')
      )
  )
}

export function isPageToIgnore(page) {
  return Boolean(
    page.startsWith('/api/') ||
      page.startsWith('/_document.') ||
      page.match(specFileOrFolderRgx)
  )
}

export function hasHOC(rawData) {
  const hocRgx = new RegExp('[^\\(|\\| )]+\\([A-Z][^\\(|\\| )]*\\)')
  const hasWithTranslationHOC = new RegExp(
    'import *(\\w*) *.*from *.*next-translate\\/withTranslation.*'
  )

  if (!rawData.includes('export default')) return false
  if (
    hasExportName(rawData, 'getStaticProps') ||
    hasExportName(rawData, 'getServerSideProps') ||
    hasExportName(rawData, 'getStaticPaths')
  ) {
    return false
  }

  const [, withTranslationName] = rawData.match(hasWithTranslationHOC) || []
  const data = rawData
    // Remove withTranslation hoc, in this case we can ensure that is not using
    // a getInitialProps on the Page.
    // Ex: "export default withTranslation(somevariable)" -> export default somevariable
    .replace(new RegExp(`${withTranslationName}\\(.*\\)`), (d) =>
      d.replace(new RegExp(`(${withTranslationName}|\\(|\\))`, 'g'), '')
    )
    // Clear all comments
    .replace(clearCommentsRgx, '')

  const exportedNormally = new RegExp(
    `export default (\\(.*\\) *=>|function)`
  ).test(data)
  if (exportedNormally) return false

  const ref = (data.replace(/ /g, '').match(`exportdefault*([^\\n|;]*)`) ||
    [])[1]

  if (hocRgx.test(ref)) return true

  return (
    data
      .split('/n')
      .filter((line) => line.includes(ref))
      .filter((line) => hocRgx.test(line)).length > 0
  )
}
