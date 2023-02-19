import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import loadNamespaces from 'next-translate/loadNamespaces'
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

export function getStaticPaths({ locales }) {
  return {
    paths: [
      ...locales.map((locale) => ({
        locale,
        params: { all: ['this'] },
      })),
      ...locales.map((locale) => ({
        locale,
        params: { all: ['this', 'is'] },
      })),
      ...locales.map((locale) => ({
        locale,
        params: { all: ['this', 'is', 'an'] },
      })),
      ...locales.map((locale) => ({
        locale,
        params: { all: ['this', 'is', 'an', 'example'] },
      })),
    ],
    fallback: true,
  }
}

export async function getStaticProps(ctx) {
  return {
    props: await loadNamespaces({
      ...ctx,
      pathname: '/more-examples/catchall/[..all]',
    }),
  }
}
