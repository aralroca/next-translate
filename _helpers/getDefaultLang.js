'use strict'
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = getDefaultLang)
function getDefaultLang(a, b) {
  return 'function' == typeof b.defaultLanguage
    ? b.defaultLanguage(a)
    : b.defaultLanguage
}
