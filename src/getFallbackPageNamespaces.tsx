import { I18nConfig, PageValue } from '.'

// @todo Replace to [].flat() in the future
function flat(a: string[][]): string[] {
  return a.reduce((b, c) => b.concat(c), [])
}

/**
 * Get fallback page namespaces
 *
 * @param {object} config
 * @param {string} page
 */
export default function getFallbackPageNamespaces(
  { pages = {} }: I18nConfig,
  page: string,
  ctx: object
): string[] {
  const rgx = 'rgx:'
  const getNs = (ns: PageValue): string[] =>
    typeof ns === 'function' ? ns(ctx) : ns || []

  // Namespaces promises using regex
  const rgxs = Object.keys(pages).reduce((arr: string[][], p) => {
    if (
      p.substring(0, rgx.length) === rgx &&
      new RegExp(p.replace(rgx, '')).test(page)
    ) {
      arr.push(getNs(pages[p]))
    }
    return arr
  }, [])

  return [...getNs(pages['*']), ...getNs(pages[page]), ...flat(rgxs)]
}
