/**
 * Get page namespaces (with server)
 *
 * @param {object} config
 * @param {string} page
 */
export default async function getServerPageNamespaces(
  ctx,
  { pages = {} },
  page
) {
  const getNs = async p =>
    typeof pages[p] === 'function' ? pages[p](ctx) : pages[p] || []
  return [...(await getNs('*')), ...(await getNs(page))]
}
