import { hasHOC } from './utils'

export default function nextTranslate(nextConfig: any = {}) {
  const fs = require('fs')
  const path = require('path')
  const test = /\.(tsx|ts|js|mjs|jsx)$/

  // NEXT_TRANSLATE_PATH env is supported both relative and absolute path
  const dir = path.resolve(
    path.relative(pkgDir(), process.env.NEXT_TRANSLATE_PATH || '.')
  )

  // https://github.com/blitz-js/blitz/blob/canary/nextjs/packages/next/build/utils.ts#L54-L59
  const getDefaultPageDir = () => {
    if (fs.existsSync(path.join(dir, 'src/pages'))) {
      return 'src/pages'
    } else if (fs.existsSync(path.join(dir, 'app/pages'))) {
      return 'app/pages'
    } else if (fs.existsSync(path.join(dir, 'integrations/pages'))) {
      return 'integrations/pages'
    }
    return 'pages'
  }

  const i18n = nextConfig.i18n || {}
  const {
    locales,
    defaultLocale,
    loader = true,
    pagesInDir = getDefaultPageDir(),
    pages,
    logger,
    keySeparator,
    nsSeparator,
    defaultNS,
    loadLocaleFrom,
    extensionsRgx = test,
    revalidate = 0,
    ...restI18n
  } = require(path.join(dir, 'i18n'))

  let hasGetInitialPropsOnAppJs = false

  const pagesPath = path.join(dir, pagesInDir)
  const app = fs
    .readdirSync(pagesPath)
    .find((page: string) => page.startsWith('_app.'))

  if (app) {
    const code = fs.readFileSync(path.join(pagesPath, app)).toString('UTF-8')
    hasGetInitialPropsOnAppJs =
      !!code.match(/\WgetInitialProps\W/g) || hasHOC(code)
  }

  return {
    ...nextConfig,
    i18n: {
      ...i18n,
      ...restI18n,
      locales,
      defaultLocale,
    },
    webpack(conf: any, options: Record<string, any>) {
      const config =
        typeof nextConfig.webpack === 'function'
          ? nextConfig.webpack(conf, options)
          : conf

      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        '@next-translate-root': path.resolve(dir),
      }

      // we give the opportunity for people to use next-translate without altering
      // any document, allowing them to manually add the necessary helpers on each
      // page to load the namespaces.
      if (!loader) return config

      config.module.rules.push({
        test,
        use: {
          loader: 'next-translate/plugin/loader',
          options: {
            extensionsRgx,
            revalidate,
            hasGetInitialPropsOnAppJs,
            hasAppJs: !!app,
            pagesPath: path.join(pagesPath, '/'),
            hasLoadLocaleFrom: typeof loadLocaleFrom === 'function',
          },
        },
      })

      return config
    },
  }
}

function pkgDir() {
  try {
    return require('pkg-dir').sync() || process.cwd()
  } catch (e) {
    return process.cwd()
  }
}
