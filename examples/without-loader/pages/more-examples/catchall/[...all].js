import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

import loadNamespaces from '../../_app'

// There is an issue: https://github.com/vercel/next.js/issues/9022#issuecomment-719599369
export default function All() {
  const { query } = useRouter()
  const { t, lang } = useTranslation()

  return (
    <>
      {JSON.stringify({ query, lang })}
      <br />
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
