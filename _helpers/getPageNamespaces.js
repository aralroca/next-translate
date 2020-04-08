'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = getPageNamespaces)
var _toConsumableArray2 = _interopRequireDefault(
    require('@babel/runtime/helpers/toConsumableArray')
  ),
  _regenerator = _interopRequireDefault(require('@babel/runtime/regenerator'))
function flat(b) {
  return b.reduce(function (a, b) {
    return a.concat(b)
  }, [])
}
function getPageNamespaces(a, b, c) {
  var d, e, f, g, h
  return _regenerator['default'].async(
    function (i) {
      for (;;)
        switch ((i.prev = i.next)) {
          case 0:
            return (
              (d = a.pages),
              (e = void 0 === d ? {} : d),
              (f = 'rgx:'),
              (g = function (a) {
                return _regenerator['default'].async(
                  function (b) {
                    for (;;)
                      switch ((b.prev = b.next)) {
                        case 0:
                          return b.abrupt(
                            'return',
                            'function' == typeof a ? a(c) : a || []
                          )
                        case 1:
                        case 'end':
                          return b.stop()
                      }
                  },
                  null,
                  null,
                  null,
                  Promise
                )
              }),
              (h = Object.keys(e).reduce(function (a, c) {
                return (
                  c.substring(0, f.length) === f &&
                    new RegExp(c.replace(f, '')).test(b) &&
                    a.push(g(e[c])),
                  a
                )
              }, [])),
              (i.t0 = []),
              (i.t1 = _toConsumableArray2['default']),
              (i.next = 8),
              _regenerator['default'].awrap(g(e['*']))
            )
          case 8:
            return (
              (i.t2 = i.sent),
              (i.t3 = (0, i.t1)(i.t2)),
              (i.t4 = _toConsumableArray2['default']),
              (i.next = 13),
              _regenerator['default'].awrap(g(e[b]))
            )
          case 13:
            return (
              (i.t5 = i.sent),
              (i.t6 = (0, i.t4)(i.t5)),
              (i.t7 = _toConsumableArray2['default']),
              (i.t8 = flat),
              (i.next = 19),
              _regenerator['default'].awrap(Promise.all(h))
            )
          case 19:
            return (
              (i.t9 = i.sent),
              (i.t10 = (0, i.t8)(i.t9)),
              (i.t11 = (0, i.t7)(i.t10)),
              i.abrupt('return', i.t0.concat.call(i.t0, i.t3, i.t6, i.t11))
            )
          case 23:
          case 'end':
            return i.stop()
        }
    },
    null,
    null,
    null,
    Promise
  )
}
