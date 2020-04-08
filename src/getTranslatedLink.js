import fixAs from './_helpers/fixAs'
import fixHref from './_helpers/fixHref'
import clientSideAlias from './clientSideAlias'
import buildUrl from './_helpers/buildUrl'
import getUrlParams from './_helpers/getUrlParams'

export default function getTranslatedLink(href, asL, lang) {
  const alias = clientSideAlias()
  // revert to original href, as
  Object.keys(alias).forEach((k) => {
    Object.keys(alias[k]).forEach((t) => {
      if (alias[k][t] == href) {
        href = k
        asL = buildUrl(href, getUrlParams(href, asL))
      }
    })
  })
  return {
    href: fixHref(href, lang, alias),
    as: fixAs(asL, href, lang, alias),
  }
}
