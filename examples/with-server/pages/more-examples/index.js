import useTranslation from 'i18n-next-static/useTranslation'
import Trans from 'i18n-next-static/Trans'
import PluralExample from '../../components/plural-example'

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
      <style jsx>{`
        .red {
          color: red;
        }
      `}</style>
    </>
  )
}
