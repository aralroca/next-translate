import useTranslation from 'next-translate/useTranslation'
import Trans from 'next-translate/Trans'
import PluralExample from '../../components/plural-example'
import NoFunctionalComponent from '../../components/no-functional-component'

const Component = props => <p {...props} />

export default function MoreExamples() {
  const { t } = useTranslation()
  const exampleWithVariable = t('more-examples:example-with-variable', {
    count: 42,
  })

  return (
    <>
      <h2>{exampleWithVariable}</h2>
      <PluralExample />
      <Trans
        i18nKey="more-examples:example-with-html"
        components={[<Component />, <b className="red" />]}
      />
      <NoFunctionalComponent />
      <style jsx>{`
        .red {
          color: red;
        }
      `}</style>
    </>
  )
}
