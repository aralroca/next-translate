import * as React from 'react'
declare function withTranslation<P = unknown>(
  component: React.ComponentType<P>
): React.ComponentType<Omit<P, 'i18n'>>
export default withTranslation
