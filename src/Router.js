import NextRouter from 'next/router'

console.warn(
  '🚨 [next-translate] next-translate/Router is now deprecated, it will be removed in next releases. Replace next-translate/Router to next/router, now i18n routing is part of the Next.js core. Read more about it here: https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
)
/**
 * @deprecated
 */
const nav = (ev) => (a1, a2, a3 = {}) => {
  const a1IsObj = typeof a1 === 'object'
  const url = a1IsObj ? a1.url || a1.pathname : a1
  const as = a1IsObj ? a1.as : a2
  const { lang, ...options } = a1IsObj ? a1.options : a3

  return NextRouter[ev](url, as, { ...options, locale: lang })
}

NextRouter.pushI18n = nav('push')
NextRouter.replaceI18n = nav('replace')

export default NextRouter
