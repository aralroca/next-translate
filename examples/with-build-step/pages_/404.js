import useTranslation from 'next-translate/useTranslation'

export default function Error404() {
  const { t, lang } = useTranslation()

  console.log({ lang })

  return t`error:404`
}
