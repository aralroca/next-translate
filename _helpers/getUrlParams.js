'use strict'
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = void 0)
var _default = function (a, b) {
  ;(b = b.split('/')), (a = a.split('/'))
  var c = {}
  return (
    a.forEach(function (a, d) {
      if ('[' == a.slice(0, 1)) {
        var e = a.replace('[', '').replace(']', '')
        c[e] = b[d]
      }
    }),
    c
  )
}
exports['default'] = _default
