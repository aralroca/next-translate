import React from 'react'
import useTranslation from './useTranslation'
import { I18n } from '.'

/**
 * HOC to use the translations in no-functional components
 */
export default function withTranslation<P = unknown>(
  Component: React.ComponentType<P>
): React.ComponentType<P & { i18n: I18n }> {
  function WithTranslation(props: P) {
    const i18n = useTranslation()

    return <Component i18n={i18n} {...props} />
  }

  return WithTranslation
}
