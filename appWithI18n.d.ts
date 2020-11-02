import * as React from 'react'
import { I18n, I18nConfig } from './'
declare function appWithI18n<P = unknown>(
  app: React.ComponentType<P>,
  i18nConfig: I18nConfig
): React.ComponentType<P & { i18n: I18n }>
export default appWithI18n
