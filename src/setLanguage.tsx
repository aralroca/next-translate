import Router from 'next/router'

export default async function setLanguage(locale: string): Promise<boolean> {
  return await Router.push(Router.pathname, Router.asPath, {
    locale,
  })
}
