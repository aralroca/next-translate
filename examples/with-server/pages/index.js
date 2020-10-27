import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'

import Header from '../components/header'

export default function Home() {
  const { t } = useTranslation()
  const description = t('home:description')
  const linkName = t('home:more-examples')

  return (
    <>
      <Header />
      <p>{description}</p>
      <Link href="/more-examples">
        <a>{linkName}</a>
      </Link>
    </>
  )
}
