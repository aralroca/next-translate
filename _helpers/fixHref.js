'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = void 0)
var _internals = _interopRequireDefault(require('./_internals')),
  _appendLangPrefix = _interopRequireDefault(require('./appendLangPrefix')),
  _getUrlParams = _interopRequireDefault(require('./getUrlParams')),
  _buildUrl = _interopRequireDefault(require('./buildUrl')),
  _default = function (a, b) {
    var c = !!(2 < arguments.length && arguments[2] !== void 0) && arguments[2]
    return _internals['default'].isStaticMode
      ? (0, _appendLangPrefix['default'])(
          c && c[a] && c[a][b]
            ? (0, _buildUrl['default'])(
                c[a][b],
                (0, _getUrlParams['default'])(a, a)
              )
            : a,
          b
        )
      : a
  }
exports['default'] = _default
