function _appTransformation(
  code,
  { i18nFile, arePagesInsideSrc, skipInitialProps = false }
) {
  const prefix = arePagesInsideSrc ? '../..' : '..'
  const configPath = `${prefix}${i18nFile}`
  const defaultLoadLocaleFrom = `${prefix}/locales/\${l}/\${n}.json`

  return `
    import __i18nConfig from '${configPath}'
    import __appWithI18n from 'next-translate/appWithI18n'
    ${code.replace('export default', 'const __Page_Next_Translate__ =')}
    export default __appWithI18n(__Page_Next_Translate__, {
      loadLocaleFrom: (l, n) => import(\`${defaultLoadLocaleFrom}\`).then(m => m.default),
      ...__i18nConfig,
      isLoader: true,
      skipInitialProps: ${skipInitialProps},
    });
  `
}

export default _appTransformation
