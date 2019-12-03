import useTranslation from "../../lib/useTranslation"
import PluralExample from '../../components/plural-example'

export default function MoreExamples(){
  const { t } = useTranslation()
  const exampleWithVariable = t('more-examples:example-with-variable', {
    count: 42
  })

  return (
    <>
      <h2>{exampleWithVariable}</h2>
      <PluralExample />
    </>
  )
}