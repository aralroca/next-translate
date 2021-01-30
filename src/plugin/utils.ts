const specFileOrFolderRgx = /(__mocks__|__tests__)|(\.(spec|test)\.(tsx|ts|js|jsx)$)/

export const clearCommentsRgx = /\/\*[\s\S]*?\*\/|\/\/.*/g

export const defaultLoader =
  '(l, n) => import(`@next-translate-root/locales/${l}/${n}`).then(m => m.default)'

export function getDefaultAppJs(hasLoadLocaleFrom: boolean) {
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

export function overwriteLoadLocales(exist: boolean): string {
  if (exist) return ''
  return `loadLocaleFrom: ${defaultLoader},`
}

export function hasExportName(data: string, name: string) {
  return Boolean(
    data.match(
      new RegExp(`export +(const|var|let|async +function|function) +${name}`)
    ) ||
      data.match(
        new RegExp(`export\\s*\\{[^}]*(?<!\\w)${name}(?!\\w)[^}]*\\}`, 'm')
      )
  )
}

export function isPageToIgnore(page: string) {
  return Boolean(
    page.startsWith('/api/') ||
      page.startsWith('/_document.') ||
      page.match(specFileOrFolderRgx)
  )
}

export function hasHOC(rawData: string) {
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
    .replace(new RegExp(`${withTranslationName}\\(.*\\)`), (d: string) =>
      d.replace(new RegExp(`(${withTranslationName}|\\(|\\))`, 'g'), '')
    )
    // Clear all comments
    .replace(clearCommentsRgx, '')

  // If is exported normally (function, var, etc), is not a HOC
  const exportedNormally = new RegExp(
    `export default (\\(.*\\) *=>|function|class)`
  ).test(data)
  if (exportedNormally) return false

  const ref = getRef(data)

  // If the ref includes a "(", is a HOC
  if (ref.includes('(')) return true

  // If not, the export default is just a reference defined on other place.
  // So let's look all the lines that include the reference
  return (
    data.split('\n').filter((line: string) => {
      const isRefLine = line.includes(ref) && !/export +default/.test(line)
      const isComp = new RegExp(`(function|class) +${ref}\\W`).test(line)
      const isCompInVar = new RegExp(` *${ref} += +(function|class) +`).test(
        line
      )
      const isArrowFunc = new RegExp(` *${ref}(: *\\w+ *)? += +\\(.*=>`).test(
        line
      )
      const isPotentialHOC = /=.*\(/.test(line)

      return (
        isRefLine && !isComp && !isCompInVar && !isArrowFunc && isPotentialHOC
      )
    }).length > 0
  )
}

function getRef(data: string) {
  const escapeRegex = (str: string) =>
    str.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')
  const ref = (data.replace(/ /g, '').match(`exportdefault*([^\\n|;]*)`) ||
    [])[1]
  const prevRef = (data.match(
    new RegExp(`${escapeRegex(ref)} += +(\\w+)($| |;|\\n)`)
  ) || [])[1]

  return prevRef || ref
}
