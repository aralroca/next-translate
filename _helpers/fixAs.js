'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = void 0)
var _internals = _interopRequireDefault(require('./_internals')),
  _appendLangPrefix = _interopRequireDefault(require('./appendLangPrefix')),
  _getUrlParams = _interopRequireDefault(require('./getUrlParams')),
  _buildUrl = _interopRequireDefault(require('./buildUrl')),
  _default = function (a, b, c, d) {
    return _internals['default'].isStaticMode
      ? (0, _appendLangPrefix['default'])(
          d && d[b] && d[b][c]
            ? (0, _buildUrl['default'])(
                d[b][c],
                (0, _getUrlParams['default'])(b, a)
              )
            : a,
          c
        )
      : (0, _appendLangPrefix['default'])(
          d && d[b] && d[b][c]
            ? (0, _buildUrl['default'])(
                d[b][c],
                (0, _getUrlParams['default'])(b, a || b)
              )
            : a || b,
          c
        )
  }
exports['default'] = _default
