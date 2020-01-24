export default function getDefaultLang(req, config) {
  if (typeof config.defaultLanguage === 'function') {
    return config.defaultLanguage(req)
  }
  return config.defaultLanguage
}
