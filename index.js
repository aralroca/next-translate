var _toConsumableArray = require('@babel/runtime/helpers/toConsumableArray'),
  _defineProperty = require('@babel/runtime/helpers/defineProperty'),
  _objectWithoutProperties = require('@babel/runtime/helpers/objectWithoutProperties')
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
            _defineProperty(a, c, b[c])
          })
        : Object.getOwnPropertyDescriptors
        ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(b))
        : ownKeys(Object(b)).forEach(function (c) {
            Object.defineProperty(a, c, Object.getOwnPropertyDescriptor(b, c))
          })
  return a
}
function nextTranslate() {
  var a = 0 < arguments.length && arguments[0] !== void 0 ? arguments[0] : {},
    b = a.i18n || {},
    c = b.locales,
    d = b.defaultLocale,
    e = _objectWithoutProperties(b, ['locales', 'defaultLocale'])
  return _objectSpread(
    _objectSpread({}, a),
    {},
    {
      i18n: _objectSpread({ locales: c, defaultLocale: d }, e),
      webpack: function webpack(b) {
        var c = 'function' == typeof a.webpack ? a.webpack(b) : b
        return (
          (c.module.rules = c.module.rules.map(function (a) {
            var b
            if (
              null === a ||
              void 0 === a ||
              null === (b = a.test) ||
              void 0 === b ||
              !b.test('/test.js')
            )
              return a
            var c = { loader: 'next-translate/_loader/loader.js' },
              d = Array.isArray(a.use)
                ? [].concat(_toConsumableArray(a.use), [c])
                : [a.use, c]
            return _objectSpread(_objectSpread({}, a), {}, { use: d })
          })),
          c
        )
      },
    }
  )
}
module.exports = nextTranslate
