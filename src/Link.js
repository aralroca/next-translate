import NextLink from 'next/link'
import useTranslation from './useTranslation'
import fixAs from './_helpers/fixAs'
import fixHref from './_helpers/fixHref'

export default function Link({ children, href, as, lang, noLang, ...props }) {
  const current = useTranslation()
  const lng = lang || current.lang

  return (
    <NextLink
      href={noLang ? href : fixHref(href, lng, current.alias)}
      as={noLang ? as : fixAs(as, href, lng, current.alias)}
      {...props}
    >
      {children}
    </NextLink>
  )
}
