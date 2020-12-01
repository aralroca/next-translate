import useTranslation from 'next-translate/useTranslation'
import loadNamespaces from 'next-translate/loadNamespaces'
import i18nConfig from '../i18n'

export default function Error404() {
  const { t, lang } = useTranslation()
  const errorMessage = t`error:404`

  console.log({ lang })

  return errorMessage
}

export async function getStaticProps(ctx) {
  return {
    props: await loadNamespaces({
      ...i18nConfig,
      ...ctx,
      pathname: '/404',
    }),
  }
}
