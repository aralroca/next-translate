import React, { Children } from 'react'
import NextLink from 'next/link'
import useTranslation from './useTranslation'
import fixAs from './fixAs'
import fixHref from './fixHref'

export default function Link({ children, href, as, lang, noLang, ...props }) {
  const current = useTranslation()
  const lng = lang || current.lang
  const child = Children.only(
    typeof children === 'string' ? <a>{children}</a> : children
  )

  function onClick(e) {
    const el = document.querySelector('html')
    if (el) el.lang = lng
    if (typeof child.props.onClick === 'function') {
      child.props.onClick(e)
    }
  }

  return (
    <NextLink
      href={noLang ? href : fixHref(href, lng)}
      as={noLang ? as : fixAs(as, href, lng)}
      {...props}
    >
      {React.cloneElement(child, { onClick })}
    </NextLink>
  )
}
