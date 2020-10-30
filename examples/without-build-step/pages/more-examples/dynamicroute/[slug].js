import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { loadNamespaces } from '../../_app'

export default function DynamicRoute() {
  const { query } = useRouter()
  const { t, lang } = useTranslation()

  console.log({ query })

  return (
    <>
      <h1>{t`more-examples:dynamic-route`}</h1>
      <h2>
        {query.slug} - {lang}
      </h2>
      <Link href="/">
        <a>{t`more-examples:go-to-home`}</a>
      </Link>
    </>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      _ns: await loadNamespaces(['common', 'more-examples'], locale),
    },
  }
}
