import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'

import Header from '../components/header'
import { loadNamespaces } from './_app'

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

export async function getStaticProps({ locale }) {
  return {
    props: {
      _ns: await loadNamespaces(['common', 'home'], locale),
    },
  }
}
