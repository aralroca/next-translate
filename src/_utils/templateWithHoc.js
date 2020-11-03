import { clearCommentsRgx } from './constants'

function templateWithHoc(
  code,
  {
    i18nFile,
    arePagesInsideSrc,
    skipInitialProps = false,
    prefix = arePagesInsideSrc ? '../..' : '..',
    pageName = '__Page_Next_Translate__',
  }
) {
  const codeWithoutComments = code.replace(clearCommentsRgx, '')

  // Skip any transformation if for some reason they forgot to write the
  // "export default" on the page
  if (!codeWithoutComments.includes('export default')) return code

  const configPath = `${prefix}${i18nFile}`
  const defaultLoadLocaleFrom = `${prefix}/locales/\${l}/\${n}.json`

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
    import __i18nConfig from '${configPath}'
    import __appWithI18n from 'next-translate/appWithI18n'
    ${modifiedCode}
    export default __appWithI18n(__Page_Next_Translate__, {
      loadLocaleFrom: (l, n) => import(\`${defaultLoadLocaleFrom}\`).then(m => m.default),
      ...__i18nConfig,
      isLoader: true,
      skipInitialProps: ${skipInitialProps},
    });
  `
}

export default templateWithHoc
