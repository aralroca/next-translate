'use client'

import useTranslation from 'next-translate/useTranslation'

export default function Loading() {
  const { t } = useTranslation('common')
  return <p>{t`loading`}</p>
}
