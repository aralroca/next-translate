import React from 'react'
import NextLink from 'next/link'

console.warn(
  '🚨 [next-translate] next-translate/Link is now deprecated, it will be removed in next releases. Replace next-translate/Link to next/link, now i18n routing is part of the Next.js core. Read more about it here: https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
)

/**
 * @deprecated
 */
export default function Link({ lang, noLang, ...props }) {
  return <NextLink locale={noLang ? undefined : lang} {...props} />
}
