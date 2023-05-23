import useTranslation from 'next-translate/useTranslation'
import Trans from 'next-translate/Trans'
import Link from 'next/link'

import Header from '../../components/header'
import MdxExample from '../../components/mdx-example.mdx'
import NoFunctionalComponent from '../../components/no-functional-component'
import PluralExample from '../../components/plural-example'

const Component = (props: any) => <p {...props} />

export default function MoreExamples() {
  const { t } = useTranslation('more-examples')
  const exampleWithVariable = t('example-with-variable', {
    exampleOfVariable: 42,
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
      {t`nested-example.very-nested.nested`}
      <br />
      <MdxExample />
      <br />
      <Link href="/more-examples/dynamic-namespace">
        {t('dynamic-namespaces-link')}
      </Link>
      <br />
      <Link
        href={{
          pathname: '/more-examples/dynamicroute/example',
          query: { another: 'another param' },
        }}
      >
        {t('dynamic-route')}
      </Link>
      <br />
      <Link href="/more-examples/catchall/this/is/an/example">Catchall</Link>
    </>
  )
}
