import React from 'react'
import Trans from 'next-translate/Trans'
import DynamicNamespaces from 'next-translate/DynamicNamespaces'
import { getI18nProps, getI18nPaths, withI18n } from '../../../utils/i18n'

function ExampleWithDynamicNamespace() {
  return (
    <DynamicNamespaces
      dynamic={(lang, ns) =>
        import(`../../../locales/${lang}/${ns}.json`).then((m) => m.default)
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

export const getStaticProps = async (ctx) => ({
  props: await getI18nProps(ctx, ['common', 'more-examples']),
})

export const getStaticPaths = async () => ({
  paths: getI18nPaths(),
  fallback: false,
})

export default withI18n(ExampleWithDynamicNamespace)
