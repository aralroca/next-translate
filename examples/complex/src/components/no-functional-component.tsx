import React from 'react'
import withTranslation from 'next-translate/withTranslation'
import type { I18n } from 'next-translate'

interface Props {
  i18n: I18n
}

class NoFunctionalComponent extends React.Component<Props> {
  render() {
    const { t, lang } = this.props.i18n

    return <div>{t('more-examples:no-functional-example')}</div>
  }
}

export default withTranslation(NoFunctionalComponent)
