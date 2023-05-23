import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Router from 'next/router'
import useTranslation from 'next-translate/useTranslation'

import styles from './header.module.css'

export default function Header() {
  const { t, lang } = useTranslation()
  const title = t('common:title')

  function changeToEn() {
    Router.push('/', undefined, { locale: 'en' })
  }

  return (
    <>
      <Head>
        <title>
          {title} | ({lang.toUpperCase()})
        </title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <h1>{title}</h1>
        {lang !== 'es' && (
          <Link href="/" locale="es">
            Español
          </Link>
        )}
        {lang !== 'ca' && (
          <Link href="/" locale="ca">
            Català
          </Link>
        )}
        {lang !== 'en' && (
          <>
            <Link href="/" locale="en">
              English
            </Link>
            <button onClick={changeToEn}>English Router.push</button>
          </>
        )}
      </header>
    </>
  )
}
