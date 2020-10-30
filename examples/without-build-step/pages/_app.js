import React from 'react'
import I18nProvider from 'next-translate/I18nProvider'
import { useRouter } from 'next/router'

import '../styles.css'

export async function loadNamespaces(namespaces, lang) {
  let res = {}
  for (let ns of namespaces) {
    res[ns] = await import(`../locales/${lang}/${ns}.json`).then(
      (m) => m.default
    )
  }
  return res
}

export default function MyApp({ Component, pageProps }) {
  const router = useRouter()

  return (
    <I18nProvider lang={router.locale} namespaces={pageProps._ns}>
      <Component {...pageProps} />
    </I18nProvider>
  )
}
