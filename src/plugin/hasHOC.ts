import { clearCommentsRgx } from './constants'
import hasExportName from './hasExportName'

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
