import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import getT from 'next-translate/getT'
import { useRouter } from 'next/router'

export default function DynamicRoute({ title }) {
  const { query } = useRouter()
  const { t, lang } = useTranslation()

  console.log({ query })

  return (
    <>
      <h1>{title}</h1>
      <h2>{t`more-examples:dynamic-route`}</h2>
      <h3>
        {query.slug} - {lang}
      </h3>
      <Link href="/">{t`more-examples:go-to-home`}</Link>
    </>
  )
}

export async function getServerSideProps({ locale }) {
  const t = await getT(locale, 'common')
  return { props: { title: t('title') } }
}
