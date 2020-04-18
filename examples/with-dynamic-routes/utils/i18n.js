import I18nProvider from 'next-translate/I18nProvider'
import i18nConfig from '../i18n.json'

const { allLanguages, defaultLanguage } = i18nConfig

async function importNamespaces(lang, namespaces = []) {
  const pageNamespaces = await Promise.all(
    namespaces.map((ns) =>
      import(`../locales/${lang}/${ns}.json`).then((m) => m.default)
    )
  )

  return namespaces.reduce((obj, ns, i) => {
    obj[ns] = pageNamespaces[i]
    return obj
  }, {})
}

export async function getI18nProps(ctx, namespaces) {
  const lang = ctx.params?.lang || defaultLanguage

  return {
    lang,
    namespaces: await importNamespaces(lang, namespaces),
  }
}

export function getI18nPaths() {
  return allLanguages.map((lang) => ({ params: { lang } }))
}

export function withI18n(Component) {
  function WithI18n(props) {
    return (
      <I18nProvider lang={props.lang} namespaces={props.namespaces}>
        <Component {...props} />
      </I18nProvider>
    )
  }

  return WithI18n
}
