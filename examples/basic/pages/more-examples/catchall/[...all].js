import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'

export default function All() {
  const { query } = useRouter()
  const { t, lang } = useTranslation()

  return (
    <>
      {JSON.stringify({ query, lang })}
      <br />
      <Link href="/">{t`more-examples:go-to-home`}</Link>
    </>
  )
}
