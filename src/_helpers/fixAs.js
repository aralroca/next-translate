import i from './_internals'
import appendLangPrefix from './appendLangPrefix'
import getParams from './getUrlParams'
import buildUrl from './buildUrl'

export default (as, href, lng, alias) =>
  i.isStaticMode
    ? appendLangPrefix(
        alias && alias[href] && alias[href][lng]
          ? buildUrl(alias[href][lng], getParams(href, as))
          : as,
        lng
      )
    : appendLangPrefix(
        alias && alias[href] && alias[href][lng]
          ? buildUrl(alias[href][lng], getParams(href, as || href))
          : as || href,
        lng
      )
