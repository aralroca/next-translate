import { I18nConfig, PageValue } from '.'

// @todo Replace to [].flat() in the future
function flat(a: string[][]): string[] {
  return a.reduce((b, c) => b.concat(c), [])
}

/**
 * Strip Next.js App Router route groups from a path.
 * Route groups are path segments wrapped in parentheses, e.g. /(main)/
 * They are used for layout organization but don't affect the URL.
 */
function stripRouteGroups(path: string): string {
  return path.replace(/\/\([^)]+\)/g, '')
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

  const normalizedPage = stripRouteGroups(page)

  // Namespaces promises using regex
  const rgxs = Object.keys(pages).reduce((arr: Promise<string[]>[], p) => {
    if (
      p.substring(0, rgx.length) === rgx &&
      new RegExp(p.replace(rgx, '')).test(page)
    ) {
      arr.push(getNs(pages[p]))
    }
    return arr
  }, [])

  // Try exact match first, then match by stripping route groups from both sides
  let pageNs = pages[page]
  if (!pageNs) {
    const match = Object.keys(pages).find(
      (p) =>
        p !== '*' &&
        !p.startsWith(rgx) &&
        stripRouteGroups(p) === normalizedPage
    )
    if (match) pageNs = pages[match]
  }

  return [
    ...(await getNs(pages['*'])),
    ...(await getNs(pageNs)),
    ...flat(await Promise.all(rgxs)),
  ]
}
