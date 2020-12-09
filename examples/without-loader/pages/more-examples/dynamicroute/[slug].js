import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import loadNamespaces from 'next-translate/loadNamespaces'

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

export function getStaticPaths({ locales }) {
  return {
    paths: locales.map((locale) => ({
      locale,
      params: { slug: 'example' },
    })),
    fallback: true,
  }
}

export async function getStaticProps(ctx) {
  return {
    props: await loadNamespaces({
      ...ctx,
      pathname: '/more-examples/dynamicroute/[slug]',
    }),
  }
}
