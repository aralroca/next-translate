import { I18nConfig, PageValue } from '.'

// @todo Replace to [].flat() in the future
function flat(a: string[][]): string[] {
  return a.reduce((b, c) => b.concat(c), [])
}

/**
 * Get page namespaces
 *
 * @param {object} config
 * @param {string} page
 */
export default async function getPageNamespaces(
  { pages = {} }: I18nConfig,
  page: string,
  ctx: object
): Promise<string[]> {
  const rgx = 'rgx:'
  const getNs = async (ns: PageValue): Promise<string[]> =>
    typeof ns === 'function' ? ns(ctx) : ns || []

  // Namespaces promises using regex
  const rgxs = Object.keys(pages).reduce((arr, p) => {
    if (
      p.substring(0, rgx.length) === rgx &&
      new RegExp(p.replace(rgx, '')).test(page)
    ) {
      arr.push(getNs(pages[p]))
    }
    return arr
  }, [] as Promise<string[]>[])

  return [
    ...(await getNs(pages['*'])),
    ...(await getNs(pages[page])),
    ...flat(await Promise.all(rgxs)),
  ]
}
