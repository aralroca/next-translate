import React from 'react'
import Head from 'next/Head'
import Link from 'next/link'
import { useTranslation } from 'i18n-next-static'

export default function Header() {
  const { t, lang } = useTranslation()
  const title = t('common:title')

  return (
    <>
      <Head>
        <title>
          {title} | ({lang.toUpperCase()})
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header>
        <h1>{title}</h1>
        {lang !== 'es' && <Link href="/es"><a>Español</a></Link>}
        {lang !== 'ca' && <Link href="/ca"><a>Català</a></Link>}
        {lang !== 'en' && <Link href="/en"><a>English</a></Link>}
      </header>
      <style jsx>
        {`
          header {
            display: flex;
            flex-direction: column;
          }
        `}
      </style>
    </>
  )
}
