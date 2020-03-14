import i from './_internals'
import appendLangPrefix from './appendLangPrefix'

export default (as, href, lng) =>
  i.isStaticMode ? appendLangPrefix(as, lng) : appendLangPrefix(as || href, lng)
