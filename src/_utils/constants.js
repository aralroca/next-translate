export const defaultAppJs = `
  import React from 'react'
  import I18nProvider from 'next-translate/I18nProvider'

  function MyApp({ Component, pageProps }) {
    return (
      <I18nProvider lang={pageProps.__lang} namespaces={pageProps.__namespaces}>
        <Component {...pageProps} />
      </I18nProvider>
    )
  }

  export default MyApp
`
