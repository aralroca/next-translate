import React from 'react'
import useTranslation from '../lib/useTranslation'

import Header from '../components/header'

export default function Home(){
  const { t } = useTranslation()
  const description = t('home:description')

  return (
    <>
      <Header />
      <p>{description}</p>
    </>
   )
}
