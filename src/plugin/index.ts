/**
 * @todo 1.0.0
 * - Add loadNamespaces helper to these people don't want to use the loader
 * - Add warnings things like old builder, for the builder we need to put a
 *   console.warn indicating how to migrate
 * - Add warning using appWithI18n or loadNamespaces together with the loader
 * - Support TypeScript
 * - Deprecate "localesPath" in order to use "loadLocaleFrom"
 * - Do dynamic prop from DynamicNamespace transparent
 * - Add config prop to enable/disable the loader (loader=false)
 * - Should work with Webpack 5
 * - Should work with .ts files, without compiling errors
 * - Check that work fine with other Next plugins
 * - Update docs + examples (in TypeScript + better pages)
 * - Support logBuild
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
