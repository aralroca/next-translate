import { LoaderConfig } from '.'
import getPageNamespaces from './getPageNamespaces'

export default async function loadNamespaces(config: LoaderConfig = {}) {
  const __lang: string =
    config.locale || config.router?.locale || config.defaultLocale || ''

  if (!config.pathname) {
    console.warn(
      '🚨 [next-translate] You forgot to pass the "pathname" inside "loadNamespaces" configuration'
    )
    return { __lang }
  }

  if (!config.loaderName && config.loader !== false) {
    console.warn(
      '🚨 [next-translate] You can remove the "loadNamespaces" helper, unless you set "loader: false" in your i18n config file.'
    )
  }

  const page =
    removeTrailingSlash(config.pathname.replace(/\/index$/, '')) || '/'
  const namespaces = await getPageNamespaces(config, page, config)
  const defaultLoader = (l, n) => Promise.resolve({})
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
    }, {} as Record<string, object>),
  }
}

function removeTrailingSlash(path = '') {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}
