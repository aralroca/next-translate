import useTranslation from 'next-translate/useTranslation'

export default function LangLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation('common')

  return (
    <>
      <h1>{t`layout-title`}</h1>
      {children}
    </>
  )
}
