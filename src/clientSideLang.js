import Router from 'next/router'

console.warn(
  '🚨 [next-translate] clientSideLang is now deprecated, it will be removed in next releases. Use useRouter from next/router to get the locale. https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
)
/**
 * @deprecated
 */
export default () => Router.locale
