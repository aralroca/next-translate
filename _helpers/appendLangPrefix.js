'use strict'
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = appendLangPrefix)
function appendLangPrefix(a, b) {
  return a && a.length
    ? '/'.concat(b, '/').concat(a.replace(/^\//, '')).replace(/\/$/, '')
    : a
}
