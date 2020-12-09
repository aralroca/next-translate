import useTranslation from 'next-translate/useTranslation'

export default function Error404() {
  const { t, lang } = useTranslation()
  const errorMessage = t`error:404`

  console.log({ lang })

  return errorMessage
}
