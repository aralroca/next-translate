const nextTranslate = require('next-translate')
const withMDX = require('@next/mdx')()

console.log('Webpack version', require('webpack').version)

module.exports = nextTranslate(withMDX())
