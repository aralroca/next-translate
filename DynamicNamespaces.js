'use strict'
var _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard'),
  _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = DynamicNamespaces)
var _regenerator = _interopRequireDefault(
    require('@babel/runtime/regenerator')
  ),
  _react = _interopRequireWildcard(require('react')),
  _I18nProvider = _interopRequireDefault(require('./I18nProvider')),
  _useTranslation2 = _interopRequireDefault(require('./useTranslation')),
  __jsx = _react['default'].createElement
function DynamicNamespaces(a) {
  function b() {
    var a
    return _regenerator['default'].async(
      function (b) {
        for (;;)
          switch ((b.prev = b.next)) {
            case 0:
              if ('function' == typeof c) {
                b.next = 2
                break
              }
              return b.abrupt('return')
            case 2:
              return (
                (b.next = 4),
                _regenerator['default'].awrap(
                  Promise.all(
                    e.map(function (a) {
                      return c(i, a)
                    })
                  )
                )
              )
            case 4:
              ;(a = b.sent), o(a), l(!0)
            case 7:
            case 'end':
              return b.stop()
          }
      },
      null,
      null,
      null,
      Promise
    )
  }
  var c = a.dynamic,
    d = a.namespaces,
    e = void 0 === d ? [] : d,
    f = a.fallback,
    g = a.children,
    h = (0, _useTranslation2['default'])(),
    i = h.lang,
    j = (0, _react.useState)(!1),
    k = j[0],
    l = j[1],
    m = (0, _react.useState)({}),
    n = m[0],
    o = m[1]
  return (
    (0, _react.useEffect)(function () {
      b()
    }, []),
    k
      ? __jsx(
          _I18nProvider['default'],
          {
            lang: i,
            namespaces: e.reduce(function (a, b, c) {
              return (a[b] = n[c]), a
            }, {}),
          },
          g
        )
      : f || null
  )
}
