import type { NextConfig } from 'next'
import type { I18nConfig } from '..'
import { hasHOC } from './utils'

export default function nextTranslate(nextConfig: NextConfig = {}): NextConfig {
  const fs = require('fs')
  const path = require('path')
  const test = /\.(tsx|ts|js|mjs|jsx)$/

  // NEXT_TRANSLATE_PATH env is supported both relative and absolute path
  const dir = path.resolve(
    path.relative(pkgDir(), process.env.NEXT_TRANSLATE_PATH || '.')
  )

  let {
    loadLocaleFrom,
    localesToIgnore,
    pages,
    logger,
    loggerEnvironment,
    staticsHoc,
    extensionsRgx,
    loader = true,
    logBuild,
    revalidate,
    pagesInDir,
    interpolation,
    keySeparator,
    nsSeparator,
    defaultNS,
    ...restI18n
  } = require(path.join(dir, 'i18n')) as I18nConfig & NextConfig["i18n"]

  let hasGetInitialPropsOnAppJs = false

  // https://github.com/blitz-js/blitz/blob/canary/nextjs/packages/next/build/utils.ts#L54-L59
  if (!pagesInDir) {
    pagesInDir = 'pages'
    if (fs.existsSync(path.join(dir, 'src/pages'))) {
      pagesInDir = 'src/pages'
    } else if (fs.existsSync(path.join(dir, 'app/pages'))) {
      pagesInDir = 'app/pages'
    } else if (fs.existsSync(path.join(dir, 'integrations/pages'))) {
      pagesInDir = 'integrations/pages'
    }
  }

  const pagesPath = path.join(dir, pagesInDir)
  const app = fs
    .readdirSync(pagesPath)
    .find((page: string) => page.startsWith('_app.'))

  if (app) {
    const code = fs.readFileSync(path.join(pagesPath, app)).toString('UTF-8')
    hasGetInitialPropsOnAppJs =
      !!code.match(/\WgetInitialProps\W/g) || hasHOC(code)
  }

  const i18n = {
    ...(nextConfig.i18n || {}),
    ...restI18n,
  }

  return {
    ...nextConfig,
    i18n,
    webpack(conf, options) {
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
            extensionsRgx: extensionsRgx || test,
            revalidate: revalidate || 0,
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
