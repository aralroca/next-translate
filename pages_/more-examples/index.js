import useTranslation from "../../lib/useTranslation"

export default function MoreExamples(){
  const { t } = useTranslation()
  const exampleWithVariable = t('more-examples:example-with-variable', {
    count: 42
  })

  return (
    <>
      <h2>{exampleWithVariable}</h2>
    </>
  )
}