import React from 'react'
import Link from 'next/Link'
import useTranslation from '../lib/useTranslation'

import Header from '../components/header'

export default function Home(){
  const { t, lang } = useTranslation()
  const description = t('home:description')
  const linkName = t('home:more-examples')

  return (
    <>
      <Header />
      <p>{description}</p>
      <Link href={`/${lang}/more-examples`}>{linkName}</Link>
    </>
   )
}
