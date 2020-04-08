'use strict'
var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')
Object.defineProperty(exports, '__esModule', { value: !0 }),
  (exports['default'] = Link)
var _react = _interopRequireDefault(require('react')),
  _extends2 = _interopRequireDefault(require('@babel/runtime/helpers/extends')),
  _objectWithoutProperties2 = _interopRequireDefault(
    require('@babel/runtime/helpers/objectWithoutProperties')
  ),
  _link = _interopRequireDefault(require('next/link')),
  _useTranslation = _interopRequireDefault(require('./useTranslation')),
  _fixAs = _interopRequireDefault(require('./_helpers/fixAs')),
  _fixHref = _interopRequireDefault(require('./_helpers/fixHref')),
  __jsx = _react['default'].createElement
function Link(a) {
  var b = a.children,
    c = a.href,
    d = a.as,
    e = a.lang,
    f = a.noLang,
    g = (0, _objectWithoutProperties2['default'])(a, [
      'children',
      'href',
      'as',
      'lang',
      'noLang',
    ]),
    h = (0, _useTranslation['default'])(),
    i = e || h.lang
  return __jsx(
    _link['default'],
    (0, _extends2['default'])(
      {
        href: f ? c : (0, _fixHref['default'])(c, i, h.alias),
        as: f ? d : (0, _fixAs['default'])(d, c, i, h.alias),
      },
      g
    ),
    b
  )
}
