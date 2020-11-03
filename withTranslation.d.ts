import * as React from 'react'
import { I18n } from './'
declare function withTranslation<P = unknown>(
  component: React.ComponentType<P>
): React.ComponentType<P & { i18n: I18n }>
export default withTranslation
