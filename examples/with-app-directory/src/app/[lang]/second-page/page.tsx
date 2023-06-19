import Link from 'next/link'
import useTranslation from 'next-translate/useTranslation'
import Trans from 'next-translate/Trans'

export default function Page() {
  const { t, lang } = useTranslation('common')
  return (
    <>
      <h2>{t`title`}</h2>
      <Trans i18nKey="common:second-page" components={[<b />]} />
      <div>
        <Link href={`/${lang}`}>⬅️</Link>
      </div>
    </>
  )
}
