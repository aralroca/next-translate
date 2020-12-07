import React from 'react'
import Trans from 'next-translate/Trans'
import DynamicNamespaces from 'next-translate/DynamicNamespaces'
import loadNamespaces from 'next-translate/loadNamespaces'

export default function ExampleWithDynamicNamespace() {
  return (
    <DynamicNamespaces namespaces={['dynamic']} fallback="Loading...">
      {/* ALSO IS POSSIBLE TO USE NAMESPACES FROM THE PAGE */}
      <h1>
        <Trans i18nKey="common:title" />
      </h1>

      {/* USING DYNAMIC NAMESPACE */}
      <Trans i18nKey="dynamic:example-of-dynamic-translation" />
    </DynamicNamespaces>
  )
}

export async function getStaticProps(ctx) {
  return {
    props: await loadNamespaces({
      ...ctx,
      pathname: '/more-examples/dynamic-namespace',
    }),
  }
}
