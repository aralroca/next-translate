import { useEffect } from 'react'
import Router from 'next/router'

import i18nConfig from '../i18n.json'

const { defaultLanguage } = i18nConfig

export default function Index() {
  useEffect(() => {
    Router.replace(`/${defaultLanguage}`)
  }, [])

  return null
}
