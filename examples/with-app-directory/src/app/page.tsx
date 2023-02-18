import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import ClientCode from '../components/client-code'

export default function Page() {
  const { t, lang } = useTranslation('common')

  return (
    <>
      <h1>{t('title')}</h1>

      <ClientCode />

      <div style={{ marginTop: 20 }}>
        <Link href="/?lang=en" as="/en">
          English
        </Link>
      </div>

      <div>
        <Link href="/?lang=es" as="/es">
          Español
        </Link>
      </div>

      <div>
        <Link href="/?lang=ca" as="/ca">
          Català
        </Link>
      </div>

      <div>
        <Link href={`/second-page?lang=${lang}`} as={`/${lang}/second-page`}>
          ➡️
        </Link>
      </div>
    </>
  )
}

export const metadata = {
  title: 'App directory',
}
