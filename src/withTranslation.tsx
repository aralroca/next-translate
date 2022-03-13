import React from 'react'
import useTranslation from './useTranslation'
import { NextComponentType } from 'next'

/**
 * HOC to use the translations in no-functional components
 */
export default function withTranslation<P = unknown>(
  Component: React.ComponentType<P> | NextComponentType<any, any, any>,
  defaultNS?: string
): React.ComponentType<Omit<P, 'i18n'>> {
  const WithTranslation: NextComponentType<any, any, any> = (props: P) => {
    const i18n = useTranslation(defaultNS)
    return <Component {...props} i18n={i18n} />
  }

  WithTranslation.getInitialProps = async (ctx) => {
    const WrappedComponent = Component as NextComponentType<any, any, any>
    if (WrappedComponent.getInitialProps) {
      return (await WrappedComponent.getInitialProps(ctx)) || {}
    } else {
      return {}
    }
  }

  WithTranslation.displayName = `withTranslation(${
    Component.displayName || ''
  })`

  return WithTranslation
}
