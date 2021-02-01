import getConfig from './getConfig'
import transCore from './transCore'
import wrapTWithDefaultNs from './wrapTWithDefaultNs'
import { I18nDictionary, LocaleLoader } from './index'

export default async function getT(locale = '', namespace = '') {
  const config = getConfig()
  const defaultLoader = async () => Promise.resolve<I18nDictionary>({})
  const lang = locale || config.defaultLocale
  const loader: LocaleLoader = config.loadLocaleFrom || defaultLoader
  const allNamespaces = { [namespace]: await loader(lang, namespace) }
  const pluralRules = new Intl.PluralRules(lang)
  const t = transCore({
    config,
    allNamespaces,
    pluralRules,
    lang: lang as string,
  })

  return wrapTWithDefaultNs(t, namespace)
}
