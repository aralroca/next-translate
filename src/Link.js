import NextLink from 'next/link'
import fixAs from './_helpers/fixAs'
import fixHref from './_helpers/fixHref'
import useTranslation from './useTranslation'

export default function Link({ children, href, as, lang, ...props }) {
  const current = useTranslation()
  const lng = lang || current.lang

  return (
    <NextLink href={fixHref(href, lng)} as={fixAs(as, href, lng)} {...props}>
      {children}
    </NextLink>
  )
}
