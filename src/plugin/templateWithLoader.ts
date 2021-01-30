import { overwriteLoadLocales } from './utils'

export default function templateWithLoader(
  rawCode: string,
  {
    page = '',
    typescript = false,
    loader = 'getStaticProps',
    hasLoader = false,
    hasLoadLocaleFrom = false,
  } = {}
) {
  const tokenToReplace = `__CODE_TOKEN_${Date.now().toString(16)}__`
  let modifiedCode = rawCode

  if (hasLoader) {
    modifiedCode = modifiedCode
      // Replacing:
      //    const getStaticProps = () => console.log('getStaticProps')
      //    import getStaticProps from './getStaticProps'
      // To:
      //    const _getStaticProps = () => console.log('getStaticProps')
      //    import _getStaticProps from './getStaticProps'
      .replace(
        new RegExp(
          `(const|var|let|async +function|function|import|import {.* as) +${loader}\\W`
        ),
        (v: string) =>
          v.replace(new RegExp(`\\W${loader}\\W`), (r) =>
            r.replace(loader, '_' + loader)
          )
      )
      // Replacing:
      //    export const _getStaticProps = () => ({ props: {} })
      // To:
      //    const _getStaticProps = () => ({ props: {} })
      .replace(
        new RegExp(
          `export +(const|var|let|async +function|function) +_${loader}`
        ),
        (v: string) => v.replace('export', '')
      )
      // Replacing: "export { getStaticProps }" to ""
      .replace(/export +\{ *(getStaticProps|getServerSideProps)( |,)*\}/, '')
      // Replacing:
      //    export { something, getStaticProps, somethingelse }
      // To:
      //    export { something, somethingelse }
      // And:
      //    export { getStaticPropsFake, somethingelse, b as getStaticProps }
      // To:
      //    export { getStaticPropsFake, somethingelse }
      .replace(
        new RegExp(`^ *export {(.|\n)*${loader}(.|\n)*}`, 'gm'),
        (v: string) => {
          return v
            .replace(new RegExp(`(\\w+ +as +)?${loader}\\W`, 'gm'), (v) =>
              v.endsWith(loader) ? '' : v[v.length - 1]
            )
            .replace(/,( |\n)*,/gm, ',')
            .replace(/{( |\n)*,/gm, '{')
            .replace(/{,( \n)*}/gm, '}')
            .replace(/^ *export +{( |\n)*}\W*$/gm, '')
        }
      )
      // Replacing:
      //    import { something, getStaticProps, somethingelse } from './getStaticProps'
      // To:
      //    import { something, getStaticProps as _getStaticProps, somethingelse } from './getStaticProps'
      .replace(/^ *import +{( |\n)*[^}]*/gm, (v: string) => {
        if (v.match(new RegExp(`\\W+${loader} +as `))) return v
        return v.replace(new RegExp(`\\W+${loader}(\\W|$)`), (r) =>
          r.replace(loader, `${loader} as _${loader}`)
        )
      })
  }

  let template = `
    import __i18nConfig from '@next-translate-root/i18n'
    import __loadNamespaces from 'next-translate/loadNamespaces'
    ${tokenToReplace}
    export async function ${loader}(ctx) {
        ${hasLoader ? `let res = _${loader}(ctx)` : ''}
        ${hasLoader ? `if(typeof res.then === 'function') res = await res` : ''}
        return {
          ${hasLoader ? '...res,' : ''}
          props: {
            ${hasLoader ? '...(res.props || {}),' : ''}
            ...(await __loadNamespaces({
              ...ctx,
              pathname: '${page}',
              loaderName: '${loader}',
              ...__i18nConfig,
              ${overwriteLoadLocales(hasLoadLocaleFrom)}
            }))
          }
        }
    }
  `

  if (typescript) template = template.replace(/\n/g, '\n// @ts-ignore\n')

  return template.replace(tokenToReplace, `\n${modifiedCode}\n`)
}
