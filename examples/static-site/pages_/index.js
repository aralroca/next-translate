import React from 'react'
import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'

export default function Home() {
  const { t, lang } = useTranslation()
  const description = t('home:description')
  const linkName = t('home:more-examples')

  return (
    <>
      <p>{description}</p>
      <Link href={`/${lang}/more-examples`}>
        <a>{linkName}</a>
      </Link>
    </>
  )
}
