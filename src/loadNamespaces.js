import getPageNamespaces from './_utils/getPageNamespaces'

export default async function loadNamespaces(config = {}) {
  const __lang =
    config.locale || config.router?.locale || config.defaultLocale || ''

  if (!config.pathname) {
    console.warn(
      '🚨 [next-translate] You forgot to pass the "pathname" inside "loadNamespaces" configuration'
    )
    return { __lang }
  }

  const page =
    removeTrailingSlash(config.pathname.replace(/\/index$/, '')) || '/'
  const namespaces = await getPageNamespaces(config, page, config)
  const defaultLoader = config.defaultLoader || (() => Promise.resolve({}))
  const pageNamespaces =
    (await Promise.all(
      namespaces.map((ns) =>
        typeof config.loadLocaleFrom === 'function'
          ? config.loadLocaleFrom(__lang, ns)
          : defaultLoader(__lang, ns)
      )
    ).catch(() => {})) || []

  if (config.logBuild !== false && typeof window === 'undefined') {
    const color = (c) => `\x1b[36m${c}\x1b[0m`
    console.log(
      color('next-translate'),
      `- compiled page:`,
      color(page),
      '- locale:',
      color(__lang),
      '- namespaces:',
      color(namespaces.join(', ')),
      '- used loader:',
      color(config.loaderName || '-')
    )
  }

  return {
    __lang,
    __namespaces: namespaces.reduce((obj, ns, i) => {
      obj[ns] = pageNamespaces[i]
      return obj
    }, {}),
  }
}

function removeTrailingSlash(path = '') {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}
