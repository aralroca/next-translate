import { interceptExport, overwriteLoadLocales } from './utils'
import { ParsedFilePkg } from './types'

export default function templateWithHoc(
  pagePkg: ParsedFilePkg,
  { skipInitialProps = false, hasLoadLocaleFrom = false } = {}
) {
  // Random string based on current time
  const hash = Date.now().toString(16)

  // Removes export modifiers from the page
  // and tells under what name we can get the old export
  const pageVariableName = interceptExport(
    pagePkg,
    'default',
    `__Next_Translate__Page__${hash}__`
  )

  // Do not process code if there is no default export
  const hasDefaultExport = Boolean(pageVariableName)
  if (!hasDefaultExport) return pagePkg.getCode()

  return `
    import __i18nConfig from '@next-translate-root/i18n'
    import __appWithI18n from 'next-translate/appWithI18n'
    ${pagePkg.getCode()}
    export default __appWithI18n(${pageVariableName}, {
      ...__i18nConfig,
      isLoader: true,
      skipInitialProps: ${skipInitialProps},
      ${overwriteLoadLocales(hasLoadLocaleFrom)}
    });
  `
}
