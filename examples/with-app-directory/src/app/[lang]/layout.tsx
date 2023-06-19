import useTranslation from 'next-translate/useTranslation'
import i18n from '../../../i18n'
import { redirect } from 'next/navigation'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t, lang } = useTranslation('common')

  // Redirect to default locale if lang is not supported. /second-page -> /en/second-page
  if (!i18n.locales.includes(lang)) redirect(`/${i18n.defaultLocale}/${lang}`)

  return (
    <html lang={lang}>
      <head />
      <body>
        <h1>{t`layout-title`}</h1>
        {children}
      </body>
    </html>
  )
}
