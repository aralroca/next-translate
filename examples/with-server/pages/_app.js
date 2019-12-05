import { appWithI18n } from 'i18n-next-static'

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />
}

export default appWithI18n(MyApp, {
  defaultLanguage: 'es',
  loadLocaleFrom: (lang, ns) => (
    import(`../locales/${lang}/${ns}.json`)
    .then(m => m.default)
  ),
  pages: {
    '/': ['common', 'home'],
    '/more-examples': ['common', 'more-examples']
  }
})
