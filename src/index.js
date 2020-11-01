/**
 * @todo 1.0.0
 * - Add loadNamespaces helper to these people don't want to use the loader
 * - Add tests for every step of the loader
 * - Add warnings things like old builder, for the builder we need to put a
 *   console.warn indicating how to migrate
 * - Add warning using appWithI18n or loadNamespaces together with the loader
 * - Support TypeScript
 * - Remove all deprecations from 0.19
 * - Deprecate "localesPath" in order to use "loadLocaleFrom"
 * - Do dynamic prop from DynamicNamespace transparent
 * - Add config prop to enable/disable the loader
 * - Update docs + examples
 * - Update GIFs from READMEs
 */
function nextTranslate(nextConfig = {}) {
  const { locales, defaultLocale, ...restI18n } = nextConfig.i18n || {}

  return {
    ...nextConfig,
    i18n: {
      locales,
      defaultLocale,
      ...restI18n,
    },
    webpack(conf) {
      const config =
        typeof nextConfig.webpack === 'function'
          ? nextConfig.webpack(conf)
          : conf

      config.module.rules = config.module.rules.map((r) => {
        if (!r?.test?.test('/test.js')) return r

        const loader = { loader: 'next-translate/_loader/loader.js' }

        // Remember: they are executed in reverse order. Babel should be later.
        // https://webpack.js.org/contribute/writing-a-loader/#complex-usage
        const use = Array.isArray(r.use) ? [...r.use, loader] : [r.use, loader]

        return { ...r, use }
      })

      return config
    },
  }
}

module.exports = nextTranslate
