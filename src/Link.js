import NextLink from 'next/link'
import useTranslation from './useTranslation'
import fixAs from './_helpers/fixAs'
import fixHref from './_helpers/fixHref'

export default function Link({ children, href, as, lang, noLang, ...props }) {
  const current = useTranslation()
  const lng = lang || current.lang

  return (
    <NextLink
      href={noLang ? href : fixHref(href, lng)}
      as={noLang ? as : fixAs(as, href, lng)}
      {...props}
    >
      {children}
    </NextLink>
  )
}
