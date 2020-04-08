'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = getTranslatedLink)
var _fixAs = _interopRequireDefault(require('./_helpers/fixAs')),
  _fixHref = _interopRequireDefault(require('./_helpers/fixHref')),
  _clientSideAlias = _interopRequireDefault(require('./clientSideAlias')),
  _buildUrl = _interopRequireDefault(require('./_helpers/buildUrl')),
  _getUrlParams = _interopRequireDefault(require('./_helpers/getUrlParams'))
function getTranslatedLink(a, b, c) {
  var d = (0, _clientSideAlias['default'])()
  return (
    Object.keys(d).forEach(function (c) {
      Object.keys(d[c]).forEach(function (e) {
        d[c][e] == a &&
          ((a = c),
          (b = (0, _buildUrl['default'])(
            a,
            (0, _getUrlParams['default'])(a, b)
          )))
      })
    }),
    {
      href: (0, _fixHref['default'])(a, c, d),
      as: (0, _fixAs['default'])(b, a, c, d),
    }
  )
}
