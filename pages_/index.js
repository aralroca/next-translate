import React from 'react'
import Header from '../components/header'
import { useTranslation } from '../lib'

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
