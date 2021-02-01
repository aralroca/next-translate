import { clearCommentsRgx, overwriteLoadLocales } from './utils'

export default function templateWithHoc(
  code: string,
  {
    skipInitialProps = false,
    typescript = false,
    pageName = '__Page_Next_Translate__',
    hasLoadLocaleFrom = false,
  } = {}
) {
  const tokenToReplace = `__CODE_TOKEN_${Date.now().toString(16)}__`
  const codeWithoutComments = code.replace(clearCommentsRgx, '')

  // Replacing all the possible "export default" (if there are comments
  // can be possible to have more than one)
  let modifiedCode = code.replace(/export +default/g, `const ${pageName} =`)

  // It is necessary to change the name of the page that uses getInitialProps
  // to ours, this way we avoid issues.
  const [, , componentName] =
    codeWithoutComments.match(
      /export +default +(function|class) +([A-Z]\w*)/
    ) || []

  if (componentName) {
    modifiedCode = modifiedCode.replace(
      new RegExp(`\\W${componentName}\\.getInitialProps`, 'g'),
      `${pageName}.getInitialProps`
    )
  }

  let template = `
    import __i18nConfig from '@next-translate-root/i18n'
    import __appWithI18n from 'next-translate/appWithI18n'
    ${tokenToReplace}
    export default __appWithI18n(__Page_Next_Translate__, {
      ...__i18nConfig,
      isLoader: true,
      skipInitialProps: ${skipInitialProps},
      ${overwriteLoadLocales(hasLoadLocaleFrom)}
    });
  `

  if (typescript) template = template.replace(/\n/g, '\n// @ts-ignore\n')

  return template.replace(tokenToReplace, `\n${modifiedCode}\n`)
}
