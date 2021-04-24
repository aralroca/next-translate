import { LoaderConfig, LocaleLoaderSync } from '.'
import getConfig from './getConfig'
import getFallbackPageNamespaces from './getFallbackPageNamespaces'

export default function loadFallbackPageNamespaces(
  config: LoaderConfig = {}
): {
  __lang: string
  __namespaces?: Record<string, object>
} {
  const conf = { ...getConfig(), ...config }
  const __lang: string =
    conf.locale || conf.router?.locale || conf.defaultLocale || ''

  if (!conf.pathname) {
    console.warn(
      '🚨 [next-translate] You forgot to pass the "pathname" inside "loadNamespaces" configuration'
    )
    return { __lang }
  }

  if (!conf.loaderName && conf.loader !== false) {
    console.warn(
      '🚨 [next-translate] You can remove the "loadNamespaces" helper, unless you set "loader: false" in your i18n config file.'
    )
  }

  const page = removeTrailingSlash(conf.pathname.replace(/\/index$/, '')) || '/'
  const namespaces = getFallbackPageNamespaces(conf, page, conf)
  const defaultLoader: LocaleLoaderSync = () => ({})
  const pageNamespaces = namespaces.map((ns) =>
    typeof conf.loadLocaleFromSync === 'function'
      ? conf.loadLocaleFromSync(__lang, ns)
      : defaultLoader(__lang, ns)
  )

  if (conf.logBuild !== false && typeof window === 'undefined') {
    const color = (c: string) => `\x1b[36m${c}\x1b[0m`
    console.log(
      color('next-translate'),
      `- compiled page:`,
      color(page),
      '- locale:',
      color(__lang),
      '- namespaces:',
      color(namespaces.join(', ')),
      '- used loader:',
      color(conf.loaderName || '-')
    )
  }

  return {
    __lang,
    __namespaces: namespaces.reduce((obj: Record<string, object>, ns, i) => {
      obj[ns] = pageNamespaces[i]
      return obj
    }, {}),
  }
}

function removeTrailingSlash(path = '') {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path
}
