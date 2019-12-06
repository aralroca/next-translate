import useTranslation from './useTranslation'

/**
 * HOC to use the translations in no-functional components
 */
export default function withTranslation(Component) {
  function WithTranslation(props) {
    const i18n = useTranslation()

    return <Component i18n={i18n} {...props} />
  }
 
  return WithTranslation
}
