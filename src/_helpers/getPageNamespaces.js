/**
 * Get page namespaces
 *
 * @param {object} config
 * @param {string} page
 */
export default async function getPageNamespaces({ pages = {} }, page, ctx) {
  const getNs = async ns => (typeof ns === 'function' ? ns(ctx) : ns || [])

  const rgxs = Object.keys(pages).reduce((arr, p) => {
    if (p.startsWith('rgx:') && new RegExp(p.replace('rgx:', '')).test(page)) {
      arr.push(getNs(pages[p]))
    }
    return arr
  }, [])

  return [
    ...(await getNs(pages['*'])),
    ...(await getNs(pages[page])),
    ...(await Promise.all(rgxs)).flat(),
  ]
}
