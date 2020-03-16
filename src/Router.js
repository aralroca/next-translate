import NextRouter from 'next/router'
import clientSideLang from './clientSideLang'
import fixAs from './_helpers/fixAs'
import fixHref from './_helpers/fixHref'

const nav = ev => (a1, a2, a3 = {}) => {
  const a1IsObj = typeof a1 === 'object'
  const url = a1IsObj ? a1.url : a1
  const as = a1IsObj ? a1.as : a2
  const options = a1IsObj ? a1.options : a3
  const lng = options.lang || clientSideLang()

  return NextRouter[ev](fixHref(url, lng), fixAs(as, url, lng), options)
}

NextRouter.pushI18n = nav('push')
NextRouter.replaceI18n = nav('replace')

export default NextRouter
