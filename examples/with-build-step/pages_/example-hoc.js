import useTranslation from 'next-translate/useTranslation'

const withHOC = (C) => (p) => <C {...p} />

// Just for tests
function PageWithHOC() {
  const { t } = useTranslation()
  return <div>{t`common:title`}</div>
}

export default withHOC(PageWithHOC)
