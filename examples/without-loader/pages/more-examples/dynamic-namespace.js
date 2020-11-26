import React from 'react'
import Trans from 'next-translate/Trans'
import DynamicNamespaces from 'next-translate/DynamicNamespaces'
import { loadNamespaces } from '../_app'

export default function ExampleWithDynamicNamespace() {
  return (
    <DynamicNamespaces
      dynamic={(lang, ns) =>
        import(`../../locales/${lang}/${ns}.json`).then((m) => m.default)
      }
      namespaces={['dynamic']}
      fallback="Loading..."
    >
      {/* ALSO IS POSSIBLE TO USE NAMESPACES FROM THE PAGE */}
      <h1>
        <Trans i18nKey="common:title" />
      </h1>

      {/* USING DYNAMIC NAMESPACE */}
      <Trans i18nKey="dynamic:example-of-dynamic-translation" />
    </DynamicNamespaces>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      _ns: await loadNamespaces(['common'], locale),
    },
  }
}
