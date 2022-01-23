import Router from 'next/router'

export default async function setLanguage(
  locale: string,
  scroll = true
): Promise<boolean> {
  return await Router.push(
    {
      pathname: Router.pathname,
      query: Router.query,
    },
    Router.asPath,
    { locale, scroll }
  )
}
