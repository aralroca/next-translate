import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import Header from '../components/header'

export default function About() {
  const { t } = useTranslation('common')
  return (
    <>
      <Header />
      <h1>About Page</h1>
      <p>
        This is a working page to demonstrate that navigation doesn't crash.
      </p>
      <Link href="/">Go back home</Link>
    </>
  )
}
