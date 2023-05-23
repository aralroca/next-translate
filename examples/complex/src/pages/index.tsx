import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import Header from '../components/header'

export default function Home() {
  const { t } = useTranslation('home')
  const description = t('description')
  const linkName = t('more-examples')

  return (
    <>
      <Header />
      <p>{description}</p>
      <Link href="/more-examples">{linkName}</Link>
    </>
  )
}
