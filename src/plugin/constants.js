export const clearCommentsRgx = /\/\*[\s\S]*?\*\/|\/\/.*/g
export const defaultLoader =
  '(l, n) => import(`' +
  process.cwd() +
  '/locales/${l}/${n}`).then(m => m.default)'

export const defaultAppJs = `
  import i18nConfig from '${process.cwd() + '/i18n'}'
  import appWithI18n from 'next-translate/appWithI18n'

  function MyApp({ Component, pageProps }) {
    return <Component {...pageProps} />
  }

  export default appWithI18n(MyApp, {
    ...i18nConfig,
    skipInitialProps: true,
    defaultLoader: ${defaultLoader},
    isLoader: true
  })
`
