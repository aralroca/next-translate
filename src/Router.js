import NextRouter from 'next/router'
import clientSideLang from './clientSideLang'
import fixAs from './fixAs'
import fixHref from './fixHref'

console.warn(
  '[next-translate] next-translate/Router is now deprecated, it will be removed in next releases. Replace next-translate/Router to next/router, now i18n routing is part of the Next.js core. Read more about it here: https://nextjs.org/docs/advanced-features/i18n-routing'
)
/**
 * @deprecated
 */
const nav = (ev) => (a1, a2, a3 = {}) => {
  const a1IsObj = typeof a1 === 'object'
  const url = a1IsObj ? a1.url : a1
  const as = a1IsObj ? a1.as : a2
  const options = a1IsObj ? a1.options : a3
  const lng = options.lang || clientSideLang()
  const el = document.querySelector('html')

  if (el) el.lang = lng

  return NextRouter[ev](fixHref(url, lng), fixAs(as, url, lng), options)
}

NextRouter.pushI18n = nav('push')
NextRouter.replaceI18n = nav('replace')

export default NextRouter
