/**
 * @deprecated
 */
export default function i18nMiddleware(config = {}) {
  console.warn(
    '🚨 [next-translate] i18nMiddleware is not longer needed, you can remove it. Now i18n routing is part of the Next.js core. Read more about it here: https://github.com/vinissimus/next-translate/releases/tag/0.19.0'
  )
  return (req, res, next) => {
    return next()
  }
}
