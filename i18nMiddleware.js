'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = i18nMiddleware)
var _slicedToArray2 = _interopRequireDefault(
    require('@babel/runtime/helpers/slicedToArray')
  ),
  _defineProperty2 = _interopRequireDefault(
    require('@babel/runtime/helpers/defineProperty')
  ),
  _getDefaultLang = _interopRequireDefault(require('./_helpers/getDefaultLang'))
function ownKeys(a, b) {
  var c = Object.keys(a)
  if (Object.getOwnPropertySymbols) {
    var d = Object.getOwnPropertySymbols(a)
    b &&
      (d = d.filter(function (b) {
        return Object.getOwnPropertyDescriptor(a, b).enumerable
      })),
      c.push.apply(c, d)
  }
  return c
}
function _objectSpread(a) {
  for (var b, c = 1; c < arguments.length; c++)
    (b = null == arguments[c] ? {} : arguments[c]),
      c % 2
        ? ownKeys(Object(b), !0).forEach(function (c) {
            ;(0, _defineProperty2['default'])(a, c, b[c])
          })
        : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(b))
        : ownKeys(Object(b)).forEach(function (c) {
            Object.defineProperty(a, c, Object.getOwnPropertyDescriptor(b, c))
          })
  return a
}
function i18nMiddleware() {
  var a = 0 < arguments.length && arguments[0] !== void 0 ? arguments[0] : {},
    b = a.ignoreRoutes,
    c =
      void 0 === b
        ? [
            '/_next/',
            '/static/',
            '/favicon.ico',
            '/manifest.json',
            '/robots.txt',
          ]
        : b,
    d = a.allLanguages,
    e = void 0 === d ? [] : d,
    f = a.redirectToDefaultLang
  return function (b, d, g) {
    var h = c.some(function (a) {
        return b.url.startsWith(a)
      }),
      i = e.some(function (a) {
        return b.url.startsWith('/'.concat(a))
      })
    if (h) return g()
    if (!i) {
      var n = (0, _getDefaultLang['default'])(b, a) || 'en'
      return void 0 !== f && f
        ? void d.redirect(301, '/'.concat(n).concat(b.url))
        : ((b.lang = n),
          (b.query = _objectSpread({}, b.query, { lang: n })),
          g())
    }
    var j = b.url.split('/')[1]
    b.url = b.url.replace('/'.concat(j), '') || '/'
    var k = c.filter(function (a) {
        return b.url.startsWith(a)
      }),
      l = (0, _slicedToArray2['default'])(k, 1),
      m = l[0]
    return m
      ? void d.redirect(301, m)
      : ((b.lang = j), (b.query = _objectSpread({}, b.query, { lang: j })), g())
  }
}
