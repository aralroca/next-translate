import hasExportName from './hasExportName'

/**
 * @description This is a helper is to check if the page is wrapped with a HOC or not. It is
 *  assumed that "data" param is the code in string, where the comments have been previously
 *  cleaned.
 *
 * @param {string} data
 */
export default function hasHOC(rawData) {
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

  // Remove withTranslation hoc, in this case we can ensure that is not using
  // a getInitialProps on the Page.
  // Ex: "export default withTranslation(somevariable)" -> export default somevariable
  const [, withTranslationName] = rawData.match(hasWithTranslationHOC) || []
  const data = rawData.replace(
    new RegExp(`${withTranslationName}\\(.*\\)`),
    (d) => d.replace(new RegExp(`(${withTranslationName}|\\(|\\))`, 'g'), '')
  )

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
