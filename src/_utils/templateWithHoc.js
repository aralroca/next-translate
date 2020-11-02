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
  const configPath = `${prefix}${i18nFile}`
  const defaultLoadLocaleFrom = `${prefix}/locales/\${l}/\${n}.json`

  let modifiedCode = code.replace('export default', `const ${pageName} =`)
  const [, , componentName] =
    code.match(/export +default +(function|class) +([A-Z]\w*)/) || []

  if (componentName) {
    modifiedCode = modifiedCode.replace(
      `${componentName}.getInitialProps`,
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
