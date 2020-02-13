import React from 'react'
import { useRouter } from 'next/router'
import useTranslation from 'next-translate/useTranslation'

export default function differentNamespacesByQuery() {
  const { query } = useRouter()
  const { t } = useTranslation()
  const namespace = query.fromDynamic ? 'dynamic' : 'more-examples'

  return <div>{t(`${namespace}:different-namespaces-example`)}</div>
}
