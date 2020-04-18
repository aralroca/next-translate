import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'

import Header from '../../components/header'
import { getI18nProps, getI18nPaths, withI18n } from '../../utils/i18n'

function Home() {
  const { t, lang } = useTranslation()
  const description = t('home:description')
  const linkName = t('home:more-examples')

  return (
    <>
      <Header />
      <p>{description}</p>
      <Link
        href={`/[lang]/more-examples?lang=${lang}`}
        as={`/${lang}/more-examples`}
      >
        <a>{linkName}</a>
      </Link>
    </>
  )
}

export const getStaticProps = async (ctx) => ({
  props: await getI18nProps(ctx, ['common', 'home']),
})

export const getStaticPaths = async () => ({
  paths: getI18nPaths(),
  fallback: false,
})

export default withI18n(Home)
