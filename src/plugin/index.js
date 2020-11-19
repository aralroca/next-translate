/**
 * @todo 1.0.0
 * - Support TypeScript
 * - Should work with Webpack 5
 * - Should work with .ts files, without compiling errors
 * - Check that work fine with other Next plugins
 * - Update docs + examples (in TypeScript + better pages)
 * - Check that is not transforming anything on /api folder and tests files
 * - Check that works fine with markdown in jsx
 * - Update GIFs from READMEs
 * - Test that work on /pages and /src/pages
 * - Wrote a default way to load locales when loadLocaleFrom is not provided
 */
function nextTranslate(nextConfig = {}) {
  const fs = require('fs')
  const arePagesInsideSrc = fs.existsSync(process.cwd() + '/src/pages')
  let file = '/i18n.js'

  if (!fs.existsSync(process.cwd() + file)) file = '/i18n.json'
  if (!fs.existsSync(process.cwd() + file)) {
    console.error(
      '🚨 [next-translate] You should provide the next-translate config inside i18n.js / i18n.json root file.'
    )
    return nextConfig
  }

  const i18n = nextConfig.i18n || {}
  const {
    locales,
    defaultLocale,
    loader = true,
    pages,
    logger,
    ...restI18n
  } = require(process.cwd() + file)

  // @todo Remove all these warnings on 1.1.0
  const migrationLink =
    'https://github.com/vinissimus/next-translate/releases/tag/1.0.0'
  if (restI18n.currentPagesDir) {
    console.warn(
      `🚨 [next-translate] "currentPagesDir" is no longer necessary, you can just remove it. Learn more on ${migrationLink}`
    )
  }

  if (restI18n.finalPagesDir) {
    console.warn(
      `🚨 [next-translate] "finalPagesDir" is no longer necessary, you can just remove it. Learn more on ${migrationLink}`
    )
  }

  if (restI18n.localesPath) {
    console.warn(
      `🚨 [next-translate] "localesPath" is no longer supported, you should replace it to "loadLocaleFrom". Learn more on ${migrationLink}`
    )
  }

  if (restI18n.package !== undefined) {
    console.warn(
      `🚨 [next-translate] "package" is no longer supported, you should replace it to "loadLocaleFrom". Learn more on ${migrationLink}`
    )
  }

  const hasGetInitialPropsOnAppJs = require('./hasGetInitialPropsOnAppJs')(
    arePagesInsideSrc
  )

  return {
    ...nextConfig,
    i18n: {
      ...i18n,
      ...restI18n,
      locales,
      defaultLocale,
    },
    webpack(conf, options) {
      const config =
        typeof nextConfig.webpack === 'function'
          ? nextConfig.webpack(conf, options)
          : conf

      // we give the opportunity for people to use next-translate without altering
      // any document, allowing them to manually add the necessary helpers on each
      // page to load the namespaces.
      if (!loader) return config

      config.module.rules = config.module.rules.map((r) => {
        if (!r?.test?.test('/test.js')) return r

        const loader = {
          loader: 'next-translate/plugin/loader',
          options: {
            extensionsRgx: r.test,
            hasGetInitialPropsOnAppJs,
          },
        }

        // Remember: they are executed in reverse order. Babel should be later.
        // https://webpack.js.org/contribute/writing-a-loader/#complex-usage
        let use = []
        if (Array.isArray(r.use)) use = [...r.use, loader]
        else if (typeof r.use === 'object') use = [r.use, loader]
        else if (r !== null && r.use === null) use = [{ ...r }, loader]

        return { ...r, use }
      })

      return config
    },
  }
}

module.exports = nextTranslate
