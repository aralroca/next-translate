import i from './_internals'
import appendLangPrefix from './appendLangPrefix'

export default (href, lng) =>
  i.isStaticMode ? appendLangPrefix(href, lng) : href
