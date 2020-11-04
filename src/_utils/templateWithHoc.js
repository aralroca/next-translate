import { clearCommentsRgx } from './constants'

export default function templateWithHoc(
  code,
  { skipInitialProps = false, pageName = '__Page_Next_Translate__' }
) {
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

  return `
    import __i18nConfig from '${process.cwd() + '/i18n'}'
    import __appWithI18n from 'next-translate/appWithI18n'
    ${modifiedCode}
    export default __appWithI18n(__Page_Next_Translate__, {
      ...__i18nConfig,
      isLoader: true,
      skipInitialProps: ${skipInitialProps},
    });
  `
}
