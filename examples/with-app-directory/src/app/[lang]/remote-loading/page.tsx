import React from 'react'
import createTranslation from 'next-translate/createTranslation'
import Trans from 'next-translate/Trans'
import Link from 'next/link'

export default async function RemoteLoadingPage() {
  const { t, lang } = await createTranslation('remote')

  return (
    <>
      <h2>{t('title')}</h2>
      <p>{t('description')}</p>

      <div style={{ margin: '20px 0', padding: '10px', border: '1px solid #ccc' }}>
        <h3>Using Trans Component:</h3>
        <Trans
          i18nKey="remote:html-example"
          components={[<span style={{ color: 'blue' }} />, <b />]}
        />
      </div>

      <div style={{ marginTop: 20 }}>
        <Link href={`/${lang}`}>⬅️ Back home</Link>
      </div>
    </>
  )
}

export const metadata = {
  title: 'Remote Loading Example',
}
