import useTranslation from 'next-translate/useTranslation'
import Trans from 'next-translate/Trans'
import Link from 'next/link'
import loadNamespaces from 'next-translate/loadNamespaces'

import PluralExample from '../../components/plural-example'
import Header from '../../components/header'
import NoFunctionalComponent from '../../components/no-functional-component'

const Component = (props) => <p {...props} />

export default function MoreExamples() {
  const { t } = useTranslation()
  const exampleWithVariable = t('more-examples:example-with-variable', {
    count: 42,
  })

  return (
    <>
      <Header />
      <h2>{exampleWithVariable}</h2>
      <PluralExample />
      <Trans
        i18nKey="more-examples:example-with-html"
        components={[<Component />, <b style={{ color: 'red' }} />]}
      />
      <NoFunctionalComponent />
      <br />
      {t`more-examples:nested-example.very-nested.nested`}
      <br />
      <Link href="/more-examples/dynamic-namespace">
        {t('more-examples:dynamic-namespaces-link')}
      </Link>
      <br />
      <Link
        href={{
          pathname: '/more-examples/dynamicroute/example',
          query: { another: 'another param' },
        }}
      >
        {t('more-examples:dynamic-route')}
      </Link>
      <br />
      <Link href="/more-examples/catchall/this/is/an/example">Catchall</Link>
    </>
  )
}

export async function getStaticProps(ctx) {
  return {
    props: await loadNamespaces({
      ...ctx,
      pathname: '/more-examples',
    }),
  }
}
