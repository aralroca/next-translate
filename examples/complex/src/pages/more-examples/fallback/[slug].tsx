import { GetStaticProps } from 'next'
import getT from 'next-translate/getT'
import useTranslation from 'next-translate/useTranslation'
import withFallbackTranslation from 'next-translate/withFallbackTranslation'
import Link from 'next/link'
import { useRouter } from 'next/router'

function DynamicRoute({ title = '' }) {
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
      <Link href="/">
        <a>{t`more-examples:go-to-home`}</a>
      </Link>
    </>
  )
}

export function getStaticPaths({ locales }: any) {
  return {
    paths: locales.map((locale: string) => ({
      locale,
      params: { slug: 'example' },
    })),
    fallback: true,
  }
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const t = await getT(locale, 'common')
  return { props: { title: t('title') }, revalidate: 5 }
}

export default withFallbackTranslation(DynamicRoute)
