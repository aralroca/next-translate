'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = withTranslation)
var _react = _interopRequireDefault(require('react')),
  _extends2 = _interopRequireDefault(require('@babel/runtime/helpers/extends')),
  _useTranslation = _interopRequireDefault(require('./useTranslation')),
  __jsx = _react['default'].createElement
function withTranslation(a) {
  return function (b) {
    var c = (0, _useTranslation['default'])()
    return __jsx(a, (0, _extends2['default'])({ i18n: c }, b))
  }
}
