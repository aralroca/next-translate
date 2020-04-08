'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault'),
  _interopRequireWildcard = require('@babel/runtime/helpers/interopRequireWildcard')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = Trans)
var _react = _interopRequireWildcard(require('react')),
  _slicedToArray2 = _interopRequireDefault(
    require('@babel/runtime/helpers/slicedToArray')
  ),
  _useTranslation2 = _interopRequireDefault(require('./useTranslation')),
  __jsx = _react['default'].createElement
function _createForOfIteratorHelper(a) {
  if ('undefined' == typeof Symbol || null == a[Symbol.iterator]) {
    if (Array.isArray(a) || (a = _unsupportedIterableToArray(a))) {
      var b = 0,
        c = function () {}
      return {
        s: c,
        n: function n() {
          return b >= a.length ? { done: !0 } : { done: !1, value: a[b++] }
        },
        e: function e(a) {
          throw a
        },
        f: c,
      }
    }
    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
    )
  }
  var d,
    e,
    f = !0,
    g = !1
  return {
    s: function s() {
      d = a[Symbol.iterator]()
    },
    n: function n() {
      var a = d.next()
      return (f = a.done), a
    },
    e: function e(a) {
      ;(g = !0), (e = a)
    },
    f: function f() {
      try {
        f || null == d['return'] || d['return']()
      } finally {
        if (g) throw e
      }
    },
  }
}
function _unsupportedIterableToArray(a, b) {
  if (a) {
    if ('string' == typeof a) return _arrayLikeToArray(a, b)
    var c = Object.prototype.toString.call(a).slice(8, -1)
    return (
      'Object' === c && a.constructor && (c = a.constructor.name),
      'Map' === c || 'Set' === c
        ? Array.from(c)
        : 'Arguments' === c ||
          /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(c)
        ? _arrayLikeToArray(a, b)
        : void 0
    )
  }
}
function _arrayLikeToArray(a, b) {
  ;(null == b || b > a.length) && (b = a.length)
  for (var c = 0, d = Array(b); c < b; c++) d[c] = a[c]
  return d
}
var tagRe = /<(\d+)>(.*?)<\/\1>|<(\d+)\/>/,
  nlRe = /(?:\r\n|\r|\n)/g
function getElements(a) {
  if (!a.length) return []
  var b = a.slice(0, 4),
    c = (0, _slicedToArray2['default'])(b, 4),
    d = c[0],
    e = c[1],
    f = c[2],
    g = c[3]
  return [[parseInt(d || f), e || '', g]].concat(
    getElements(a.slice(4, a.length))
  )
}
function formatElements(a) {
  var b = 1 < arguments.length && arguments[1] !== void 0 ? arguments[1] : [],
    c = a.replace(nlRe, '').split(tagRe)
  if (1 === c.length) return a
  var d = [],
    e = c.shift()
  e && d.push(e)
  var f,
    g = _createForOfIteratorHelper(getElements(c))
  try {
    for (g.s(); !(f = g.n()).done; ) {
      var h = (0, _slicedToArray2['default'])(f.value, 3),
        i = h[0],
        j = h[1],
        k = h[2],
        l = b[i] || __jsx(_react.Fragment, null)
      d.push(
        (0, _react.cloneElement)(
          l,
          { key: i },
          j ? formatElements(j, b) : l.props.children
        )
      ),
        k && d.push(k)
    }
  } catch (a) {
    g.e(a)
  } finally {
    g.f()
  }
  return d
}
function Trans(a) {
  var b = a.i18nKey,
    c = a.values,
    d = a.components,
    e = (0, _useTranslation2['default'])(),
    f = e.t,
    g = (0, _react.useMemo)(
      function () {
        var a = f(b, c)
        return d && 0 !== d.length ? formatElements(a, d) : a
      },
      [b, c, d]
    )
  return g
}
