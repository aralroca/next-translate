import useTranslation from 'next-translate/useTranslation'
import loadNamespaces from 'next-translate/loadNamespaces'

export default function Error404() {
  const { t, lang } = useTranslation()
  const errorMessage = t`error:404`

  console.log({ lang })

  return errorMessage
}

export async function getStaticProps(ctx) {
  return {
    props: await loadNamespaces({
      ...ctx,
      pathname: '/404',
    }),
  }
}
