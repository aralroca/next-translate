import getConfig from './getConfig'
import transCore from './transCore'
import wrapTWithDefaultNs from './wrapTWithDefaultNs'
import { I18nDictionary, LocaleLoader } from './index'

export default async function getT(
  locale = '',
  namespace: string | string[] = ''
) {
  const appDir = globalThis.__NEXT_TRANSLATE__
  const config = appDir?.config ?? getConfig()
  const defaultLoader = async () => Promise.resolve<I18nDictionary>({})
  const lang = locale || config.defaultLocale || ''
  const loader: LocaleLoader = config.loadLocaleFrom || defaultLoader

  const namespaces = Array.isArray(namespace) ? namespace : [namespace]

  const allNamespaces: Record<string, I18nDictionary> = {}
  await Promise.all(
    namespaces.map(async (namespace) => {
      allNamespaces[namespace] = await loader(lang, namespace)
    })
  )

  const localesToIgnore = config.localesToIgnore || ['default']
  const ignoreLang = localesToIgnore.includes(lang)
  const pluralRules = new Intl.PluralRules(ignoreLang ? undefined : lang)
  const t = transCore({ config, allNamespaces, pluralRules, lang })

  const defaultNamespace = namespaces[0]
  return wrapTWithDefaultNs(t, defaultNamespace)
}
