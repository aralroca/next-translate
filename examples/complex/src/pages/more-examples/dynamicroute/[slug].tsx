import Link from 'next/link'
import getT from 'next-translate/getT'
import useTranslation from 'next-translate/useTranslation'
import { useRouter } from 'next/router'
import { GetStaticProps } from 'next'

export default function DynamicRoute({ title = '' }) {
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

export function getStaticPaths({ locales }: any) {
  return {
    paths: locales
      .filter((locale: string) => locale !== 'default')
      .map((locale: string) => ({
        locale,
        params: { slug: 'example' },
      })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const t = await getT(locale, 'common')
  return { props: { title: t('title') } }
}
