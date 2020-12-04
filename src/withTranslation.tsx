import React from 'react'
import useTranslation from './useTranslation'

/**
 * HOC to use the translations in no-functional components
 */
export default function withTranslation<P = unknown>(
  Component: React.ComponentType<P>
): React.ComponentType<Omit<P, "i18n">> {
  function WithTranslation(props: P) {
    const i18n = useTranslation()

    return <Component {...props} i18n={i18n} />
  }

  WithTranslation.displayName = `withTranslation(${Component.displayName || ''})`

  return WithTranslation
}
