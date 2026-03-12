import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import Header from '../components/header'

export default function Dashboard() {
  const { t } = useTranslation('home')
  return (
    <>
      <Header />
      <h1>Dashboard Page</h1>
      <p>Using home namespace. Translation: {t('description')}</p>
      <Link href="/">Go back home</Link>
    </>
  )
}
