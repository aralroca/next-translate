import getConfig from './getConfig'
import transCore from './transCore'
import wrapTWithDefaultNs from './wrapTWithDefaultNs'

export default async function getT(locale = '', namespace = '') {
  const config = getConfig()
  const defaultLoader = async (l, n) => Promise.resolve({})
  const lang = locale || config.defaultLocale
  const loader = config.loadLocaleFrom || defaultLoader
  const allNamespaces = { [namespace]: await loader(lang, namespace) }
  const pluralRules = new Intl.PluralRules(lang)
  const t = transCore({ config, allNamespaces, pluralRules })

  return wrapTWithDefaultNs(t, namespace)
}
