/**
 * @description This is a helper is to check if the page is wrapped with a HOC or not. It is
 *  assumed that "data" param is the code in string, where the comments have been previously
 *  cleaned.
 *
 * @param {string} data
 */
export default function hasHOC(data) {
  const hocRgx = new RegExp('[^\\(|\\| )]*\\([A-Z][^\\(|\\| )]*\\)')

  if (!data.includes('export default')) return false
  if (
    new RegExp(
      `export *(const|var|let|async function|function) *(getStaticProps|getServerSideProps|getStaticPaths)`
    ).test(data)
  ) {
    return false
  }

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
