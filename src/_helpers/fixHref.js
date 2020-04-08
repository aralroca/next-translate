import i from './_internals'
import appendLangPrefix from './appendLangPrefix'
import getParams from './getUrlParams'
import buildUrl from './buildUrl'

export default (href, lng, alias = false) => {
  return i.isStaticMode
    ? appendLangPrefix(
        alias && alias[href] && alias[href][lng]
          ? buildUrl(alias[href][lng], getParams(href, href))
          : href,
        lng
      )
    : href
}
