'use strict'
var _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard'),
  _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = I18nProvider)
var _slicedToArray2 = _interopRequireDefault(
    require('@babel/runtime/helpers/slicedToArray')
  ),
  _defineProperty2 = _interopRequireDefault(
    require('@babel/runtime/helpers/defineProperty')
  ),
  _react = _interopRequireWildcard(require('react')),
  _context = _interopRequireDefault(require('./_context')),
  _internals = require('./_helpers/_internals'),
  __jsx = _react['default'].createElement
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
var NsContext = (0, _react.createContext)({})
function getDicValue(a) {
  var b = 1 < arguments.length && arguments[1] !== void 0 ? arguments[1] : '',
    c = b.split('.').reduce(function (a, b) {
      return a[b] || {}
    }, a)
  return 'string' == typeof c ? c : void 0
}
function plural(a, b, c) {
  if (!c || 'number' != typeof c.count) return b
  var d = ''.concat(b, '_').concat(c.count)
  if (getDicValue(a, d) !== void 0) return d
  var e = ''.concat(b, '_plural')
  return 1 < c.count && void 0 !== getDicValue(a, e) ? e : b
}
function interpolation(a, b) {
  return a && b
    ? Object.keys(b).reduce(function (a, c) {
        var d = new RegExp('{{\\s*'.concat(c, '\\s*}}'), 'gm')
        return (a = a.replace(d, ''.concat(b[c]))), a
      }, a)
    : a || ''
}
function I18nProvider(a) {
  var b = a.lang,
    c = a.alias,
    d = void 0 === c ? {} : c,
    e = a.namespaces,
    f = void 0 === e ? {} : e,
    g = a.children,
    h = a.isStaticMode,
    i = (0, _react.useContext)(NsContext),
    j = _objectSpread({}, i, {}, f)
  return (
    (0, _internals.setInternals)({ lang: b, isStaticMode: h, alias: d }),
    __jsx(
      _context['default'].Provider,
      {
        value: {
          lang: b,
          t: function () {
            var a =
                0 < arguments.length && void 0 !== arguments[0]
                  ? arguments[0]
                  : '',
              b = 1 < arguments.length ? arguments[1] : void 0,
              c = Array.isArray(a) ? a[0] : a,
              d = c.split(':'),
              e = (0, _slicedToArray2['default'])(d, 2),
              f = e[0],
              g = e[1],
              h = j[f] || {},
              i = plural(h, g, b),
              k = getDicValue(h, i)
            return interpolation(k, b) || c
          },
          alias: d,
        },
      },
      __jsx(NsContext.Provider, { value: j }, g)
    )
  )
}
