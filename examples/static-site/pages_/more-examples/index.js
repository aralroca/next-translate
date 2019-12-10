import useTranslation from 'next-translate/useTranslation'
import Trans from 'next-translate/Trans'
import Link from 'next/link'

import PluralExample from '../../components/plural-example'
import Header from '../../components/header'
import NoFunctionalComponent from '../../components/no-functional-component'

const Component = props => <p {...props} />

export default function MoreExamples() {
  const { t, lang } = useTranslation()
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
        components={[<Component />, <b className="red" />]}
      />
      <NoFunctionalComponent />
      <br />
      <Link href={`/${lang}/more-examples/dynamic-namespace`}>
        {t('more-examples:dynamic-namespaces-link')}
      </Link>
      <style jsx>{`
        .red {
          color: red;
        }
      `}</style>
    </>
  )
}
