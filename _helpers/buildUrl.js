'use strict'
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = void 0)
var _default = function (a, b) {
  return (
    Object.keys(b).forEach(function (c) {
      a = a.replace('['.concat(c, ']'), b[c])
    }),
    a
  )
}
exports['default'] = _default
