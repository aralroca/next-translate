import React from 'react'
import Link from 'next/link'
import useTranslation from 'i18n-next-static/useTranslation'

import Header from '../components/header'

export default function Home() {
  const { t, lang } = useTranslation()
  const description = t('home:description')
  const linkName = t('home:more-examples')

  return (
    <>
      <Header />
      <p>{description}</p>
      <Link href={`/${lang}/more-examples`}>
        <a>{linkName}</a>
      </Link>
    </>
  )
}
