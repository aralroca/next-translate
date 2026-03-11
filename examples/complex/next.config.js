const nextTranslate = require('next-translate-plugin')
const withMDX = require('@next/mdx')()
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// Note: only available in Next.js +16 (for 15, you need to force a boolean)
const isTurbopack = !process.argv.includes('--webpack')

module.exports = nextTranslate(withBundleAnalyzer(withMDX()), {
  turbopack: isTurbopack,
})
