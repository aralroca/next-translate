function _appTransformation(code, { i18nFile, arePagesInsideSrc }) {
  const configPath = arePagesInsideSrc ? `../..${i18nFile}` : `..${i18nFile}`

  return `
    import __i18nConfig from '${configPath}'
    import __appWithI18n from 'next-translate/appWithI18n'
    ${code.replace('export default', 'const __Page_Next_Translate__ =')}
    export default __appWithI18n(__Page_Next_Translate__, __i18nConfig);
  `
}

export default _appTransformation
