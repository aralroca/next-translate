import useTranslation from 'next-translate/useTranslation'
import Trans from 'next-translate/Trans'
import Link from 'next/link'

import PluralExample from '../../../components/plural-example'
import Header from '../../../components/header'
import NoFunctionalComponent from '../../../components/no-functional-component'
import { getI18nProps, getI18nPaths, withI18n } from '../../../utils/i18n'

const Component = (props) => <p {...props} />

function MoreExamples() {
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
        components={[<Component />, <b style={{ color: 'red' }} />]}
      />
      <NoFunctionalComponent />
      <br />
      {t`more-examples:nested-example.very-nested.nested`}
      <br />
      <Link
        href={`[lang]/more-examples/dynamic-namespace?lang=${lang}`}
        as={`/${lang}/more-examples/dynamic-namespace`}
      >
        <a>{t('more-examples:dynamic-namespaces-link')}</a>
      </Link>
    </>
  )
}

export const getStaticProps = async (ctx) => ({
  props: await getI18nProps(ctx, ['common', 'more-examples']),
})

export const getStaticPaths = async () => ({
  paths: getI18nPaths(),
  fallback: false,
})

export default withI18n(MoreExamples)
