'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = void 0)
var _router = _interopRequireDefault(require('next/router')),
  _clientSideLang = _interopRequireDefault(require('./clientSideLang')),
  _clientSideAlias = _interopRequireDefault(require('./clientSideAlias')),
  _fixAs = _interopRequireDefault(require('./_helpers/fixAs')),
  _fixHref = _interopRequireDefault(require('./_helpers/fixHref')),
  nav = function (a) {
    return function (b, c) {
      var d =
          2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : {},
        e = 'object' == typeof b,
        f = e ? b.url : b,
        g = e ? b.as : c,
        h = e ? b.options : d,
        i = h.lang || (0, _clientSideLang['default'])(),
        j = (0, _clientSideAlias['default'])()
      return _router['default'][a](
        (0, _fixHref['default'])(f, i, j),
        (0, _fixAs['default'])(g, f, i, j),
        h
      )
    }
  }
;(_router['default'].pushI18n = nav('push')),
  (_router['default'].replaceI18n = nav('replace'))
var _default = _router['default']
exports['default'] = _default
