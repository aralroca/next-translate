'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = appWithI18n)
var _regenerator = _interopRequireDefault(
    require('@babel/runtime/regenerator')
  ),
  _defineProperty2 = _interopRequireDefault(
    require('@babel/runtime/helpers/defineProperty')
  ),
  _react = _interopRequireDefault(require('react')),
  _I18nProvider = _interopRequireDefault(require('./I18nProvider')),
  _getDefaultLang = _interopRequireDefault(
    require('./_helpers/getDefaultLang')
  ),
  _getPageNamespaces = _interopRequireDefault(
    require('./_helpers/getPageNamespaces')
  ),
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
function getLang(a, b) {
  var c = a.req,
    d = a.asPath,
    e = void 0 === d ? '' : d
  if (c) return c.query.lang || (0, _getDefaultLang['default'])(c, b)
  var f = b.allLanguages.some(function (a) {
    return e.startsWith('/'.concat(a))
  })
  return f ? e.split('/')[1] : (0, _getDefaultLang['default'])(c, b)
}
function removeTrailingSlash() {
  var a = 0 < arguments.length && arguments[0] !== void 0 ? arguments[0] : ''
  return 1 < a.length && a.endsWith('/') ? a.slice(0, -1) : a
}
function appWithI18n(a) {
  function b(b) {
    var c = b.lang,
      d = b.namespaces,
      e = b.alias
    return __jsx(
      _I18nProvider['default'],
      { lang: c, namespaces: d, alias: e },
      __jsx(a, b)
    )
  }
  var c = 1 < arguments.length && void 0 !== arguments[1] ? arguments[1] : {}
  return (
    (b.getInitialProps = function (b) {
      var d, e, f, g, h, i, j, k
      return _regenerator['default'].async(
        function (l) {
          for (;;)
            switch ((l.prev = l.next)) {
              case 0:
                if (
                  ((d = b.Component),
                  (e = b.ctx),
                  (f = getLang(e, c)),
                  (g = { pageProps: {} }),
                  !a.getInitialProps)
                ) {
                  l.next = 10
                  break
                }
                return (
                  (l.next = 6),
                  _regenerator['default'].awrap(
                    a.getInitialProps({ Component: d, ctx: e, lang: f })
                  )
                )
              case 6:
                if (((l.t0 = l.sent), l.t0)) {
                  l.next = 9
                  break
                }
                l.t0 = {}
              case 9:
                g = l.t0
              case 10:
                return (
                  (h = removeTrailingSlash(e.pathname)),
                  (l.next = 13),
                  _regenerator['default'].awrap(
                    (0, _getPageNamespaces['default'])(c, h, e)
                  )
                )
              case 13:
                return (
                  (i = l.sent),
                  (j = c.alias || {}),
                  (l.next = 17),
                  _regenerator['default'].awrap(
                    Promise.all(
                      i.map(function (a) {
                        return 'function' == typeof c.loadLocaleFrom
                          ? c.loadLocaleFrom(f, a)
                          : Promise.resolve([])
                      })
                    )
                  )
                )
              case 17:
                return (
                  (k = l.sent),
                  l.abrupt(
                    'return',
                    _objectSpread({}, g, {
                      lang: f,
                      alias: j,
                      namespaces: i.reduce(function (a, b, c) {
                        return (a[b] = k[c]), a
                      }, {}),
                    })
                  )
                )
              case 19:
              case 'end':
                return l.stop()
            }
        },
        null,
        null,
        null,
        Promise
      )
    }),
    b
  )
}
